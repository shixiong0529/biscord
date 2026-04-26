/* Auth screen — Discord-homepage style */

const { useState: useStateAuth } = React;

function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useStateAuth('login');
  const [username, setUsername] = useStateAuth('');
  const [displayName, setDisplayName] = useStateAuth('');
  const [password, setPassword] = useStateAuth('' );
  const [error, setError] = useStateAuth('');
  const [loading, setLoading] = useStateAuth(false);

  const isRegister = mode === 'register';
  const canSubmit = username.trim() && password && (!isRegister || displayName.trim());

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading || !canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const path = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { username: username.trim(), display_name: displayName.trim(), password }
        : { username: username.trim(), password };
      const result = await API.post(path, body);
      API.setToken(result.access_token, result.refresh_token);
      onSuccess(result.user);
    } catch (err) {
      setError(err.message || '请检查输入后重试');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError('');
  }

  return (
    <div className="auth-page">
      {/* Floating background shapes */}
      <div className="auth-bg-shapes" aria-hidden="true">
        <div className="auth-shape s1"/>
        <div className="auth-shape s2"/>
        <div className="auth-shape s3"/>
        <div className="auth-shape s4"/>
        <div className="auth-shape s5"/>
      </div>

      {/* Center card */}
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#5865F2"/>
            <path d="M26 11C24.2 10.4 22.2 10 20 10C19.7 10.6 19.3 11.4 19.1 12C16.8 11.7 14.5 11.7 12.2 12C12 11.4 11.6 10.6 11.3 10C9.1 10 7.1 10.4 5.3 11C2.2 16 1.4 20.8 1.8 25.5C4.2 27.3 6.5 28.4 8.8 29.1C9.4 28.3 9.9 27.4 10.4 26.5C9.5 26.1 8.7 25.7 7.9 25.2L8.5 24.7C12.8 26.8 17.5 26.8 21.7 24.7L22.3 25.2C21.5 25.7 20.7 26.1 19.8 26.5C20.3 27.4 20.8 28.3 21.4 29.1C23.7 28.4 26 27.3 28.4 25.5C28.9 20.1 27.4 15.3 26 11ZM12.3 22.5C11 22.5 9.9 21.3 9.9 19.8C9.9 18.3 10.9 17.1 12.3 17.1C13.6 17.1 14.7 18.3 14.7 19.8C14.7 21.3 13.6 22.5 12.3 22.5ZM20 22.5C18.7 22.5 17.6 21.3 17.6 19.8C17.6 18.3 18.6 17.1 20 17.1C21.3 17.1 22.4 18.3 22.4 19.8C22.4 21.3 21.4 22.5 20 22.5Z" fill="white" transform="translate(3, 2) scale(0.85)"/>
          </svg>
          <span className="auth-logo-name">Biscord</span>
        </div>

        <h1 className="auth-title">
          {isRegister ? '创建你的账号' : '欢迎回来！'}
        </h1>
        <p className="auth-subtitle">
          {isRegister ? '加入 Hearth，认识有趣的人和话题。' : '很高兴再次见到你，请登录继续。'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">用户名</label>
            <input
              className="auth-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="demo1"
              autoFocus
              autoComplete="username"
            />
            <div className="auth-hint">3–32 位，仅字母、数字和下划线</div>
          </div>

          {isRegister && (
            <div className="auth-field">
              <label className="auth-label">显示名</label>
              <input
                className="auth-input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="苏沐"
                autoComplete="nickname"
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">密码</label>
            <input
              className="auth-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isRegister ? '至少 6 位' : '••••••••'}
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading || !canSubmit}
          >
            {loading ? '请稍候…' : isRegister ? '注册' : '登录'}
          </button>
        </form>

        <div className="auth-switch">
          {isRegister ? (
            <>已有账号？<button type="button" onClick={() => switchMode('login')}>立即登录</button></>
          ) : (
            <>还没有账号？<button type="button" onClick={() => switchMode('register')}>免费注册</button></>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen });
