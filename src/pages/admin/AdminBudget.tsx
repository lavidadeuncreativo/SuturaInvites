import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import { api } from '../../services/api';
import type { BudgetItem, BudgetStatus } from '../../types';

const CATEGORIES = ['salón', 'iglesia', 'hospedaje', 'foto y video', 'música', 'decoración', 'vestido', 'traje', 'maquillaje', 'flores', 'papelería', 'transporte', 'luna de miel', 'extras'];

const STATUS_LABELS: Record<BudgetStatus, string> = { pendiente: 'Pendiente', pagado: 'Pagado', vencido: 'Vencido' };
const STATUS_COLORS: Record<BudgetStatus, string> = {
  pendiente: '#855A0E', pagado: '#105537', vencido: 'var(--c-wine)',
};

const emptyItem = (): Omit<BudgetItem, 'id'> => ({
  category: 'extras', vendor_name: '', concept: '', total_amount: 0,
  deposit_amount: 0, remaining_amount: 0, due_date: '', recurring_type: 'unico', status: 'pendiente', notes: '',
});

export default function AdminBudget() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [form, setForm] = useState(emptyItem());
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState('all');

  const load = () => api.getBudget().then(setItems);
  useEffect(() => { load(); }, []);

  const filtered = catFilter === 'all' ? items : items.filter(i => i.category === catFilter);

  const total = items.reduce((s, b) => s + b.total_amount, 0);
  const paid = items.filter(b => b.status === 'pagado').reduce((s, b) => s + b.total_amount, 0);
  const pending = items.filter(b => b.status !== 'pagado').reduce((s, b) => s + b.remaining_amount, 0);
  const overdue = items.filter(b => b.status === 'vencido').reduce((s, b) => s + b.remaining_amount, 0);

  const fmt = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

  const openAdd = () => { setForm(emptyItem()); setEditing(null); setModal('add'); };
  const openEdit = (b: BudgetItem) => { setForm({ ...b }); setEditing(b); setModal('edit'); };

  const updateRemaining = (f: typeof form) => ({
    ...f,
    remaining_amount: Math.max(0, f.total_amount - f.deposit_amount),
  });

  const handleSave = async () => {
    setSaving(true);
    if (modal === 'edit' && editing) {
      await api.updateBudgetItem(editing.id, form);
    } else {
      await api.addBudgetItem(form);
    }
    setSaving(false);
    setModal(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este ítem del presupuesto?')) return;
    await api.deleteBudgetItem(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Presupuesto</h1>
        <p>Control financiero de la boda</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-32)' }}>
        <div className="stat-card stat-card--accent">
          <span className="stat-card__label">Total presupuesto</span>
          <span className="stat-card__value" style={{ fontSize: '1.2rem' }}>{fmt(total)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Total pagado</span>
          <span className="stat-card__value" style={{ color: '#105537', fontSize: '1.2rem' }}>{fmt(paid)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Saldo pendiente</span>
          <span className="stat-card__value" style={{ color: '#855A0E', fontSize: '1.2rem' }}>{fmt(pending)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Vencido urgente</span>
          <span className="stat-card__value" style={{ color: 'var(--c-wine)', fontSize: '1.2rem' }}>{fmt(overdue)}</span>
        </div>
      </div>

      <div className="admin-toolbar">
        <select className="form-select" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn btn--primary btn--sm" onClick={openAdd}>+ Agregar ítem</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Proveedor / Concepto</th>
              <th>Total</th>
              <th>Anticipo</th>
              <th>Saldo</th>
              <th>Vence</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', opacity: 0.4, padding: 'var(--space-32)' }}>Sin ítems</td></tr>
            )}
            {filtered.map(b => (
              <tr key={b.id} style={b.status === 'vencido' ? { backgroundColor: 'rgba(77,12,18,0.04)' } : {}}>
                <td>
                  <span className="t-label" style={{ opacity: 0.55 }}>{b.category}</span>
                </td>
                <td>
                  <p style={{ fontWeight: 400 }}>{b.vendor_name}</p>
                  <p style={{ fontSize: '0.75rem', opacity: 0.45 }}>{b.concept}</p>
                </td>
                <td style={{ fontFamily: 'var(--font-serif)' }}>{fmt(b.total_amount)}</td>
                <td style={{ opacity: 0.6 }}>{fmt(b.deposit_amount)}</td>
                <td style={{ fontFamily: 'var(--font-serif)', color: b.remaining_amount > 0 ? '#855A0E' : '#105537' }}>
                  {fmt(b.remaining_amount)}
                </td>
                <td style={{ fontSize: '0.8125rem', opacity: 0.5 }}>
                  {b.due_date ? new Date(b.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—'}
                </td>
                <td>
                  <span style={{
                    display: 'inline-flex', padding: '2px 10px', borderRadius: '100px',
                    fontSize: '0.6875rem', fontFamily: 'var(--font-body)',
                    background: `${STATUS_COLORS[b.status]}15`,
                    color: STATUS_COLORS[b.status],
                  }}>
                    {STATUS_LABELS[b.status]}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => openEdit(b)}>Editar</button>
                    <button className="btn btn--sm" onClick={() => handleDelete(b.id)}
                      style={{ color: 'var(--c-wine)', border: '1px solid rgba(77,12,18,0.2)', borderRadius: 'var(--r-sm)', padding: '4px 8px', fontSize: '0.625rem' }}>
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h2 className="t-heading" style={{ fontSize: '1.1rem' }}>
                {modal === 'add' ? 'Nuevo ítem de presupuesto' : 'Editar ítem'}
              </h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as BudgetStatus })}>
                    {(Object.keys(STATUS_LABELS) as BudgetStatus[]).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Proveedor</label>
                  <input className="form-input" value={form.vendor_name} onChange={e => setForm({ ...form, vendor_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Concepto</label>
                  <input className="form-input" value={form.concept} onChange={e => setForm({ ...form, concept: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Monto total (MXN)</label>
                  <input className="form-input" type="number" min={0} value={form.total_amount}
                    onChange={e => setForm(updateRemaining({ ...form, total_amount: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Anticipo pagado</label>
                  <input className="form-input" type="number" min={0} value={form.deposit_amount}
                    onChange={e => setForm(updateRemaining({ ...form, deposit_amount: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha de vencimiento</label>
                  <input className="form-input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Frecuencia</label>
                  <select className="form-select" value={form.recurring_type} onChange={e => setForm({ ...form, recurring_type: e.target.value as BudgetItem['recurring_type'] })}>
                    <option value="unico">Único</option>
                    <option value="mensual">Mensual</option>
                    <option value="parcialidad">Parcialidad</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Saldo pendiente (calculado)</label>
                <input className="form-input" readOnly value={`$${form.remaining_amount.toLocaleString('es-MX')}`} style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea className="form-textarea" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="btn btn--ghost btn--sm" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn--primary btn--sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
