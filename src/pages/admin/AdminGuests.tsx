import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import { api } from '../../services/api';
import type { Guest, AttendingStatus } from '../../types';

const STATUS_LABELS: Record<AttendingStatus, string> = {
  confirmado: 'Confirmado',
  pendiente: 'Pendiente',
  no_asistira: 'No asistirá',
  seguimiento: 'Seguimiento',
};

const STATUS_BADGE: Record<AttendingStatus, string> = {
  confirmado: 'badge--confirmed',
  pendiente: 'badge--pending',
  no_asistira: 'badge--declined',
  seguimiento: 'badge--followup',
};

const emptyGuest = (): Omit<Guest, 'id' | 'created_at'> => ({
  full_name: '', phone: '', email: '', attending_status: 'pendiente',
  plus_one_count: 0, companion_names: '', lodging_needed: false,
  dietary_notes: '', guest_message: '', table_assignment: '', admin_notes: '',
});

export default function AdminGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendingStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState(emptyGuest());
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGuests = () => api.getGuests().then(setGuests);
  useEffect(() => { fetchGuests(); }, []);

  const filtered = guests.filter(g => {
    const matchSearch = g.full_name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = statusFilter === 'all' || g.attending_status === statusFilter;
    return matchSearch && matchFilter;
  });

  const openModal = (g?: Guest) => {
    if (g) {
      setFormData({ ...g });
      setEditingGuest(g);
    } else {
      setFormData(emptyGuest());
      setEditingGuest(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingGuest) {
        await api.updateGuest(editingGuest.id, formData);
      } else {
        await api.addGuest(formData);
      }
      setIsModalOpen(false);
      fetchGuests();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás segura de eliminar este invitado?')) return;
    await api.deleteGuest(id);
    fetchGuests();
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newGuests = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || (i === 0 && line.toLowerCase().includes('nombre'))) continue;
        const cols = line.split(',').map(c => c.trim());
        if (cols.length < 1) continue;
        
        newGuests.push({
          full_name: cols[0] || 'Sin Nombre',
          phone: cols[1] || '',
          email: cols[2] || '',
          plus_one_count: parseInt(cols[3]) || 0,
          companion_names: cols[4] || '',
          dietary_notes: cols[5] || '',
          attending_status: 'pendiente' as AttendingStatus,
          lodging_needed: false,
          guest_message: '',
          table_assignment: '',
          admin_notes: 'Importado vía CSV',
        });
      }

      for (const g of newGuests) {
        await api.addGuest(g);
      }
      
      fetchGuests();
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Teléfono', 'Email', 'Estado', 'Acompañantes', 'Hospedaje', 'Dieta', 'Mesa', 'Mensaje', 'Notas'];
    const rows = guests.map(g => [
      g.full_name, g.phone, g.email, STATUS_LABELS[g.attending_status],
      g.companion_names, g.lodging_needed ? 'Sí' : 'No',
      g.dietary_notes, g.table_assignment, g.guest_message, g.admin_notes,
    ].map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`));
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const b = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invitados-boda.csv';
    a.click();
  };

  const confirmedCount = guests.filter(g => g.attending_status === 'confirmado').length;
  const totalAttending = guests.filter(g => g.attending_status === 'confirmado').reduce((s, g) => s + 1 + g.plus_one_count, 0);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Invitados</h1>
        <p>Lista completa · {guests.length} en lista · {confirmedCount} confirmados · {totalAttending} personas totales</p>
        <div className="admin-page-header__actions">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".csv" 
            onChange={handleImportCSV} 
          />
          <button className="btn btn--ghost btn--sm" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? 'Importando...' : 'Importar CSV'}
          </button>
          <button className="btn btn--ghost btn--sm" onClick={exportToCSV}>Exportar CSV</button>
          <button className="btn btn--primary btn--sm" onClick={() => openModal()}>Nuevo Invitado</button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)', maxWidth: '500px', marginBottom: 'var(--space-24)' }}>
        <div className="stat-card"><span className="stat-card__label">Personas totales</span><span className="stat-card__value">{totalAttending}</span></div>
        <div className="stat-card"><span className="stat-card__label">Req. hospedaje</span><span className="stat-card__value">{guests.filter(g => g.lodging_needed).length}</span></div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search" style={{ maxWidth: '300px' }}>
          <span className="admin-search__icon">⌕</span>
          <input placeholder="Buscar por nombre o email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value as AttendingStatus | 'all')}>
          <option value="all">Todos los estados</option>
          {(Object.keys(STATUS_LABELS) as AttendingStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>+1s</th>
              <th>Hospedaje</th>
              <th>Mesa</th>
              <th>Dieta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', opacity: 0.4, padding: 'var(--space-32)' }}>Sin resultados</td></tr>
            )}
            {filtered.map(g => (
              <tr key={g.id}>
                <td>
                  <p style={{ fontWeight: 400 }}>{g.full_name}</p>
                  <p style={{ fontSize: '0.75rem', opacity: 0.45 }}>{g.email}</p>
                </td>
                <td><span className={`badge ${STATUS_BADGE[g.attending_status]}`}>{STATUS_LABELS[g.attending_status]}</span></td>
                <td style={{ textAlign: 'center' }}>{g.plus_one_count}</td>
                <td>{g.lodging_needed ? <span style={{ color: '#105537' }}>Sí</span> : <span style={{ opacity: 0.35 }}>No</span>}</td>
                <td style={{ opacity: g.table_assignment ? 1 : 0.3 }}>{g.table_assignment || '—'}</td>
                <td style={{ fontSize: '0.8125rem', opacity: g.dietary_notes ? 0.7 : 0.3 }}>{g.dietary_notes || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => openModal(g)}>Editar</button>
                    <button className="btn btn--sm" onClick={() => handleDelete(g.id)}
                      style={{ color: 'var(--c-wine)', border: '1px solid rgba(77,12,18,0.2)', borderRadius: 'var(--r-sm)', padding: '4px 10px', fontFamily: 'var(--font-sc)', fontSize: '0.625rem' }}>
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h2 className="t-heading" style={{ fontSize: '1.1rem' }}>{editingGuest ? 'Editar invitado' : 'Agregar invitado'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre completo *</label>
                  <input className="form-input" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={formData.attending_status} onChange={e => setFormData({ ...formData, attending_status: e.target.value as AttendingStatus })}>
                    {(Object.keys(STATUS_LABELS) as AttendingStatus[]).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Número de acompañantes</label>
                  <input className="form-input" type="number" min={0} max={10} value={formData.plus_one_count} onChange={e => setFormData({ ...formData, plus_one_count: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mesa asignada</label>
                  <input className="form-input" value={formData.table_assignment} onChange={e => setFormData({ ...formData, table_assignment: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nombres de acompañantes</label>
                <input className="form-input" value={formData.companion_names} onChange={e => setFormData({ ...formData, companion_names: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Restricciones alimenticias</label>
                <input className="form-input" value={formData.dietary_notes} onChange={e => setFormData({ ...formData, dietary_notes: e.target.value })} />
              </div>
              <div className="form-checkbox-group">
                <input type="checkbox" id="modal-lodging" checked={formData.lodging_needed} onChange={e => setFormData({ ...formData, lodging_needed: e.target.checked })} />
                <label htmlFor="modal-lodging">Requiere hospedaje</label>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="btn btn--ghost btn--sm" onClick={() => setIsModalOpen(false)}>Cancelar</button>
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
