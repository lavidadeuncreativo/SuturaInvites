import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AdminLayout.css';

interface NavItem { label: string; path: string; icon: string; }

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: '◈' },
  { label: 'Invitados', path: '/admin/invitados', icon: '◎' },
  { label: 'Invitación', path: '/admin/diseno', icon: '✐' },
  { label: 'Presupuesto', path: '/admin/presupuesto', icon: '◇' },
  { label: 'Proveedores', path: '/admin/proveedores', icon: '◈' },
  { label: 'Plano del salón', path: '/admin/mesas', icon: '⬡' },
  { label: 'Configuración', path: '/admin/configuracion', icon: '◉' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__monogram">
            <svg viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" stroke="rgba(246,243,228,0.2)" strokeWidth="0.5"/>
              <line x1="22" y1="18" x2="22" y2="42" stroke="var(--c-ivory)" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="17" y1="18" x2="27" y2="18" stroke="var(--c-ivory)" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="17" y1="42" x2="27" y2="42" stroke="var(--c-ivory)" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="34" y1="18" x2="34" y2="42" stroke="var(--c-ivory)" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="34" y1="42" x2="44" y2="42" stroke="var(--c-ivory)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="t-script admin-sidebar__couple" style={{ fontSize: '1.5rem', color: 'var(--c-ivory)' }}>Isra & Liz</p>
            <p className="t-label" style={{ color: 'rgba(246,243,228,0.4)', fontSize: '0.5625rem' }}>Panel de administración</p>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav__item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav__icon">{item.icon}</span>
              <span className="admin-nav__label t-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-sidebar__link t-label">
            Ver invitación ↗
          </a>
          <button onClick={handleLogout} className="admin-sidebar__logout t-label">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-topbar__menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menú">
            <span /><span /><span />
          </button>
          <div className="admin-topbar__date t-label">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <Link to="/" target="_blank" className="btn btn--ghost btn--sm" style={{ fontSize: '0.625rem' }}>
            Ver invitación ↗
          </Link>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
