const { useState: useStateAuth, useEffect: useEffectAuth, useMemo: useMemoAuth } = React;

function FishLogo({ size = 28, mood = "zen" }) {
  const stroke = "currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M6 32 C 14 18, 38 18, 46 32 C 38 46, 14 46, 6 32 Z"
        stroke={stroke} strokeWidth="2" strokeLinejoin="round" fill="none"
      />
      <path
        d="M46 32 L 58 22 L 58 42 Z"
        stroke={stroke} strokeWidth="2" strokeLinejoin="round" fill="none"
      />
      <path d="M16 27 C 18 32, 18 32, 16 37" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      {mood === "zen" ? (
        <path d="M11.5 30 l 3 3 M14.5 30 l -3 3" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <circle cx="13" cy="31.5" r="1.4" fill={stroke} />
      )}
    </svg>
  );
}

function FishSwimmer({ flip, top, size, dur, delay, opacity }) {
  return (
    <div
      className={"fish" + (flip ? " flip" : "")}
      style={{
        top: `${top}%`,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
        opacity,
      }}
    >
      <FishLogo size={size} mood="float" />
    </div>
  );
}

function useCountdown() {
  const [now, setNow] = useStateAuth(() => new Date());
  useEffectAuth(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  let label, target, mode;

  if (isWeekend) {
    const fridayEnd = new Date(now);
    fridayEnd.setDate(fridayEnd.getDate() + (day === 6 ? -1 : -2));
    fridayEnd.setHours(18, 0, 0, 0);
    label = "周末进行中";
    target = fridayEnd;
    mode = "up";
  } else {
    const todayClose = new Date(now);
    todayClose.setHours(18, 0, 0, 0);
    if (now < todayClose) {
      label = "距下班";
      target = todayClose;
      mode = "down";
    } else if (day === 5) {
      label = "周末已开启";
      target = todayClose;
      mode = "up";
    } else {
      const friday = new Date(now);
      const daysToFri = (5 - day + 7) % 7 || 7;
      friday.setDate(friday.getDate() + daysToFri);
      friday.setHours(18, 0, 0, 0);
      label = "距周末";
      target = friday;
      mode = "down";
    }
  }

  let diff = mode === "down" ? target - now : now - target;
  diff = Math.max(0, diff);
  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  const display = d > 0
    ? `${d}天 ${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(h)}:${pad(m)}:${pad(s)}`;

  return { label, display };
}

function CountdownChip() {
  const { label, display } = useCountdown();
  return (
    <div className="countdown" title="不要急，时间会带你回家">
      <span className="cd-dot" />
      <span className="cd-label">{label}</span>
      <span className="cd-time">{display}</span>
    </div>
  );
}

const TICKER_MESSAGES = [
  { who: "工位幽灵", text: "已经第三次假装在调代码了" },
  { who: "周一战神", text: "谁发明的周一，站出来" },
  { who: "咸鱼研究员", text: "我翻面了，还是咸鱼" },
  { who: "茶水间观察家", text: "经理刚去开会，安全" },
  { who: "续命选手", text: "今天第三杯美式，钱包阵亡" },
  { who: "摸鱼CEO", text: "工作是工作的，人生是自己的" },
  { who: "PPT囚犯", text: "改到第28版，灵魂出窍" },
  { who: "下班倒计时人", text: "还有174分钟，但我已经下班了" },
  { who: "电梯刺客", text: "刚和老板尬聊了8层楼" },
  { who: "周报发明者诅咒者", text: "本周工作总结：写本周工作总结" },
];

function Ticker() {
  const [idx, setIdx] = useStateAuth(0);
  useEffectAuth(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TICKER_MESSAGES.length), 3500);
    return () => clearInterval(id);
  }, []);
  const m = TICKER_MESSAGES[idx];
  return (
    <div className="ticker">
      <div className="ticker-label">实时·摸鱼弹幕</div>
      <div className="ticker-stream">
        <div className="ticker-row" key={idx}>
          <span className="who">@{m.who}</span>
          <span>{m.text}</span>
        </div>
      </div>
    </div>
  );
}

function IconWeChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <ellipse cx="9.5" cy="9.5" rx="7" ry="5.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="9" r="0.9" fill="currentColor" />
      <circle cx="12" cy="9" r="0.9" fill="currentColor" />
      <path d="M5 14 L 4 17 L 7 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <ellipse cx="16.5" cy="15" rx="5.5" ry="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.5" cy="14.5" r="0.7" fill="currentColor" />
      <circle cx="18.5" cy="14.5" r="0.7" fill="currentColor" />
      <path d="M20 18 L 21 20.5 L 18.5 19.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function IconQQ() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 3 C 8 3, 6 6, 6 9 C 6 11, 5 12, 4 14 C 3.4 15.2, 4 16, 5 15.5 C 5.6 15.2, 6 15, 6.5 14.6 C 7 16, 8 17, 9 17.5 L 8 20 C 8 21, 9 21, 10 20.5 L 12 19 L 14 20.5 C 15 21, 16 21, 16 20 L 15 17.5 C 16 17, 17 16, 17.5 14.6 C 18 15, 18.4 15.2, 19 15.5 C 20 16, 20.6 15.2, 20 14 C 19 12, 18 11, 18 9 C 18 6, 16 3, 12 3 Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <circle cx="10" cy="9.5" r="0.9" fill="currentColor" />
      <circle cx="14" cy="9.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

function IconWeibo() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <ellipse cx="11" cy="14.5" rx="7.5" ry="5.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="14.5" r="1.6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="9" cy="14.5" r="0.6" fill="currentColor" />
      <path d="M16 6 C 18 6, 20 8, 19.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M16 3.5 C 19.5 3.5, 22 6.2, 21.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function LoginPane({ active, loading, error, onLogin }) {
  const [u, setU] = useStateAuth("");
  const [p, setP] = useStateAuth("");
  const [remember, setRemember] = useStateAuth(true);
  const valid = u.trim().length >= 2 && p.length >= 6;

  return (
    <form className={"pane" + (active ? " is-active" : "")} aria-hidden={!active} onSubmit={(e) => onLogin(e, u, p)}>
      <div className="field">
        <label>用户名</label>
        <input className="input" placeholder="你的摸鱼代号" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
      </div>
      <div className="field">
        <label>密码</label>
        <input className="input" type="password" placeholder="••••••••" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
      </div>
      <div className="helper">
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>记住我（不告老板）</span>
        </label>
        <button type="button">忘了？</button>
      </div>
      {active && error && <div className="auth-error">{error}</div>}
      <button className="cta" disabled={!valid || loading}>{loading ? "潜入中" : "潜  入  社  区"}</button>
    </form>
  );
}

function RegisterPane({ active, loading, error, onRegister }) {
  const [u, setU] = useStateAuth("");
  const [d, setD] = useStateAuth("");
  const [p, setP] = useStateAuth("");
  const [agree, setAgree] = useStateAuth(true);
  const valid = u.trim().length >= 2 && d.trim().length >= 1 && p.length >= 6 && agree;

  const randomNicks = ["午睡冠军", "咸鱼翻身", "工位刺客", "续命专家", "周一受害者", "茶水间常客", "电梯沉默者", "PPT幸存者", "尾款人", "搬砖艺术家"];
  const randomDisplay = () => setD(randomNicks[Math.floor(Math.random() * randomNicks.length)]);

  return (
    <form className={"pane" + (active ? " is-active" : "")} aria-hidden={!active} onSubmit={(e) => onRegister(e, u, d, p)}>
      <div className="row-2">
        <div className="field">
          <label>用户名</label>
          <input className="input" placeholder="唯一标识" value={u} onChange={(e) => setU(e.target.value)} />
        </div>
        <div className="field">
          <label>显示名</label>
          <div style={{ position: "relative" }}>
            <input className="input" style={{ width: "100%", paddingRight: 44 }} placeholder="苏沐" value={d} onChange={(e) => setD(e.target.value)} />
            <button
              type="button"
              onClick={randomDisplay}
              title="随机一个"
              style={{
                position: "absolute", right: 6, top: 6, bottom: 6, width: 34,
                borderRadius: 8, background: "oklch(0 0 0 / 0.25)", color: "var(--ink-2)",
                fontSize: 14,
              }}
            >🎲</button>
          </div>
        </div>
      </div>
      <div className="field">
        <label>密码</label>
        <input className="input" type="password" placeholder="至少 6 位" value={p} onChange={(e) => setP(e.target.value)} />
      </div>
      <div className="helper">
        <label className="check">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>同意《社区公约》：不卷、不Push、不敲钟</span>
        </label>
      </div>
      {active && error && <div className="auth-error">{error}</div>}
      <button className="cta" disabled={!valid || loading}>{loading ? "办证中" : "办  张  鱼  证"}</button>
    </form>
  );
}

