import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PublicInvitation.css';
import { api } from '../../services/api';
import type { WeddingSettings, Message, Project } from '../../types';

// ── Wax Seal SVG ──────────────────────────────────────────────
function WaxSeal({ initials }: { initials: string }) {
  return (
    <div className="wax-seal">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 C75 5 95 25 95 50 C95 75 75 95 50 95 C25 95 5 75 5 50 C5 25 25 5 50 5" fill="currentColor" opacity="0.1" />
        <circle cx="50" cy="50" r="42" fill="currentColor" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
        <text x="50" y="62" textAnchor="middle" fill="white" fontFamily="var(--font-script)" fontSize="28" style={{ opacity: 0.9 }}>{initials}</text>
      </svg>
    </div>
  );
}

// ── Monogram SVG animated ─────────────────────────────────────
function MonogramSVG({ dark = true, initials = "IL" }: { dark?: boolean, initials?: string }) {
  return (
    <svg
      className="monogram-svg"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="90" stroke={dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} strokeWidth="0.5" className="monogram-path" strokeDasharray="565" strokeDashoffset="565" />
      <text x="100" y="115" textAnchor="middle" fill={dark ? 'white' : '#1C1917'} fontFamily="var(--font-script)" fontSize="60" className="reveal">{initials}</text>
    </svg>
  );
}

// ── Countdown ─────────────────────────────────────────────────
function Countdown({ date }: { date: string }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(date).getTime();
    if (isNaN(target)) return;

    const update = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [date]);

  return (
    <div className="countdown">
      {[
        { value: time.days, label: 'días' },
        { value: time.hours, label: 'horas' },
        { value: time.minutes, label: 'minutos' },
        { value: time.seconds, label: 'segundos' },
      ].map(({ value, label }) => (
        <div key={label} className="countdown__unit">
          <span className="countdown__number t-heading">{String(value).padStart(2, '0')}</span>
          <span className="countdown__label t-label">{ label }</span>
        </div>
      ))}
    </div>
  );
}

