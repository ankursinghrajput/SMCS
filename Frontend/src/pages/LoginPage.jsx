import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Users, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const roles = [
  { id: 'student', label: 'Student', icon: <GraduationCap size={16} strokeWidth={1.5} /> },
  { id: 'faculty', label: 'Faculty', icon: <Users size={16} strokeWidth={1.5} /> },
  { id: 'admin', label: 'Admin', icon: <ShieldCheck size={16} strokeWidth={1.5} /> },
];

/* ── theme palette ── */
const THEME_COLOR = '#183B65';
const THEME_COLOR_H = '#1e487a';
const THEME_COLOR_BG = '#f0f4f8';

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
    <>
      <style>{`
        .login-container {
          min-height: 100vh;
          width: 100%;
          background: #ffffff;
          display: flex;
          flex-direction: row;
          font-family: 'Raleway', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .login-left {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: transparent;
          padding: 20px;
        }
        .login-image {
          max-width: 100%;
          max-height: 70vh;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .sanskrit-text {
          margin-top: 16px;
          font-family: 'Noto Serif Devanagari', serif;
          font-size: 1.4rem;
          color: #4b5563;
          text-align: center;
          font-weight: 500;
        }
        .login-right {
          flex: 0.8;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 40px 40px 40px 8%;
          position: relative;
          z-index: 1;
          background: transparent;
          box-shadow: none;
        }
        .login-form-wrapper {
          width: 100%;
          max-width: 420px;
          margin: 0;
        }
        .login-heading {
          font-family: 'Raleway', sans-serif;
          font-size: 2.1rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        .login-subtitle {
          font-family: 'Raleway', sans-serif;
          font-size: 0.95rem;
          color: #4b5563;
          margin-bottom: 32px;
          line-height: 1.5;
        }
        .login-btn {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          background: #183B65;
          color: #ffffff;
          font-family: 'Raleway', sans-serif;
          font-size: 0.96rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 4px 14px rgba(24, 59, 101, 0.35);
        }
        .login-btn:hover {
          background: #2b5a94;
          transform: translateY(-1px);
        }
        .login-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
        .divider-line {
          border-left: 1.5px solid #e5e7eb;
          padding-left: 70px;
          margin-left: -70px;
        }
        @media (max-width: 768px) {
          .divider-line {
            border-left: none;
            padding-left: 0;
            margin-left: 0;
          }
          .login-container {
            flex-direction: column;
          }
          .login-left {
            flex: none;
            height: 40vh;
            padding: 40px 20px 10px;
            order: -1;
          }
          .login-image {
            max-height: 100%;
          }
          .login-right {
            flex: 1;
            align-items: center;
            padding: 20px;
          }
          .login-form-wrapper {
            margin: 0 auto;
          }
        }
      `}</style>
      <div className="login-container">

        {/* ── Decorative corner flourishes ── */}
        <CornerFlourish position="top-left" />
        <CornerFlourish position="top-right" />
        <CornerFlourish position="bottom-left" />
        <CornerFlourish position="bottom-right" />

        {/* ══════════ LEFT — Image ══════════ */}
        <div className="login-left">
          <img
            src="/SMCS_logo_nobg.png"
            alt="Goddess Saraswati Maa"
            className="login-image"
          />
          <div className="sanskrit-text">सा विद्या या विमुक्तये</div>
        </div>

        {/* ══════════ RIGHT — Form ══════════ */}
        <div className="login-right">

          <div className="login-form-wrapper">

            {/* Heading */}
            <h1 className="login-heading">
              {/* Welcome Back */}
            </h1>
            <p className="login-subtitle">
              Please enter your credentials to securely access your SMCS account.
            </p>

            <div className="divider-line">
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
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      transition: 'all 0.18s ease',
                      background: active ? THEME_COLOR : '#f9fafb',
                      color: active ? '#ffffff' : '#4b5563',
                      boxShadow: active ? `0 2px 10px ${THEME_COLOR}40` : 'none',
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
                    onFocus={e => { e.target.style.borderColor = THEME_COLOR; e.target.style.background = '#fff'; }}
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
                    onFocus={e => { e.target.style.borderColor = THEME_COLOR; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f3f4f6'; }}
                  />
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <span style={{ fontSize: '0.78rem', color: THEME_COLOR, cursor: 'pointer', fontWeight: 500 }}>
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
                    onFocus={e => { e.target.style.borderColor = THEME_COLOR; e.target.style.background = '#fff'; }}
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
                    {showPass ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
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
                className="login-btn"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
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
    </>
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
        <path d="M10 10 Q40 10 40 40 Q40 70 70 70 Q100 70 100 100 Q100 130 130 130" stroke="#183B65" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        <path d="M30 10 Q50 10 50 30 Q50 60 80 60 Q110 60 110 90 Q110 120 130 120" stroke="#c8991b" strokeWidth="1" fill="none" opacity="0.7" />
        <circle cx="10" cy="10" r="4" fill="#183B65" opacity="0.6" />
        <circle cx="40" cy="40" r="3" fill="#183B65" opacity="0.4" />
        <circle cx="70" cy="70" r="3" fill="#c8991b" opacity="0.5" />
        <circle cx="100" cy="100" r="3" fill="#183B65" opacity="0.4" />
        <path d="M5 25 C15 20 20 30 10 35 C0 40 -5 30 5 25Z" fill="#c8991b" opacity="0.3" />
        <path d="M25 5 C20 15 30 20 35 10 C40 0 30 -5 25 5Z" fill="#183B65" opacity="0.2" />
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
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
};
