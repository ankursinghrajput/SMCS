import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const roles = [
  { id: 'student', label: 'Student', icon: '📖' },
  { id: 'faculty', label: 'Faculty', icon: '⚙️' },
  { id: 'admin', label: 'Admin', icon: '🛡️' },
];

/* ── purple palette ── */
const PURPLE = '#7c3aed';
const PURPLE_H = '#6d28d9';
const PURPLE_BG = '#f5f3ff';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [activeRole, setActiveRole] = useState('student');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const creds = { role: activeRole, password };
    if (activeRole === 'student') creds.contactNumber = contactNumber;
    else creds.email = email;
    const res = await login(creds);
    if (!res.success) setError(res.message || 'Invalid credentials. Please try again.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Decorative corner flourishes ── */}
      <CornerFlourish position="top-left" />
      <CornerFlourish position="top-right" />
      <CornerFlourish position="bottom-left" />
      <CornerFlourish position="bottom-right" />

      {/* ── Main card ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '72px',
        width: '100%',
        maxWidth: '900px',
        padding: '40px 24px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* ══════════ LEFT — Logo ══════════ */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="/SMCS-removebg-preview.png"
            alt="Sanjeev Memorial Center School"
            style={{
              width: '420px',
              height: '420px',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* ══════════ RIGHT — Form ══════════ */}
        <div style={{ flex: 1, maxWidth: '400px' }}>

          {/* Heading */}
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '6px',
            lineHeight: 1.2,
          }}>
            Welcome to SMCS
          </h1>
          <p style={{
            fontSize: '0.88rem',
            color: '#6b7280',
            marginBottom: '28px',
          }}>
            Sign in to your account to continue
          </p>

          {/* Role tabs */}
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '22px',
          }}>
            {roles.map(r => {
              const active = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  id={`role-tab-${r.id}`}
                  onClick={() => { setActiveRole(r.id); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '9px 6px',
                    borderRadius: '8px',
                    border: active ? 'none' : '1.5px solid #e5e7eb',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    transition: 'all 0.18s ease',
                    background: active ? PURPLE : '#f9fafb',
                    color: active ? '#ffffff' : '#4b5563',
                    boxShadow: active ? `0 2px 10px ${PURPLE}40` : 'none',
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>{r.icon}</span>
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {activeRole === 'student' ? (
              <div>
                <label htmlFor="contact-number" style={labelStyle}>Contact Number</label>
                <input
                  id="contact-number"
                  type="tel"
                  placeholder="your 10-digit number"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = PURPLE; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f3f4f6'; }}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="email" style={labelStyle}>Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = PURPLE; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f3f4f6'; }}
                />
              </div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <span style={{ fontSize: '0.78rem', color: PURPLE, cursor: 'pointer', fontWeight: 500 }}>
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: '42px' }}
                  onFocus={e => { e.target.style.borderColor = PURPLE; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f3f4f6'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#9ca3af', padding: 0, fontSize: '0.9rem',
                  }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fca5a5',
                borderRadius: '8px', padding: '9px 12px',
                fontSize: '0.8rem', color: '#b91c1c',
              }}>
                {error}
              </div>
            )}

            {/* Sign In button */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                background: isLoading ? '#a78bfa' : PURPLE,
                color: '#ffffff',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.96rem',
                fontWeight: 700,
                letterSpacing: '0.01em',
                transition: 'background 0.2s, transform 0.15s',
                boxShadow: `0 4px 14px ${PURPLE}35`,
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = PURPLE_H; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = isLoading ? '#a78bfa' : PURPLE; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              OR CONTINUE WITH
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          {/* Social-style role quick-select buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'student-quick', label: 'Continue as Student', role: 'student', icon: '🎓' },
              { id: 'faculty-quick', label: 'Continue as Faculty', role: 'faculty', icon: '👨‍🏫' },
            ].map(b => (
              <button
                key={b.id}
                id={b.id}
                type="button"
                onClick={() => { setActiveRole(b.role); setError(''); }}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  border: '1.5px solid #e5e7eb',
                  background: activeRole === b.role ? PURPLE_BG : '#f9fafb',
                  color: activeRole === b.role ? PURPLE : '#374151',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.18s ease',
                  borderColor: activeRole === b.role ? '#c4b5fd' : '#e5e7eb',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = PURPLE_BG; e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.color = PURPLE; }}
                onMouseLeave={e => {
                  if (activeRole !== b.role) {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
              >
                <span>{b.icon}</span>
                {b.label}
              </button>
            ))}
          </div>

          {/* Footer */}
          <p style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '0.78rem',
            color: '#9ca3af',
          }}>
            © Sanjeev Memorial Center School
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Decorative corner SVG flourish ── */
function CornerFlourish({ position }) {
  const styles = {
    'top-left': { top: 0, left: 0, transform: 'none' },
    'top-right': { top: 0, right: 0, transform: 'scaleX(-1)' },
    'bottom-left': { bottom: 0, left: 0, transform: 'scaleY(-1)' },
    'bottom-right': { bottom: 0, right: 0, transform: 'scale(-1,-1)' },
  };

  return (
    <div style={{
      position: 'absolute',
      ...styles[position],
      width: '140px',
      height: '140px',
      opacity: 0.12,
      pointerEvents: 'none',
      ...styles[position],
    }}>
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" width="140" height="140">
        <path d="M10 10 Q40 10 40 40 Q40 70 70 70 Q100 70 100 100 Q100 130 130 130" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        <path d="M30 10 Q50 10 50 30 Q50 60 80 60 Q110 60 110 90 Q110 120 130 120" stroke="#c8991b" strokeWidth="1" fill="none" opacity="0.7" />
        <circle cx="10" cy="10" r="4" fill="#7c3aed" opacity="0.6" />
        <circle cx="40" cy="40" r="3" fill="#7c3aed" opacity="0.4" />
        <circle cx="70" cy="70" r="3" fill="#c8991b" opacity="0.5" />
        <circle cx="100" cy="100" r="3" fill="#7c3aed" opacity="0.4" />
        <path d="M5 25 C15 20 20 30 10 35 C0 40 -5 30 5 25Z" fill="#c8991b" opacity="0.3" />
        <path d="M25 5 C20 15 30 20 35 10 C40 0 30 -5 25 5Z" fill="#7c3aed" opacity="0.2" />
        <path d="M15 50 C25 45 30 55 20 60 C10 65 5 55 15 50Z" fill="#c8991b" opacity="0.2" />
      </svg>
    </div>
  );
}

/* ── shared inline styles ── */
const labelStyle = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '0.88rem',
  color: '#111827',
  background: '#f3f4f6',
  outline: 'none',
  transition: 'border-color 0.18s, background 0.18s',
  boxSizing: 'border-box',
  fontFamily: "'Inter', sans-serif",
};
