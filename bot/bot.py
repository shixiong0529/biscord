import asyncio
import json
import logging
import os

os.environ.setdefault("NO_PROXY", "localhost,127.0.0.1")

import httpx
import websockets
from openai import AsyncOpenAI

from config import (
    API_BASE, WS_BASE,
    BOT_USERNAME, BOT_PASSWORD, BOT_DISPLAY_NAME,
    DEEPSEEK_API_KEY, CHANNEL_IDS, HISTORY_LIMIT, SYSTEM_PROMPT,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("bot")

_state: dict = {"access_token": None, "refresh_token": None, "user_id": None}

deepseek = AsyncOpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

# 每个频道独立的对话历史 {channel_id: [{"role": ..., "content": ...}]}
histories: dict[int, list] = {}


# ── 认证 ──────────────────────────────────────────────────────────────────────

async def login(client: httpx.AsyncClient) -> None:
    r = await client.post(f"{API_BASE}/api/auth/login",
                          json={"username": BOT_USERNAME, "password": BOT_PASSWORD})
    if r.status_code == 401:
        log.info("Bot account not found, registering...")
        r = await client.post(f"{API_BASE}/api/auth/register",
                              json={"username": BOT_USERNAME,
                                    "display_name": BOT_DISPLAY_NAME,
                                    "password": BOT_PASSWORD})
        r.raise_for_status()
        log.info("Registered. Please add the bot to the target server, then restart.")
    r.raise_for_status()
    data = r.json()
    _state["access_token"] = data["access_token"]
    _state["refresh_token"] = data["refresh_token"]
    _state["user_id"] = data["user"]["id"]
    log.info(f"Logged in: user_id={_state['user_id']} display_name={BOT_DISPLAY_NAME}")


async def refresh_token(client: httpx.AsyncClient) -> None:
    r = await client.post(f"{API_BASE}/api/auth/refresh",
                          json={"refresh_token": _state["refresh_token"]})
    r.raise_for_status()
    _state["access_token"] = r.json()["access_token"]
    log.info("Token refreshed")


# ── DeepSeek ──────────────────────────────────────────────────────────────────

async def ask_deepseek(channel_id: int, user_display: str, question: str) -> str:
    hist = histories.setdefault(channel_id, [])

    # 特殊指令：重置上下文
    if question.strip() == "/reset":
        hist.clear()
        return "好的，对话上下文已重置 👌"

    hist.append({"role": "user", "content": f"{user_display}: {question}"})
    if len(hist) > HISTORY_LIMIT * 2:
        hist[:] = hist[-HISTORY_LIMIT * 2:]

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + hist
    try:
        resp = await deepseek.chat.completions.create(
            model="deepseek-chat",
            messages=messages,
            max_tokens=1024,
        )
        answer = resp.choices[0].message.content.strip()
        hist.append({"role": "assistant", "content": answer})
        return answer
    except Exception as e:
        log.error(f"DeepSeek error: {e}")
        return "（AI 暂时无响应，请稍后再试 🔧）"


# ── 发消息 ────────────────────────────────────────────────────────────────────

async def send_message(channel_id: int, content: str,
                       reply_to_id: int | None, client: httpx.AsyncClient) -> None:
    headers = {"Authorization": f"Bearer {_state['access_token']}"}
    body = {"content": content, "reply_to_id": reply_to_id}
    r = await client.post(f"{API_BASE}/api/channels/{channel_id}/messages",
                          json=body, headers=headers)
    if r.status_code == 401:
        await refresh_token(client)
        headers["Authorization"] = f"Bearer {_state['access_token']}"
        r = await client.post(f"{API_BASE}/api/channels/{channel_id}/messages",
                              json=body, headers=headers)
    if not r.is_success:
        log.error(f"send_message failed: {r.status_code} {r.text}")


# ── WebSocket 监听 ─────────────────────────────────────────────────────────────

async def watch_channel(channel_id: int, client: httpx.AsyncClient) -> None:
    mention = f"@{BOT_DISPLAY_NAME}"
    while True:
        try:
            uri = f"{WS_BASE}/ws/channel/{channel_id}"
            async with websockets.connect(uri) as ws:
                await ws.send(json.dumps({"type": "auth", "token": _state["access_token"]}))
                ack = json.loads(await ws.recv())
                if ack.get("type") != "auth.ok":
                    log.warning(f"Channel {channel_id} auth failed: {ack}")
                    await asyncio.sleep(5)
                    continue
                log.info(f"Watching channel {channel_id}")

                async for raw in ws:
                    event = json.loads(raw)
                    if event.get("type") != "message.new":
                        continue
                    msg = event["data"]
                    if msg["author"]["id"] == _state["user_id"]:
                        continue
                    if mention not in msg["content"]:
                        continue

                    question = msg["content"].replace(mention, "").strip() or "你好"
                    log.info(f"[ch{channel_id}] @mention from {msg['author']['display_name']}: {question}")

                    answer = await ask_deepseek(channel_id, msg["author"]["display_name"], question)
                    await send_message(channel_id, answer, reply_to_id=msg["id"], client=client)

        except websockets.exceptions.ConnectionClosed:
            log.warning(f"Channel {channel_id} disconnected, retrying in 5s...")
            await asyncio.sleep(5)
        except Exception as e:
            log.error(f"Channel {channel_id} error: {e}, retrying in 10s...")
            await asyncio.sleep(10)


# ── 获取管理员服务器的文字频道 ────────────────────────────────────────────────

async def get_admin_server_channels(client: httpx.AsyncClient) -> list[int]:
    headers = {"Authorization": f"Bearer {_state['access_token']}"}
    r = await client.get(f"{API_BASE}/api/servers", headers=headers)
    r.raise_for_status()
    servers = r.json()
    target = next((s for s in servers if "管理员" in s.get("name", "")), None)
    if not target:
        raise RuntimeError(
            "Bot 未加入管理员服务器。\n"
            "请先用管理员账号生成邀请码，再用 bot 账号调 POST /api/servers/join 加入，\n"
            "或在 .env 中手动填写 CHANNEL_IDS=<id1>,<id2>"
        )
    r2 = await client.get(f"{API_BASE}/api/servers/{target['id']}/channels", headers=headers)
    r2.raise_for_status()
    ids = [
        ch["id"]
        for group in r2.json()
        for ch in group.get("items", [])
        if ch.get("kind", "text") == "text"
    ]
    log.info(f"Found {len(ids)} text channel(s) in '{target['name']}'")
    return ids


# ── 入口 ──────────────────────────────────────────────────────────────────────

async def main() -> None:
    async with httpx.AsyncClient() as client:
        await login(client)
        channel_ids = CHANNEL_IDS or await get_admin_server_channels(client)
        log.info(f"Watching channels: {channel_ids}")
        await asyncio.gather(*[watch_channel(cid, client) for cid in channel_ids])


if __name__ == "__main__":
    asyncio.run(main())
