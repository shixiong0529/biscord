import os
from dotenv import load_dotenv

load_dotenv()

BOT_USERNAME = os.environ["BOT_USERNAME"]
BOT_PASSWORD = os.environ["BOT_PASSWORD"]
BOT_DISPLAY_NAME = os.environ["BOT_DISPLAY_NAME"]
LLM_API_KEY  = os.environ["LLM_API_KEY"]
LLM_BASE_URL = os.environ.get("LLM_BASE_URL", "https://api.deepseek.com")
LLM_MODEL    = os.environ.get("LLM_MODEL", "deepseek-chat")
API_BASE = os.environ.get("API_BASE", "http://localhost:8000")
WS_BASE = API_BASE.replace("http://", "ws://").replace("https://", "wss://")
CHANNEL_IDS = [int(x) for x in os.environ.get("CHANNEL_IDS", "").split(",") if x.strip()]
HISTORY_LIMIT = 12
SYSTEM_PROMPT = os.environ.get(
    "SYSTEM_PROMPT",
    "你是摸鱼社区的 AI 助手，风格轻松友好，回答简洁，适当使用中文网络用语。"
)
