import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import './AdminEditor.css';

export default function AdminEditor() {
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'modules'>('colors');
  const [config, setConfig] = useState({
    primaryColor: '#780C12',
    secondaryColor: '#F6F3E4',
    accentColor: '#1E100F',
    serifFont: 'Playfair Display',
    sansFont: 'Inter',
    showItinerary: true,
    showRSVP: true,
    showHotels: true,
  });

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Diseño de Invitación</h1>
        <p>Configura la estética y los módulos activos de tu invitación digital de lujo.</p>
      </div>

      <div className="invitation-editor">
        {/* Sidebar Controls */}
        <aside className="editor-sidebar">
          <nav className="editor-tabs">
            <button className={activeTab === 'colors' ? 'active' : ''} onClick={() => setActiveTab('colors')}>Colores</button>
            <button className={activeTab === 'fonts' ? 'active' : ''} onClick={() => setActiveTab('fonts')}>Tipografía</button>
            <button className={activeTab === 'modules' ? 'active' : ''} onClick={() => setActiveTab('modules')}>Módulos</button>
          </nav>

          <div className="editor-panel reveal-up">
            {activeTab === 'colors' && (
              <div className="editor-group">
                <label className="t-label">Color Principal (Fondo/Sello)</label>
                <div className="color-picker-simple">
                  <input type="color" value={config.primaryColor} onChange={e => setConfig({...config, primaryColor: e.target.value})} />
                  <code>{config.primaryColor}</code>
                </div>
                <label className="t-label" style={{ marginTop: '20px' }}>Color Secundario (Texto/Papel)</label>
                <div className="color-picker-simple">
                  <input type="color" value={config.secondaryColor} onChange={e => setConfig({...config, secondaryColor: e.target.value})} />
                  <code>{config.secondaryColor}</code>
                </div>
              </div>
            )}

            {activeTab === 'fonts' && (
              <div className="editor-group">
                <label className="t-label">Fuente Principal (Serif)</label>
                <select className="form-select" value={config.serifFont} onChange={e => setConfig({...config, serifFont: e.target.value})}>
                  <option>Playfair Display</option>
                  <option>Cormorant Garamond</option>
                  <option>Bodoni Moda</option>
                </select>
                <label className="t-label" style={{ marginTop: '20px' }}>Fuente de Cuerpo (Sans)</label>
                <select className="form-select" value={config.sansFont} onChange={e => setConfig({...config, sansFont: e.target.value})}>
                  <option>Inter</option>
                  <option>Montserrat</option>
                  <option>Work Sans</option>
                </select>
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="editor-group">
                <div className="module-toggle">
                  <span>Mostrar Itinerario</span>
                  <input type="checkbox" checked={config.showItinerary} onChange={e => setConfig({...config, showItinerary: e.target.checked})} />
                </div>
                <div className="module-toggle">
                  <span>Mostrar Hoteles</span>
                  <input type="checkbox" checked={config.showHotels} onChange={e => setConfig({...config, showHotels: e.target.checked})} />
                </div>
                <div className="module-toggle">
                  <span>Activar RSVP</span>
                  <input type="checkbox" checked={config.showRSVP} onChange={e => setConfig({...config, showRSVP: e.target.checked})} />
                </div>
              </div>
            )}
          </div>

          <button className="btn btn--primary" style={{ width: '100%', marginTop: 'auto' }}>Guardar Cambios</button>
        </aside>

        {/* Real-time Preview */}
        <div className="editor-preview">
          <div className="preview-container shadow-luxury" style={{ backgroundColor: config.secondaryColor }}>
             <h4 className="preview-label">VISTA PREVIA EN VIVO</h4>
             <div className="preview-card" style={{ color: config.primaryColor }}>
                <p style={{ fontFamily: config.serifFont, fontSize: '3rem', fontStyle: 'italic', margin: 0 }}>Isra & Liz</p>
                <hr style={{ borderColor: config.primaryColor, opacity: 0.2, margin: '20px 0' }} />
                <p style={{ fontFamily: config.sansFont, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Sábado · 21 · Noviembre · 2026</p>
                
                <div className="preview-modules-list" style={{ marginTop: '40px', opacity: 0.5 }}>
                   {config.showItinerary && <div className="preview-mod">Itinerario ✓</div>}
                   {config.showHotels && <div className="preview-mod">Hospedaje ✓</div>}
                   {config.showRSVP && <div className="preview-mod">Confirmación ✓</div>}
                </div>
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
