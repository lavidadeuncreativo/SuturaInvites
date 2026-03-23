import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const TESTIMONIALS = [
  {
    quote: "Nuestra boda no hubiera sido lo mismo sin Sutura. Automatizó el 90% del seguimiento manual que nos estaba matando en el mes crítico.",
    author: "Sofía & Mateo",
    location: "CDMX",
    stats: { confirm: "+150", stress: "-80%" },
    avatar: "https://images.unsplash.com/photo-1549471156-52c73d94b31a?auto=format&fit=crop&q=80&w=100&h=100"
  },
  {
    quote: "La herramienta de plano de mesas es increíble. Pudimos visualizar todo el salón y asignar asientos en una tarde. ¡Súper profesional!",
    author: "Valeria & Diego",
    location: "Querétaro",
    stats: { time: "-40hrs", setup: "100%" },
    avatar: "https://images.unsplash.com/photo-1542042161784-26ab9e041e89?auto=format&fit=crop&q=80&w=100&h=100"
  },
  {
    quote: "Buscábamos algo que no pareciera hecho en Canva. Sutura nos dio la elegancia editorial que nuestra boda merecía. 10/10.",
    author: "Ana & Carlos",
    location: "Guadalajara",
    stats: { design: "Elite", feedback: "Top" },
    avatar: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=100&h=100"
  }
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handle);
    
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
    }, 4000);

    return () => {
      window.removeEventListener('scroll', handle);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="lp">
      {/* Header */}
      <header className={`lp-header ${scrolled ? 'lp-header--scrolled' : ''}`}>
        <div className="lp-container">
          <div className="lp-logo">Sutura Invites</div>
          <nav className="lp-nav">
            <div className="lp-nav-links">
              <a href="#features">Funciones</a>
              <a href="#pricing">Tarifas</a>
            </div>
            <div className="lp-header-btns">
              <Link to="/admin/login" className="lp-login-link">Iniciar sesión</Link>
              <Link to="/checkout" className="btn-saas btn-saas--primary">Obtén acceso ahora</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="lp-hero">
        <div className="lp-container">
          <div className="lp-hero-grid">
            <div className="lp-hero-text">
              <div className="lp-hero-badge">
                <span>¿Ya tienes acceso?</span>
                <Link to="/admin/login">Inicia sesión →</Link>
              </div>
              <h1 className="lp-hero-title">
                Planear tu boda <br />
                no tiene que <br />
                <span>ser un caos.</span>
              </h1>
              <p className="lp-hero-description">
                La plataforma definitiva para parejas que buscan excelencia. <br />
                Invitaciones digitales de lujo y gestión inteligente en un solo lugar.
              </p>
              <div className="lp-hero-actions">
                <Link to="/checkout" className="btn-saas btn-saas--primary btn-saas--lg">Obtén acceso ahora</Link>
                <Link to="/isra-y-liz" className="btn-saas btn-saas--outline btn-saas--lg">Ver demo interactivo</Link>
              </div>
              <div className="lp-hero-social-proof">
                <div className="lp-social-avatars">
                  <img src="https://i.pravatar.cc/40?img=1" alt="u1" />
                  <img src="https://i.pravatar.cc/40?img=2" alt="u2" />
                  <img src="https://i.pravatar.cc/40?img=3" alt="u3" />
                </div>
                <span>+850 parejas satisfechas | 4.9/5 satisfacción</span>
              </div>
            </div>
            <div className="lp-hero-image">
              <div className="phone-mockup-wrap">
                <img 
                  src="/Users/queridocava/.gemini/antigravity/brain/8c47b722-1396-404e-8389-341e9b51c807/sutura_phone_mockup_invitation_1773273830723.png" 
                  alt="Sutura Premium App" 
                  className="hero-phone-img"
                />
                <div className="hero-floating-card hero-floating-card--1">
                  <span>●</span> 12 Nuevas Confirmaciones
                </div>
                <div className="hero-floating-card hero-floating-card--2">
                  <span>●</span> Plano de mesa actualizado
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Social Proof heading */}
      <section className="lp-benefits-strip">
        <div className="lp-container">
          <h2 className="lp-strip-title">Diseñado para que disfruten el proceso, <br /> no solo el resultado.</h2>
          <p className="lp-strip-subtitle">Centralizamos la comunicación para que tú y tu pareja hablen el mismo idioma técnico y estético.</p>
        </div>
      </section>

      {/* Customization Lottie-style blocks */}
      <section id="features" className="lp-features-bento">
        <div className="lp-container">
          <div className="bento-grid">
            <div className="bento-item bento-item--large bento-item--dark">
              <div className="bento-content">
                <div className="animation-mock-wrap">
                  <div className="css-lottie-color">
                    <div className="color-bubble" style={{ background: '#780C12' }}></div>
                    <div className="color-bubble" style={{ background: '#F6F3E4' }}></div>
                    <div className="color-bubble" style={{ background: '#1E100F' }}></div>
                  </div>
                </div>
                <h4>PERSONALIZACIÓN</h4>
                <h3>100% Customizable</h3>
                <p>Define tu paleta de colores, tipografías editoriales y música. Sutura no es una plantilla, es un lienzo para tu visión.</p>
              </div>
            </div>
            <div className="bento-item">
              <div className="bento-content">
                <div className="animation-mock-wrap">
                  <div className="css-lottie-seating">
                    <div className="table-circle"></div>
                    <div className="table-rect"></div>
                  </div>
                </div>
                <h4>ESPACIOS</h4>
                <h3>Plano del Salón Pro</h3>
                <p>Planos interactivos con medidas reales (cm). Arrastra y suelta con precisión milimétrica.</p>
              </div>
            </div>
            <div className="bento-item">
              <div className="bento-content">
                <div className="animation-mock-wrap">
                  <div className="css-lottie-guests">
                    <div className="guest-line"></div>
                    <div className="guest-line"></div>
                    <div className="guest-line"></div>
                  </div>
                </div>
                <h4>GESTIÓN</h4>
                <h3>RSVP Inteligente</h3>
                <p>Confirmaciones instantáneas con gestión de dietas y restricciones especiales en tiempo real.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Slider */}
      <section className="lp-testimonials-slider">
        <div className="lp-container">
          <div className="slider-wrap">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`slider-slide ${i === activeTestimonial ? 'active' : ''}`}>
                <div className="testimonial-card shadow-luxury">
                  <div className="testimonial-text-side">
                    <p className="quote">"{t.quote}"</p>
                    <div className="author-wrap">
                      <img src={t.avatar} alt={t.author} className="author-avatar" />
                      <div>
                        <p className="author-name">{t.author}</p>
                        <p className="author-loc">{t.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="testimonial-stats-side">
                    {Object.entries(t.stats).map(([label, val]) => (
                      <div key={label} className="stat-box">
                        <span className="stat-val">{val}</span>
                        <span className="stat-label">{label === 'confirm' ? 'Confirmaciones' : label === 'stress' ? 'Menos estrés' : label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="slider-dots">
            {TESTIMONIALS.map((_, i) => (
              <button 
                key={i} 
                className={`dot ${i === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - 3 Tiers */}
      <section id="pricing" className="lp-pricing">
        <div className="lp-container">
          <div className="pricing-header">
            <h2>Invierte en tu tranquilidad.</h2>
            <p>Elige el plan que mejor se adapte a la magnitud de tu celebración.</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="p-tag">Básico</div>
              <h3 className="p-title">Essential</h3>
              <div className="p-price">$1,990<span>MXN</span></div>
              <p className="p-desc">Perfecto para bodas íntimas que solo necesitan la invitación digital.</p>
              <ul className="p-features">
                <li>Invitación interactiva ilimitada</li>
                <li>RSVP automático</li>
                <li>Música y Galería</li>
              </ul>
              <Link to="/checkout" className="btn-saas btn-saas--outline">Empezar ahora</Link>
            </div>

            <div className="pricing-card pricing-card--featured">
              <div className="p-tag p-tag--gold">EL MÁS ELEGIDO</div>
              <h3 className="p-title">Signature</h3>
              <div className="p-price">$2,999<span>MXN</span></div>
              <p className="p-desc">La experiencia completa de Sutura. Control total y personalización absoluta.</p>
              <ul className="p-features">
                <li>Todo en el plan Essential</li>
                <li><strong>Diseñador de Mesas Pro (Escala real)</strong></li>
                <li>Panel de Gestión de Invitados Premium</li>
                <li>Exportación de listas para vendors</li>
              </ul>
              <Link to="/checkout" className="btn-saas btn-saas--primary">Obtén acceso ahora</Link>
            </div>

            <div className="pricing-card">
              <div className="p-tag">PARA EXPERTOS</div>
              <h3 className="p-title">Planner Pro</h3>
              <div className="p-price">$8,990<span>MXN</span></div>
              <p className="p-desc">Diseñado para Wedding Planners que manejan múltiples eventos al año.</p>
              <ul className="p-features">
                <li>Eventos ilimitados por un año</li>
                <li>Marca blanca opcional</li>
                <li>Soporte Prioritario 24/7</li>
                <li>Formación técnica para el equipo</li>
              </ul>
              <Link to="/checkout" className="btn-saas btn-saas--outline">Contacto ventas</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Persuasion CTA */}
      <section className="lp-final-cta">
        <div className="lp-container">
          <div className="final-cta-content">
            <h2>No dejes que los detalles <br /> te quiten la sonrisa.</h2>
            <p>Únete a las más de 800 parejas que ya transformaron el caos en una experiencia editorial inolvidable.</p>
            <div className="final-btn-group">
              <Link to="/checkout" className="btn-saas btn-saas--primary btn-saas--lg">Crea tu invitación ahora</Link>
              <span className="p-guarantee">✓ Garantía de satisfacción Sutura</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="footer-top">
            <div className="f-logo">Sutura Invites</div>
            <div className="f-links">
              <div className="f-col">
                <h4>Producto</h4>
                <a href="#features">Funciones</a>
                <a href="#pricing">Tarifas</a>
                <a href="/isra-y-liz">Demo</a>
              </div>
              <div className="f-col">
                <h4>Legal</h4>
                <a href="#">Términos</a>
                <a href="#">Privacidad</a>
              </div>
              <div className="f-col">
                <h4>Empresa</h4>
                <a href="#">Sobre nosotros</a>
                <a href="#">Contacto</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Sutura Platforms. Elevamos tu boda al nivel de arte.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