function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useStateAuth("login");
  const [loading, setLoading] = useStateAuth(false);
  const [error, setError] = useStateAuth("");
  const tweaks = { theme: "zen", fishCount: 5, showBubbles: true, showTicker: true };

  useEffectAuth(() => {
    document.body.dataset.theme = tweaks.theme;
    return () => { delete document.body.dataset.theme; };
  }, [tweaks.theme]);

  const fishes = useMemoAuth(() => {
    const arr = [];
    for (let i = 0; i < tweaks.fishCount; i++) {
      arr.push({
        top: 12 + Math.random() * 70,
        size: 22 + Math.random() * 18,
        dur: 28 + Math.random() * 20,
        delay: -Math.random() * 30,
        opacity: 0.18 + Math.random() * 0.15,
        flip: Math.random() > 0.5,
        key: i,
      });
    }
    return arr;
  }, [tweaks.fishCount]);

  const bubbles = useMemoAuth(() => {
    const arr = [];
    for (let i = 0; i < 22; i++) {
      arr.push({
        left: Math.random() * 100,
        size: 3 + Math.random() * 6,
        dur: 14 + Math.random() * 18,
        delay: -Math.random() * 30,
        drift: (Math.random() - 0.5) * 80,
        key: i,
      });
    }
    return arr;
  }, []);

  async function handleLogin(e, username, password) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const r = await API.post('/api/auth/login', { username: username.trim(), password });
      API.setToken(r.access_token, r.refresh_token);
      onSuccess(r.user);
    } catch (err) {
      setError(err.message || "用户名或密码错误");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e, username, displayName, password) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const r = await API.post('/api/auth/register', {
        username: username.trim(),
        display_name: displayName.trim(),
        password,
      });
      API.setToken(r.access_token, r.refresh_token);
      onSuccess(r.user);
    } catch (err) {
      setError(err.message || "注册失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="moyu-login-root">
      <div className="stage">
        <div className="moon" />
        <div className="floor" />

        {tweaks.showBubbles && (
          <div className="bubbles">
            {bubbles.map((b) => (
              <span
                key={b.key}
                className="bubble"
                style={{
                  left: `${b.left}%`,
                  width: b.size,
                  height: b.size,
                  animationDuration: `${b.dur}s`,
                  animationDelay: `${b.delay}s`,
                  "--drift": `${b.drift}px`,
                }}
              />
            ))}
          </div>
        )}

        <div className="school">
          {fishes.map((f) => (
            <FishSwimmer key={f.key} {...f} />
          ))}
        </div>

        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" style={{ color: "var(--accent)" }}>
              <FishLogo size={26} mood="zen" />
            </div>
            <div>
              <div className="brand-name">摸 鱼 社 区</div>
              <div className="brand-tag">MO·YU · est. 2026</div>
            </div>
          </div>
          <CountdownChip />
        </header>

        <main className="compose">
          <section className="lede">
            <div className="kicker">
              <span className="bar" />
              <span>CHAPTER · 00</span>
            </div>
            <h1>
              认 真 <em className="em">摸 鱼</em>，<br/>
              轻 松 上 班<span className="small">— 一个允许你在线发呆的社区</span>
            </h1>
            <p>
              这里没有OKR、没有钉钉@全体、没有"在吗"开头的消息。<br/>
              只有一群同样不想打开Excel的人，和一些可有可无的话题。<br/>
              进来，找一片角落，把咸鱼翻个面就好。
            </p>
            {tweaks.showTicker && <Ticker />}
          </section>

          <section className="auth">
            <div className="float-fish" style={{ color: "var(--accent)" }}>
              <FishLogo size={110} mood="zen" />
            </div>

            <div className="tabs" data-mode={mode} role="tablist">
              <span className="tab-thumb" />
              <button className={"tab" + (mode === "login" ? " is-active" : "")} type="button" onClick={() => { setMode("login"); setError(""); }}>登 录</button>
              <button className={"tab" + (mode === "register" ? " is-active" : "")} type="button" onClick={() => { setMode("register"); setError(""); }}>注 册</button>
            </div>

            <LoginPane active={mode === "login"} loading={loading} error={error} onLogin={handleLogin} />
            <RegisterPane active={mode === "register"} loading={loading} error={error} onRegister={handleRegister} />

            <div className="divider">或 用 以 下 方 式</div>
            <div className="socials">
              <button className="social" type="button" title="微信"><IconWeChat /><span>微信</span></button>
              <button className="social" type="button" title="QQ"><IconQQ /><span>QQ</span></button>
              <button className="social" type="button" title="微博"><IconWeibo /><span>微博</span></button>
            </div>

            <div className="footnote">
              登录即表示你不是HR · 不是猎头 · 不是来卷的
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen });
