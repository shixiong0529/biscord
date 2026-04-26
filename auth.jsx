/* Auth screen — landscape bg + single-row bar */

const { useState: useStateAuth } = React;

function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useStateAuth('login'); // 'login' | 'register'
  const [username, setUsername] = useStateAuth('');
  const [password, setPassword] = useStateAuth('');
  const [regUsername, setRegUsername] = useStateAuth('');
  const [regDisplayName, setRegDisplayName] = useStateAuth('');
  const [regPassword, setRegPassword] = useStateAuth('');
  const [error, setError] = useStateAuth('');
  const [loading, setLoading] = useStateAuth(false);

  function switchMode(next) { setMode(next); setError(''); }

  async function handleLogin(e) {
    e.preventDefault();
    if (loading || !username.trim() || !password) return;
    setLoading(true); setError('');
    try {
      const r = await API.post('/api/auth/login', { username: username.trim(), password });
      API.setToken(r.access_token, r.refresh_token);
      onSuccess(r.user);
    } catch (err) { setError(err.message || '用户名或密码错误'); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (loading || !regUsername.trim() || !regDisplayName.trim() || !regPassword) return;
    setLoading(true); setError('');
    try {
      const r = await API.post('/api/auth/register', {
        username: regUsername.trim(), display_name: regDisplayName.trim(), password: regPassword,
      });
      API.setToken(r.access_token, r.refresh_token);
      onSuccess(r.user);
    } catch (err) { setError(err.message || '注册失败'); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg"/>
      <div className="auth-top-logo">Biscord</div>

      <div className="auth-bar">
        {mode === 'login' ? (
          <form className="auth-bar-inner" onSubmit={handleLogin}>
            <div className="auth-bar-group">
              <label className="auth-bar-label">用户名</label>
              <input className="auth-bar-input" value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="demo1" autoComplete="username" autoFocus/>
            </div>
            <div className="auth-bar-group">
              <label className="auth-bar-label">密码</label>
              <input className="auth-bar-input" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"/>
            </div>
            <button className="auth-bar-btn primary" type="submit" disabled={loading || !username.trim() || !password}>
              {loading ? '登录中…' : '登录'}
            </button>

            <div className="auth-bar-sep"/>

            <div className="auth-bar-reg-hint">
              <span className="auth-bar-reg-title">还没有账号？</span>
              <span className="auth-bar-reg-sub">加入 Biscord，认识有趣的人。</span>
            </div>
            <button className="auth-bar-btn ghost" type="button" onClick={() => switchMode('register')}>
              免费注册
            </button>
            {error && <div className="auth-bar-error">{error}</div>}
          </form>
        ) : (
          <form className="auth-bar-inner" onSubmit={handleRegister}>
            <div className="auth-bar-group">
              <label className="auth-bar-label">用户名</label>
              <input className="auth-bar-input" value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                placeholder="唯一标识" autoComplete="username" autoFocus/>
            </div>
            <div className="auth-bar-group">
              <label className="auth-bar-label">显示名</label>
              <input className="auth-bar-input" value={regDisplayName}
                onChange={e => setRegDisplayName(e.target.value)}
                placeholder="苏沐" autoComplete="nickname"/>
            </div>
            <div className="auth-bar-group">
              <label className="auth-bar-label">密码</label>
              <input className="auth-bar-input" type="password" value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="至少 6 位" autoComplete="new-password"/>
            </div>
            <button className="auth-bar-btn primary" type="submit"
              disabled={loading || !regUsername.trim() || !regDisplayName.trim() || !regPassword}>
              {loading ? '注册中…' : '创建账号'}
            </button>
            <button className="auth-bar-btn ghost" type="button" onClick={() => switchMode('login')}>
              返回登录
            </button>
            {error && <div className="auth-bar-error">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen });
