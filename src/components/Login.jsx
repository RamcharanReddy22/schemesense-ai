import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }
    const mockUser = { name: email.split('@')[0], email };
    localStorage.setItem('authUser', JSON.stringify(mockUser));
    onLogin(mockUser);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Access your SchemeSense dashboard</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input type="email" placeholder="Email address" value={email} onChange={(e)=>setEmail(e.target.value)} className="login-input" required />
          <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="login-input" required />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn">Sign In</button>
        </form>
        <div className="login-divider">or</div>
        <button className="google-btn" onClick={()=>alert('Google Sign‑In mock – implement real OAuth later')}>
          <span className="google-icon">🌐</span> Sign in with Google
        </button>
      </div>
    </div>
  );
}
