import { useState } from "react";

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();

    // ✅ basic validation
    if (!username.trim() || !password.trim()) return;

    onLogin({
      username: username.trim(),
      password: password.trim()
    });
  };

  return (
    <form className="login-form" onSubmit={submit}>
      <div className="login-form-accent" />

      <div className="login-form-body">

        <div className="input-group">
          <label htmlFor="username">Username</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <UserIcon />
            </span>

            <input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <LockIcon />
            </span>

            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
        </div>

        <button type="submit">
          Sign In
        </button>

      </div>
    </form>
  );
}
