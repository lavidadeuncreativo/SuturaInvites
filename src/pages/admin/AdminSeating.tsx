import React, { useEffect, useState, useRef, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../components/admin/AdminLayout.css';
import './AdminSeating.css';
import { api } from '../../services/api';
import type { LayoutItem, LayoutItemType, Guest, ElementShape, Chair } from '../../types';

const CM_TO_PX = 0.5; // 1cm = 0.5px (Scale 1:50)
const GRID = 10; // 20cm grid

interface itemTemplate {
  type: LayoutItemType;
  label: string;
  w_cm: number;
  h_cm: number;
  shape: ElementShape;
  color: string;
}

const TEMPLATES: itemTemplate[] = [
  { type: 'table_round', label: 'Mesa Circular (1.5m)', w_cm: 150, h_cm: 150, shape: 'circle', color: '#EDE8D5' },
  { type: 'table_round', label: 'Mesa Circular (1.8m)', w_cm: 180, h_cm: 180, shape: 'circle', color: '#EDE8D5' },
  { type: 'table_rect', label: 'Mesa Rect. (2.4m x 1.2m)', w_cm: 240, h_cm: 120, shape: 'rect', color: '#EDE8D5' },
  { type: 'dance_floor', label: 'Pista de Baile', w_cm: 500, h_cm: 400, shape: 'rect', color: 'rgba(77,12,18,0.06)' },
  { type: 'stage', label: 'Escenario', w_cm: 400, h_cm: 200, shape: 'rect', color: 'rgba(30,16,15,0.08)' },
  { type: 'bar', label: 'Barra de Bebidas', w_cm: 300, h_cm: 80, shape: 'rect', color: 'rgba(133,90,14,0.08)' },
];

function generateChairs(shape: ElementShape, w_cm: number, _h_cm: number, count: number): Chair[] {
  const chairs: Chair[] = [];
  if (shape === 'circle') {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 360;
      chairs.push({ id: `c-${Date.now()}-${i}`, label: `${i + 1}`, rotation: angle });
    }
  } else if (shape === 'rect' || shape === 'square') {
    // Basic logic for rect: split count between all sides
    // For now, let's just place them in a line for simplicity or a simple offset
    for (let i = 0; i < count; i++) {
      chairs.push({ id: `c-${Date.now()}-${i}`, label: `${i + 1}`, rotation: 0 });
    }
  }
  return chairs;
}

