import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import { api } from '../../services/api';
import type { Guest, BudgetItem, Vendor } from '../../types';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    api.getGuests().then(setGuests);
    api.getBudget().then(setBudget);
    api.getVendors().then(setVendors);
  }, []);

  const confirmed = guests.filter(g => g.attending_status === 'confirmado').length;
  const pending = guests.filter(g => g.attending_status === 'pendiente').length;
  const declined = guests.filter(g => g.attending_status === 'no_asistira').length;
  const followup = guests.filter(g => g.attending_status === 'seguimiento').length;

  const totalBudget = budget.reduce((s, b) => s + b.total_amount, 0);
  const totalPaid = budget.filter(b => b.status === 'pagado').reduce((s, b) => s + b.total_amount, 0);
  const totalPending = budget.filter(b => b.status === 'pendiente').reduce((s, b) => s + b.remaining_amount, 0);
  const overdue = budget.filter(b => b.status === 'vencido');

  const upcoming = budget
    .filter(b => b.status === 'pendiente' && b.due_date)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 4);

  const recentGuests = [...guests]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const urgentVendors = vendors.filter(v =>
    v.contract_status === 'por_confirmar' || v.contract_status === 'cotizando'
  );

  const fmt = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

  // Budget by category
  const categories = [...new Set(budget.map(b => b.category))];
  const maxCat = Math.max(...categories.map(c => budget.filter(b => b.category === c).reduce((s, b) => s + b.total_amount, 0)));

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>¡Hola, Isra & Liz!</h1>
        <p>Tu boda en Bernal está a <span>256 días</span> · 21 de noviembre, 2026</p>
      </div>

      {/* Main stats */}
      <div className="stats-grid">
        <div className="stat-card stat-card--accent">
          <span className="stat-card__label">Total invitados</span>
          <span className="stat-card__value">{guests.length}</span>
          <span className="stat-card__sub">en lista total</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Confirmados</span>
          <span className="stat-card__value" style={{ color: '#10B981' }}>{confirmed}</span>
          <span className="stat-card__sub">{guests.length > 0 ? Math.round(confirmed / guests.length * 100) : 0}% de asistencia</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Pendientes</span>
          <span className="stat-card__value" style={{ color: '#F59E0B' }}>{pending}</span>
          <span className="stat-card__sub">esperando respuesta</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">No asistirán</span>
          <span className="stat-card__value" style={{ color: '#EF4444' }}>{declined}</span>
          <span className="stat-card__sub">bajas del evento</span>
        </div>
      </div>

      {/* Budget stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-40)' }}>
        <div className="stat-card stat-card--accent">
          <span className="stat-card__label">Presupuesto total</span>
          <span className="stat-card__value" style={{ fontSize: '1.25rem' }}>{fmt(totalBudget)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Pagado</span>
          <span className="stat-card__value" style={{ color: '#105537', fontSize: '1.25rem' }}>{fmt(totalPaid)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Pendiente por pagar</span>
          <span className="stat-card__value" style={{ color: '#855A0E', fontSize: '1.25rem' }}>{fmt(totalPending)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Pagos vencidos</span>
          <span className="stat-card__value" style={{ color: 'var(--c-wine)', fontSize: '1.25rem' }}>{overdue.length}</span>
          <span className="stat-card__sub">requieren atención</span>
        </div>
      </div>

      <div className="admin-two-col">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>

          {/* RSVP recent activity */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">Actividad reciente — RSVPs</h2>
              <Link to="/admin/invitados" className="btn btn--ghost btn--sm">Ver todos</Link>
            </div>
            <div className="admin-table-wrap" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGuests.map(g => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 400 }}>{g.full_name}</td>
                      <td>
                        <span className={`badge ${
                          g.attending_status === 'confirmado' ? 'badge--confirmed'
                          : g.attending_status === 'no_asistira' ? 'badge--declined'
                          : g.attending_status === 'seguimiento' ? 'badge--followup'
                          : 'badge--pending'
                        }`}>
                          {g.attending_status === 'confirmado' ? 'Confirmado'
                            : g.attending_status === 'no_asistira' ? 'No asistirá'
                            : g.attending_status === 'seguimiento' ? 'Seguimiento'
                            : 'Pendiente'}
                        </span>
                      </td>
                      <td style={{ opacity: 0.45, fontSize: '0.8125rem' }}>
                        {new Date(g.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming payments */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">Próximos pagos</h2>
              <Link to="/admin/presupuesto" className="btn btn--ghost btn--sm">Ver presupuesto</Link>
            </div>
            <div className="admin-table-wrap" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 400 }}>{b.vendor_name}</td>
                      <td style={{ opacity: 0.6, fontSize: '0.8125rem' }}>{b.concept}</td>
                      <td style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9375rem' }}>{fmt(b.remaining_amount)}</td>
                      <td style={{ opacity: 0.45, fontSize: '0.8125rem' }}>
                        {b.due_date ? new Date(b.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>

          {/* RSVP visual breakdown */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">Confirmaciones</h2>
            </div>
            <div className="admin-panel__body">
              <div className="mini-bar">
                {[
                  { label: 'Confirmados', val: confirmed, pct: guests.length ? confirmed / guests.length * 100 : 0, color: '#105537' },
                  { label: 'Pendientes', val: pending, pct: guests.length ? pending / guests.length * 100 : 0, color: '#855A0E' },
                  { label: 'No asistirán', val: declined, pct: guests.length ? declined / guests.length * 100 : 0, color: 'var(--c-wine)' },
                  { label: 'Seguimiento', val: followup, pct: guests.length ? followup / guests.length * 100 : 0, color: 'var(--c-deep)' },
                ].map(({ label, val, pct, color }) => (
                  <div key={label} className="mini-bar__row">
                    <span className="mini-bar__label">{label}</span>
                    <div className="mini-bar__track">
                      <div className="mini-bar__fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="mini-bar__val">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget by category */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">Presupuesto por categoría</h2>
            </div>
            <div className="admin-panel__body">
              <div className="mini-bar">
                {categories.slice(0, 7).map(cat => {
                  const total = budget.filter(b => b.category === cat).reduce((s, b) => s + b.total_amount, 0);
                  return (
                    <div key={cat} className="mini-bar__row">
                      <span className="mini-bar__label">{cat}</span>
                      <div className="mini-bar__track">
                        <div className="mini-bar__fill" style={{ width: `${maxCat > 0 ? total / maxCat * 100 : 0}%` }} />
                      </div>
                      <span className="mini-bar__val">{fmt(total)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Urgent vendors */}
          {urgentVendors.length > 0 && (
            <div className="admin-panel" style={{ borderLeft: '3px solid var(--c-wine)' }}>
              <div className="admin-panel__header">
                <h2 className="admin-panel__title" style={{ color: 'var(--c-wine)' }}>Proveedores urgentes</h2>
              </div>
              <div className="admin-panel__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {urgentVendors.map(v => (
                  <div key={v.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.875rem' }}>{v.name}</p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>{v.category} · {v.contract_status.replace('_', ' ')}</p>
                  </div>
                ))}
                <Link to="/admin/proveedores" className="btn btn--outline btn--sm" style={{ marginTop: 'var(--space-8)', justifyContent: 'center' }}>
                  Ver proveedores
                </Link>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {[
              { label: 'Gestionar invitados', to: '/admin/invitados' },
              { label: 'Ver presupuesto completo', to: '/admin/presupuesto' },
              { label: 'Plano del salón', to: '/admin/mesas' },
              { label: 'Configuración', to: '/admin/configuracion' },
            ].map(({ label, to }) => (
              <Link key={to} to={to} className="btn btn--ghost btn--sm" style={{ justifyContent: 'space-between' }}>
                {label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
