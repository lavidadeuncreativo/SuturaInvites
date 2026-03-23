import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AdminLogin.css';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(password);
    setLoading(false);
    if (ok) {
      navigate('/admin');
    } else {
      setError('Contraseña incorrecta. Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="login-page bg-dark">
      <div className="login-page__grain" />
      <div className="login-card">
        <div className="login-card__monogram">
          <svg viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="rgba(77,12,18,0.3)" strokeWidth="0.75"/>
            <line x1="28" y1="22" x2="28" y2="58" stroke="var(--c-wine)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="22" y1="22" x2="34" y2="22" stroke="var(--c-wine)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="22" y1="58" x2="34" y2="58" stroke="var(--c-wine)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="46" y1="22" x2="46" y2="58" stroke="var(--c-wine)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="46" y1="58" x2="58" y2="58" stroke="var(--c-wine)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="t-script login-card__couple">Isra & Liz</p>
        <h1 className="login-card__title t-heading">Panel privado</h1>
        <p className="login-card__sub t-body">Acceso exclusivo para los novios.</p>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Contraseña</label>
            <input
              id="admin-password"
              className={`form-input ${error ? 'error' : ''}`}
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn--primary login-form__btn" disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <a href="/" className="login-card__back t-label">← Volver a la invitación</a>
      </div>
    </div>
  );
}