// ── Audio Player ──────────────────────────────────────────────
function AudioPlayer({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); } else { audio.play().catch(() => {}); }
    setPlaying(!playing);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('ended', onEnd); };
  }, []);

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button className="audio-player__btn" onClick={toggle} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}>
        <span style={{ fontSize: '10px' }}>{playing ? '❙❙' : '▶'}</span>
      </button>
      <div className="audio-player__info">
        <span className="audio-player__label t-label" style={{ fontSize: '0.65rem' }}>Música del evento</span>
        <div className="audio-player__track" style={{ height: '2px', background: 'rgba(0,0,0,0.1)', marginTop: '4px' }}>
          <div className="audio-player__progress" style={{ width: `${progress}%`, height: '100%', background: 'currentColor' }} />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function PublicInvitation() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [phase, setPhase] = useState<'intro' | 'envelope' | 'invitation'>('intro');
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [approvedMessages, setApprovedMessages] = useState<Message[]>([]);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  
  const [guestForm, setGuestForm] = useState({
    full_name: '', phone: '', email: '', attending: 'si',
    plus_one_count: 0, companion_names: '', lodging_needed: 'no',
    dietary_notes: '', guest_message: '', confirmed_dresscode: false,
  });

  useEffect(() => {
    if (slug) {
      api.getProjectBySlug(slug).then(p => {
        if (p) {
          setProject(p.project);
          setSettings(p.project.settings);
          setApprovedMessages(p.messages.filter(m => m.approved));
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    const t = setTimeout(() => setPhase('envelope'), 3600);
    return () => clearTimeout(t);
  }, [slug]);

  // Scroll reveal
  useEffect(() => {
    if (phase !== 'invitation') return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    const els = document.querySelectorAll('.reveal');
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [phase]);

  if (loading) return <div className="intro-screen"><p className="t-label">Cargando celebración...</p></div>;
  
  if (!project || !settings) return (
    <div className="intro-screen" style={{ flexDirection: 'column', gap: '20px' }}>
      <p className="t-heading">Celebración no encontrada</p>
      <Link to="/" className="btn btn--outline-light">Ir al inicio</Link>
    </div>
  );

  const handleOpenEnvelope = () => {
    setEnvelopeOpen(true);
    setTimeout(() => setPhase('invitation'), 1800);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.full_name) return;
    setRsvpSubmitted(true);
  };

  const coupleInitials = project.name.split(' & ').map(n => n[0]).join('') || 'IL';

  if (phase === 'intro') {
    return (
      <div className="intro-screen">
        <div className="intro-screen__grain" />
        <div className="intro-screen__content">
          <div className="intro-monogram"><MonogramSVG dark={true} initials={coupleInitials} /></div>
          <p className="intro-names t-script">{project.name}</p>
          <p className="intro-date t-label">21 · Noviembre · 2026</p>
        </div>
      </div>
    );
  }

  if (phase === 'envelope') {
    return (
      <div className="envelope-screen">
        <div className="envelope-screen__overlay" />
        <div className={`tactile-envelope ${envelopeOpen ? 'is-opening' : ''}`} onClick={handleOpenEnvelope}>
          <div className="envelope-texture" />
          <div className="envelope-flap-outer" />
          <div className="envelope-body-outer">
            <div className="envelope-address">
              <span className="t-label">Invitación Exclusiva</span>
              <h3 className="t-script">{project.name}</h3>
            </div>
          </div>
          <WaxSeal initials={coupleInitials} />
          <div className="envelope-instruction">Haz clic para descubrir</div>
        </div>
      </div>
    );
  }

  return (
    <div className="invitation-page">
      <section className="invitation-hero">
        <div className="hero-background-grain" />
        <div className="hero-content">
          <div className="reveal hero-eyebrow">
            <div className="monogram-mini"><MonogramSVG dark={false} initials={coupleInitials} /></div>
            <span className="t-label">ESTAMOS POR CASARNOS</span>
          </div>
          <h1 className="invitation-title reveal reveal--delay-1">
            <span className="name-line">{project.name.split(' & ')[0]}</span>
            <span className="ampersand">&</span>
            <span className="name-line">{project.name.split(' & ')[1]}</span>
          </h1>
          <div className="hero-details reveal reveal--delay-2">
            <p className="t-heading">Sábado 21 de Noviembre, 2026</p>
            <p className="t-label">{settings.ceremony_venue} · Bernal, México</p>
          </div>
          <div className="hero-countdown-wrap reveal reveal--delay-3">
            <Countdown date="2026-11-21T16:00:00" />
          </div>
          <div className="hero-actions-luxury reveal reveal--delay-4">
            <AudioPlayer src={settings.song_url || ''} />
            <a href="#rsvp" className="btn-luxury">Confirmar lugar</a>
          </div>
        </div>
      </section>

      <section className="section bg-dark section--dark" id="messages">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="t-heading">Mensajes Especiales</h2>
          <div className="wishes-grid" style={{ marginTop: '40px' }}>
            {approvedMessages.map(m => (
              <div key={m.id} className="wish-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
                <p className="t-body" style={{ fontStyle: 'italic' }}>"{m.message}"</p>
                <p className="t-label" style={{ marginTop: '10px' }}>— {m.guest_name}</p>
              </div>
            ))}
            {approvedMessages.length === 0 && <p className="t-body" style={{ opacity: 0.5 }}>Aún no hay mensajes aprobados.</p>}
          </div>
        </div>
      </section>

      <section className="section bg-paper" id="rsvp">
        <div className="container--narrow">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="t-heading">Confirmar asistencia</h2>
            <p className="t-body" style={{ opacity: 0.6 }}>Agradecemos tu respuesta antes del 1 de octubre.</p>
          </div>
          {rsvpSubmitted ? (
            <div className="rsvp-success" style={{ textAlign: 'center' }}>¡Gracias por confirmar! ✨</div>
          ) : (
            <form className="rsvp-form" onSubmit={handleRsvpSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input className="form-input" value={guestForm.full_name} onChange={e => setGuestForm({ ...guestForm, full_name: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>Enviar Confirmación</button>
            </form>
          )}
        </div>
      </section>

      <footer className="closing-section bg-dark section--dark">
        <div className="container--narrow" style={{ textAlign: 'center' }}>
          <p className="t-script" style={{ fontSize: '3rem' }}>{project.name}</p>
          <p className="t-label" style={{ opacity: 0.4, marginTop: '20px' }}>Powered by AURA Signature</p>
        </div>
      </footer>
    </div>
  );
}
