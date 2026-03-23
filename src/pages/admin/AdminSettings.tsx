import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import { api } from '../../services/api';
import type { WeddingSettings } from '../../types';
import { api as messageApi } from '../../services/api';
import type { Message } from '../../types';

export default function AdminSettings() {
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'venues' | 'parents' | 'content' | 'messages'>('general');

  useEffect(() => {
    api.getSettings().then(setSettings);
    messageApi.getMessages().then(setMessages);
  }, []);

  const update = (field: keyof WeddingSettings, val: string | number) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: val });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await api.updateSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleApproveMsg = async (id: string, approved: boolean) => {
    await messageApi.approveMessage(id, approved);
    messageApi.getMessages().then(setMessages);
  };

  const handleDeleteMsg = async (id: string) => {
    await messageApi.deleteMessage(id);
    messageApi.getMessages().then(setMessages);
  };

  if (!settings) return <AdminLayout><div style={{ padding: 'var(--space-32)', opacity: 0.4 }}>Cargando...</div></AdminLayout>;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'venues', label: 'Sedes' },
    { id: 'parents', label: 'Padres' },
    { id: 'content', label: 'Contenido' },
    { id: 'messages', label: `Mensajes (${messages.length})` },
  ] as const;

  return (
    <AdminLayout>
      <div className="admin-page-header" style={{ marginBottom: 'var(--space-24)' }}>
        <h1>Configuración</h1>
        <p>Actualiza el contenido de la invitación en tiempo real</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-32)', flexWrap: 'wrap', borderBottom: '1px solid var(--c-deep-08)', paddingBottom: '1px' }}>
        {tabs.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: 'var(--space-8) var(--space-16)',
              fontFamily: 'var(--font-sc)',
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--c-wine)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--c-wine)' : 'var(--c-deep)',
              opacity: activeTab === tab.id ? 1 : 0.45,
              background: 'transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-panel" style={{ maxWidth: 680 }}>
        <div className="admin-panel__body">

          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
              <h2 className="t-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Información general</h2>
              <div className="form-group">
                <label className="form-label">URL de canción / audio</label>
                <input className="form-input" type="url" value={settings.song_url} onChange={e => update('song_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hora de la ceremonia</label>
                  <input className="form-input" value={settings.ceremony_time} onChange={e => update('ceremony_time', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hora de la recepción</label>
                  <input className="form-input" value={settings.reception_time} onChange={e => update('reception_time', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Capacidad máxima RSVP</label>
                  <input className="form-input" type="number" value={settings.rsvp_max_guests} onChange={e => update('rsvp_max_guests', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email de notificaciones</label>
                  <input className="form-input" type="email" value={settings.notification_email} onChange={e => update('notification_email', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'venues' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)' }}>
              <h2 className="t-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Iglesia / Ceremonia</h2>
              <div className="form-group">
                <label className="form-label">Nombre del lugar</label>
                <input className="form-input" value={settings.ceremony_venue} onChange={e => update('ceremony_venue', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input className="form-input" value={settings.ceremony_address} onChange={e => update('ceremony_address', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">URL de Google Maps</label>
                <input className="form-input" type="url" value={settings.ceremony_maps_url} onChange={e => update('ceremony_maps_url', e.target.value)} />
              </div>
              <div className="ornament-rule" />
              <h2 className="t-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Salón / Recepción</h2>
              <div className="form-group">
                <label className="form-label">Nombre del lugar</label>
                <input className="form-input" value={settings.reception_venue} onChange={e => update('reception_venue', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input className="form-input" value={settings.reception_address} onChange={e => update('reception_address', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">URL de Google Maps</label>
                <input className="form-input" type="url" value={settings.reception_maps_url} onChange={e => update('reception_maps_url', e.target.value)} />
              </div>
            </div>
          )}

          {activeTab === 'parents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
              <h2 className="t-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Padres de Liz</h2>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre del padre</label>
                  <input className="form-input" value={settings.parent_bride_father} onChange={e => update('parent_bride_father', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre de la madre</label>
                  <input className="form-input" value={settings.parent_bride_mother} onChange={e => update('parent_bride_mother', e.target.value)} />
                </div>
              </div>
              <div className="ornament-rule" />
              <h2 className="t-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Padres de Isra</h2>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre del padre</label>
                  <input className="form-input" value={settings.parent_groom_father} onChange={e => update('parent_groom_father', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre de la madre</label>
                  <input className="form-input" value={settings.parent_groom_mother} onChange={e => update('parent_groom_mother', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
              <h2 className="t-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Código de vestimenta</h2>
              <div className="form-group">
                <label className="form-label">Nota especial de vestimenta</label>
                <textarea className="form-textarea" rows={2} value={settings.dress_code_note} onChange={e => update('dress_code_note', e.target.value)} />
              </div>
              <div className="ornament-rule" />
              <h2 className="t-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Mesa de regalos</h2>
              <div className="form-group">
                <label className="form-label">URL Amazon</label>
                <input className="form-input" type="url" value={settings.registry_amazon} onChange={e => update('registry_amazon', e.target.value)} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">URL Mercado Libre</label>
                <input className="form-input" type="url" value={settings.registry_ml} onChange={e => update('registry_ml', e.target.value)} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">URL El Palacio de Hierro</label>
                <input className="form-input" type="url" value={settings.registry_palacio} onChange={e => update('registry_palacio', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
              <h2 className="t-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Mensajes de invitados ({messages.length})</h2>
              {messages.length === 0 && <p className="t-body" style={{ opacity: 0.4 }}>Aún no hay mensajes.</p>}
              {messages.map(m => (
                <div key={m.id} style={{
                  padding: 'var(--space-16)',
                  border: '1px solid var(--c-deep-08)',
                  borderRadius: 'var(--r-md)',
                  background: m.approved ? 'rgba(16,85,55,0.04)' : 'rgba(133,90,14,0.04)',
                  borderLeft: `3px solid ${m.approved ? '#105537' : '#855A0E'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-16)' }}>
                    <div>
                      <p className="t-label" style={{ color: m.approved ? '#105537' : '#855A0E', marginBottom: 'var(--space-4)' }}>
                        {m.approved ? '✓ Publicado' : '⏳ Pendiente'} · {m.guest_name}
                      </p>
                      <p className="t-body" style={{ fontSize: '0.9rem', opacity: 0.75, fontStyle: 'italic' }}>"{m.message}"</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-8)', flexShrink: 0 }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => handleApproveMsg(m.id, !m.approved)}>
                        {m.approved ? 'Ocultar' : 'Aprobar'}
                      </button>
                      <button onClick={() => handleDeleteMsg(m.id)}
                        style={{ color: 'var(--c-wine)', border: '1px solid rgba(77,12,18,0.2)', borderRadius: 'var(--r-sm)', padding: '4px 8px', fontSize: '0.625rem', cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save button */}
          {activeTab !== 'messages' && (
            <div style={{ marginTop: 'var(--space-24)', borderTop: '1px solid var(--c-deep-08)', paddingTop: 'var(--space-20)' }}>
              <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                {saved ? '✓ Cambios guardados' : saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
