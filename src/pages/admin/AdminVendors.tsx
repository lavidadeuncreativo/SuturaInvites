import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import { api } from '../../services/api';
import type { Vendor, VendorContractStatus } from '../../types';

const STATUS_LABELS: Record<VendorContractStatus, string> = {
  cotizando: 'Cotizando', por_confirmar: 'Por confirmar', confirmado: 'Confirmado',
  pagado: 'Pagado', pendiente: 'Pendiente', cancelado: 'Cancelado',
};

const STATUS_COLORS: Record<VendorContractStatus, string> = {
  cotizando: 'rgba(133,90,14,0.12)', por_confirmar: 'rgba(77,12,18,0.1)',
  confirmado: 'rgba(16,85,55,0.1)', pagado: 'rgba(16,85,55,0.2)',
  pendiente: 'rgba(133,90,14,0.1)', cancelado: 'rgba(30,16,15,0.1)',
};

const CATEGORIES = ['foto y video', 'decoración', 'música', 'transporte', 'papelería', 'catering', 'pastel', 'maquillaje', 'flores', 'iluminación', 'otros'];

const emptyVendor = (): Omit<Vendor, 'id'> => ({
  category: 'otros', name: '', contact_name: '', phone: '', email: '',
  contract_status: 'cotizando', payment_status: 'pendiente',
  due_date: '', notes: '', link: '', priority: 'media',
});

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState(emptyVendor());
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState('all');

  const load = () => api.getVendors().then(setVendors);
  useEffect(() => { load(); }, []);

  const filtered = catFilter === 'all' ? vendors : vendors.filter(v => v.category === catFilter);
  const urgent = vendors.filter(v => v.contract_status === 'cotizando' || v.contract_status === 'por_confirmar');

  const openAdd = () => { setForm(emptyVendor()); setEditing(null); setModal('add'); };
  const openEdit = (v: Vendor) => { setForm({ ...v }); setEditing(v); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    if (modal === 'edit' && editing) { await api.updateVendor(editing.id, form); }
    else { await api.addVendor(form); }
    setSaving(false);
    setModal(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    await api.deleteVendor(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Proveedores</h1>
        <p>{vendors.length} proveedores · {vendors.filter(v => v.contract_status === 'confirmado').length} confirmados · {urgent.length} requieren atención</p>
      </div>

      {urgent.length > 0 && (
        <div style={{ marginBottom: 'var(--space-24)', padding: 'var(--space-16) var(--space-20)', backgroundColor: 'rgba(77,12,18,0.06)', border: '1px solid rgba(77,12,18,0.15)', borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--c-wine)' }}>
          <p className="t-label" style={{ color: 'var(--c-wine)', marginBottom: 'var(--space-8)' }}>⚠ Requieren acción inmediata</p>
          <p className="t-body" style={{ fontSize: '0.875rem', opacity: 0.7 }}>
            {urgent.map(v => v.name).join(' · ')}
          </p>
        </div>
      )}

      <div className="admin-toolbar">
        <select className="form-select" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn btn--primary btn--sm" onClick={openAdd}>+ Agregar proveedor</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Categoría</th>
              <th>Contacto</th>
              <th>Estado contrato</th>
              <th>Prioridad</th>
              <th>Vence</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', opacity: 0.4, padding: 'var(--space-32)' }}>Sin proveedores</td></tr>}
            {filtered.map(v => (
              <tr key={v.id}>
                <td>
                  <p style={{ fontWeight: 400 }}>{v.name}</p>
                  {v.notes && <p style={{ fontSize: '0.75rem', opacity: 0.4 }}>{v.notes.slice(0, 40)}{v.notes.length > 40 ? '…' : ''}</p>}
                </td>
                <td><span className="t-label" style={{ opacity: 0.55 }}>{v.category}</span></td>
                <td>
                  <p style={{ fontSize: '0.875rem' }}>{v.contact_name || '—'}</p>
                  <p style={{ fontSize: '0.75rem', opacity: 0.4 }}>{v.phone}</p>
                </td>
                <td>
                  <span style={{
                    display: 'inline-flex', padding: '2px 10px', borderRadius: '100px',
                    fontSize: '0.6875rem', background: STATUS_COLORS[v.contract_status],
                  }}>
                    {STATUS_LABELS[v.contract_status]}
                  </span>
                </td>
                <td>
                  <span style={{
                    fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase',
                    opacity: v.priority === 'alta' ? 1 : 0.5,
                    color: v.priority === 'alta' ? 'var(--c-wine)' : 'var(--c-deep)',
                    fontWeight: v.priority === 'alta' ? 400 : 300,
                  }}>
                    {v.priority}
                  </span>
                </td>
                <td style={{ fontSize: '0.8125rem', opacity: 0.45 }}>
                  {v.due_date ? new Date(v.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => openEdit(v)}>Editar</button>
                    <button className="btn btn--sm" onClick={() => handleDelete(v.id)}
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
              <h2 className="t-heading" style={{ fontSize: '1.1rem' }}>{modal === 'add' ? 'Nuevo proveedor' : 'Editar proveedor'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre del proveedor *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Persona de contacto</label>
                  <input className="form-input" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Estado contrato</label>
                  <select className="form-select" value={form.contract_status} onChange={e => setForm({ ...form, contract_status: e.target.value as VendorContractStatus })}>
                    {(Object.keys(STATUS_LABELS) as VendorContractStatus[]).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Prioridad</label>
                  <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Vendor['priority'] })}>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha límite</label>
                  <input className="form-input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sitio web / Enlace</label>
                  <input className="form-input" type="url" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea className="form-textarea" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
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
