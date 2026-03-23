import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Checkout.css';

const PLANS = [
  { id: 'essential', name: 'Essential', price: 1990, desc: 'Invitación + RSVP' },
  { id: 'signature', name: 'Signature', price: 2999, desc: 'Todo incluido + Mesas', featured: true },
  { id: 'pro', name: 'Planner Pro', price: 8990, desc: 'Para profesionales' },
];

export default function Checkout() {
  const [step, setStep] = useState<'plan' | 'payment' | 'project' | 'success'>('plan');
  const [selectedPlan, setSelectedPlan] = useState(() => PLANS[1]);
  const [loading, setLoading] = useState(false);
  const [weddingName, setWeddingName] = useState('');
  const [weddingSlug, setWeddingSlug] = useState('');
  const navigate = useNavigate();

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('project');
    }, 2000);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const project = await api.createProject(weddingName, weddingSlug);
      await api.markAsPaid(project.id);
      setStep('success');
      setTimeout(() => {
        navigate('/admin');
      }, 2500);
    } catch (err) {
      alert('Error creando el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <div className="checkout-logo">Sutura Invites</div>
        <div className="checkout-steps">
          <div className={`step ${step === 'plan' ? 'active' : ''}`}>1. Plan</div>
          <div className={`step ${step === 'payment' ? 'active' : ''}`}>2. Pago</div>
          <div className={`step ${step === 'project' ? 'active' : ''}`}>3. Proyecto</div>
        </div>
      </div>

      <div className="checkout-container">
        {step === 'plan' && (
          <div className="checkout-plan-grid reveal-up">
            <h1 className="checkout-title">Selecciona tu plan</h1>
            <div className="plans-list">
              {PLANS.map(p => (
                <div 
                  key={p.id} 
                  className={`plan-item ${p.featured ? 'featured' : ''}`}
                  onClick={() => handleSelectPlan(p)}
                >
                  <div className="plan-info">
                    <h3>{p.name}</h3>
                    <p>{p.desc}</p>
                  </div>
                  <div className="plan-price">
                    ${p.price.toLocaleString()}<span>MXN</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="checkout-card reveal-up">
            <form onSubmit={handlePayment} className="checkout-form">
              <h1 className="checkout-title">Finalizar compra</h1>
              <p className="checkout-subtitle">Plan {selectedPlan.name} · Un solo pago</p>
              
              <div className="form-group">
                <label>Nombre en la tarjeta</label>
                <input placeholder="Nombre Completo" required />
              </div>

              <div className="form-group">
                <label>Número de tarjeta</label>
                <input placeholder="0000 0000 0000 0000" maxLength={19} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vencimiento</label>
                  <input placeholder="MM / YY" maxLength={5} required />
                </div>
                <div className="form-group">
                  <label>CVC</label>
                  <input placeholder="123" maxLength={3} required />
                </div>
              </div>

              <div className="checkout-summary">
                <div className="summary-row">
                  <span>Licencia vitalicia {selectedPlan.name}</span>
                  <span>${selectedPlan.price.toLocaleString()}.00</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${selectedPlan.price.toLocaleString()}.00 MXN</span>
                </div>
              </div>

              <button className="btn-pay" disabled={loading}>
                {loading ? 'Procesando...' : `Pagar $${selectedPlan.price.toLocaleString()}`}
              </button>
              
              <p className="secure-text">🔒 Pago seguro procesado por Stripe. Cifrado SSL.</p>
            </form>
          </div>
        )}

        {step === 'project' && (
          <div className="checkout-card reveal-up">
            <form onSubmit={handleCreateProject} className="checkout-form">
              <h1 className="checkout-title">¡Compra verificada!</h1>
              <p className="checkout-subtitle">Configura el acceso a tu invitación digital.</p>

              <div className="form-group">
                <label>Nombre de la boda</label>
                <input 
                  placeholder="Ej. Boda de Isra & Liz" 
                  value={weddingName} 
                  onChange={e => setWeddingName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label>URL personalizada</label>
                <div className="url-preview">
                  <span>sutura.com/</span>
                  <input 
                    placeholder="isra-y-liz" 
                    value={weddingSlug} 
                    onChange={e => setWeddingSlug(e.target.value.toLowerCase().replace(/ /g, '-'))}
                    required 
                  />
                </div>
              </div>

              <button className="btn-pay" disabled={loading}>
                {loading ? 'Configurando...' : 'Crear mi panel Sutura'}
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="checkout-success reveal-up">
             <div className="success-check">✓</div>
             <h1>Configuración terminada</h1>
             <p>Estamos redirigiéndote a tu nuevo panel de control...</p>
             <div className="loading-bar"><div className="fill"></div></div>
          </div>
        )}
      </div>
    </div>
  );
}