export default function AdminSeating() {
  const [items, setItems] = useState<LayoutItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [canvasMeters, setCanvasMeters] = useState({ w: 20, h: 15 }); // 20m x 15m
  const [zoom, setZoom] = useState(1);
  const [saved, setSaved] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getLayout().then(setItems);
  }, []);

  const snap = (v: number) => Math.round(v / GRID) * GRID;

  const addItem = (tpl: itemTemplate) => {
    const newItem: LayoutItem = {
      id: `li-${Date.now()}`,
      type: tpl.type,
      shape: tpl.shape,
      x: 100, y: 100,
      width: tpl.w_cm * CM_TO_PX,
      height: tpl.h_cm * CM_TO_PX,
      width_cm: tpl.w_cm,
      height_cm: tpl.h_cm,
      rotation: 0,
      label: tpl.label.split(' (')[0],
      capacity: tpl.type.startsWith('table') ? 10 : 0,
      assigned_guests: [],
      chairs: tpl.type.startsWith('table') ? generateChairs(tpl.shape, tpl.w_cm, tpl.h_cm, 10) : [],
      notes: '',
      color: tpl.color
    };
    setItems(prev => [...prev, newItem]);
    setSelected(newItem.id);
  };

  const updateItem = (id: string, updates: Partial<LayoutItem>) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, ...updates };
      // If dimensions change, update pixel sizes and regenerate chairs
      if (updates.width_cm || updates.height_cm || updates.capacity) {
        updated.width = (updates.width_cm || i.width_cm) * CM_TO_PX;
        updated.height = (updates.height_cm || i.height_cm) * CM_TO_PX;
        if (i.type.startsWith('table')) {
          updated.chairs = generateChairs(updated.shape, updated.width_cm, updated.height_cm, updated.capacity);
        }
      }
      return updated;
    }));
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelected(id);
    const item = items.find(i => i.id === id)!;
    
    // Scale the client coordinates based on zoom
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragging({ id, ox: e.clientX - item.x * zoom, oy: e.clientY - item.y * zoom });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    const nx = snap((e.clientX - dragging.ox) / zoom);
    const ny = snap((e.clientY - dragging.oy) / zoom);
    updateItem(dragging.id, { x: nx, y: ny } as any);
  }, [dragging, zoom]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleSave = async () => {
    await api.saveLayout(items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(canvasRef.current, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      useCORS: true
    });
    const link = document.createElement('a');
    link.download = `plano-boda-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const selectedItem = items.find(i => i.id === selected);
  const canvasW = canvasMeters.w * 100 * CM_TO_PX;
  const canvasH = canvasMeters.h * 100 * CM_TO_PX;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Plano del Salón (Pro)</h1>
        <p>Escala 1:50 (1px = 2cm) · Administra medidas reales y asignación de asientos.</p>
      </div>

      <div className="seating-pro">
        <div className="seating-pro__sidebar">
          {/* Canvas Settings */}
          <div className="seating-panel">
            <h3 className="t-label" style={{ marginBottom: '12px' }}>Dimensión del Lienzo</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ancho (m)</label>
                <input className="form-input" type="number" value={canvasMeters.w} onChange={e => setCanvasMeters({ ...canvasMeters, w: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Largo (m)</label>
                <input className="form-input" type="number" value={canvasMeters.h} onChange={e => setCanvasMeters({ ...canvasMeters, h: Number(e.target.value) })} />
              </div>
            </div>
          </div>

          {/* Add Elements */}
          <div className="seating-panel">
            <h3 className="t-label" style={{ marginBottom: '12px' }}>Agregar Elementos</h3>
            <div className="seating-templates">
              {TEMPLATES.map((tpl, i) => (
                <button key={i} className="seating-tpl-btn" onClick={() => addItem(tpl)}>
                  <span className="seating-tpl-btn__shape" style={{ borderRadius: tpl.shape === 'circle' ? '50%' : '2px' }} />
                  <span className="t-body" style={{ fontSize: '0.75rem' }}>{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Inspector */}
          {selectedItem && (
            <div className="seating-panel seating-inspector reveal-up">
              <h3 className="t-label" style={{ marginBottom: '16px', color: 'var(--c-wine)' }}>Inspector de Elemento</h3>
              
              <div className="form-group">
                <label className="form-label">Nombre / Referencia</label>
                <input className="form-input" value={selectedItem.label} onChange={e => updateItem(selectedItem.id, { label: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ancho (cm)</label>
                  <input className="form-input" type="number" value={selectedItem.width_cm} onChange={e => updateItem(selectedItem.id, { width_cm: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Largo (cm)</label>
                  <input className="form-input" type="number" value={selectedItem.height_cm} onChange={e => updateItem(selectedItem.id, { height_cm: Number(e.target.value) })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Forma</label>
                <select className="form-select" value={selectedItem.shape} onChange={e => updateItem(selectedItem.id, { shape: e.target.value as ElementShape })}>
                  <option value="circle">Círculo</option>
                  <option value="rect">Rectángulo</option>
                  <option value="square">Cuadrado</option>
                  <option value="capsule">Cápsula</option>
                </select>
              </div>

              {selectedItem.type.startsWith('table') && (
                <div className="form-group">
                  <label className="form-label">Capacidad (Sillas)</label>
                  <input className="form-input" type="number" value={selectedItem.capacity} onChange={e => updateItem(selectedItem.id, { capacity: Number(e.target.value) })} />
                </div>
              )}

              <button className="btn btn--sm btn--ghost" style={{ width: '100%', color: 'var(--c-wine)', marginTop: '12px' }} onClick={() => {
                setItems(prev => prev.filter(i => i.id !== selectedItem.id));
                setSelected(null);
              }}>
                Eliminar Elemento
              </button>
            </div>
          )}

          <button className="btn btn--primary" style={{ width: '100%', marginTop: 'auto' }} onClick={handleSave}>
            {saved ? '✓ Guardado' : 'Guardar Plano'}
          </button>
        </div>

        <div className="seating-pro__canvas-wrap">
          <div className="canvas-zoom-controls">
             <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}>−</button>
             <span className="t-label">{Math.round(zoom * 100)}%</span>
             <button onClick={() => setZoom(z => Math.min(2, z + 0.1))}>+</button>
             <button className="btn btn--sm btn--outline" onClick={handleExport} style={{ marginLeft: '12px' }}>Exportar PNG</button>
          </div>

          <div 
            ref={canvasRef}
            className="seating-canvas shadow-luxury" 
            style={{ 
              width: canvasW, 
              height: canvasH,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
            onClick={(e) => {
              // Only deselect if clicking exactly the canvas background
              if (e.target === e.currentTarget) setSelected(null);
            }}
          >
            {/* Real scale grid */}
            <svg className="seating-grid-svg" width="100%" height="100%">
              <defs>
                <pattern id="grid-pro" width={50} height={50} patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(30,16,15,0.05)" strokeWidth="1"/>
                  <path d="M 25 0 L 25 25 L 0 25" fill="none" stroke="rgba(30,16,15,0.02)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pro)" />
            </svg>

            {items.map(item => {
              const isSelected = selected === item.id;
              return (
                <div
                  key={item.id}
                  className={`seating-el ${isSelected ? 'seating-el--selected' : ''}`}
                  style={{
                    left: item.x, top: item.y,
                    width: item.width, height: item.height,
                    backgroundColor: item.color,
                    borderRadius: item.shape === 'circle' ? '50%' : item.shape === 'capsule' ? '100px' : '4px',
                    transform: `rotate(${item.rotation}deg)`,
                    cursor: dragging?.id === item.id ? 'grabbing' : 'grab',
                  }}
                  onMouseDown={e => handleMouseDown(e, item.id)}
                >
                  <div className="seating-el__info">
                    <span className="seating-el__label">{item.label}</span>
                    <span className="seating-el__ms">{item.width_cm}x{item.height_cm}cm</span>
                  </div>

                  {/* Chairs */}
                  {item.chairs?.map((chair) => (
                    <div 
                      key={chair.id} 
                      className="seating-chair"
                      style={{
                        transform: `rotate(${chair.rotation}deg) translateY(-${(item.width/2) + 10}px)`
                      }}
                    >
                      <div className="seating-chair__dot" />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          
          <div className="seating-controls">
            <span className="t-label">1m = 50px</span>
            <div className="seating-legend">
              <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#EDE8D5' }} />Mesas</span>
              <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: 'rgba(77,12,18,0.1)' }} />Baile</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
