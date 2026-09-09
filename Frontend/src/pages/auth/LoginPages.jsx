import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Card, Field } from '../../components/ui';
import {
  IconLogo, IconAlert, IconEye, IconLock, IconMail, IconArrowRight,
  IconCamera, IconMap, IconShield, IconSparkle, IconChart, IconBell,
} from '../../lib/icons';

const COPY = {
  citizen: {
    role: 'citizen',
    badge: 'Citizen Access',
    heading: 'Citizen sign in',
    lede: 'Track issues around you and follow municipal progress in real-time.',
    asideTitle: 'Your city, seen smarter.',
    asideBody:
      'Cameras on public buses scan the roads every day. Sign in to see live detections, report what they missed, and follow every repair to completion.',
    points: [
      { icon: IconMap, text: 'See live road, water and safety issues on a city map' },
      { icon: IconCamera, text: 'Report a problem in under a minute with a photo' },
      { icon: IconBell, text: 'Follow your report from detection through to repair' },
    ],
    home: '/app',
    buttonLabel: 'Sign in as Citizen',
    accent: 'citizen',
  },
  admin: {
    role: 'admin',
    badge: 'Authority Access',
    heading: 'Authority sign in',
    lede: 'Access the city intelligence console for Greater Chennai Corporation.',
    asideTitle: 'The whole city, one console.',
    asideBody:
      'Every detection from the bus-mounted camera fleet, geolocated and prioritised — with GIS maps, incident records and departmental workflows.',
    points: [
      { icon: IconShield, text: 'Restricted to authorised municipal and police staff' },
      { icon: IconSparkle, text: 'AI-prioritised defects, incidents and congestion' },
      { icon: IconChart, text: 'Department dashboards and downloadable reports' },
    ],
    home: '/admin',
    buttonLabel: 'Sign in to Authority Console',
    accent: 'admin',
  },
};

export default function LoginPage({ defaultRole = 'admin' }) {
  const location = useLocation();
  const initialRole = location.pathname.includes('admin') ? 'admin' : defaultRole;
  const [role, setRole] = useState(initialRole);
  const c = COPY[role];

  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Sync role if navigation path changes
  useEffect(() => {
    if (location.pathname === '/admin/login') setRole('admin');
    else if (location.pathname === '/login') setRole('citizen');
  }, [location.pathname]);

  // Already signed in
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await login(role, email, password);
    setBusy(false);
    if (res.ok) {
      const destination = location.state?.from || c.home;
      navigate(destination, { replace: true });
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="auth-shell">
      <aside className={`auth-aside ${c.accent === 'citizen' ? 'citizen' : ''}`}>
        <div className="row g12" style={{ color: '#fff' }}>
          <IconLogo size={32} />
          <span>
            <strong style={{ fontSize: 17, fontWeight: 700, display: 'block' }}>UrbanSight AI</strong>
            <span style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.7 }}>
              {role === 'admin' ? 'Authority Console' : 'Citizen Portal'}
            </span>
          </span>
        </div>

        <div>
          <h2>{c.asideTitle}</h2>
          <p>{c.asideBody}</p>
          <ul className="auth-points">
            {c.points.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span className="ap-ic"><Icon size={15} /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 0 }}>
          Greater Chennai Corporation · Tamil Nadu · Smart City Platform
        </p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          {/* Neat Segmented Role Toggle */}
          <div className="login-role-toggle">
            <button
              type="button"
              className={`login-role-btn ${role === 'citizen' ? 'active' : ''}`}
              onClick={() => { setRole('citizen'); setError(''); }}
            >
              <IconMap size={16} />
              <span>Citizen Portal</span>
            </button>
            <button
              type="button"
              className={`login-role-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => { setRole('admin'); setError(''); }}
            >
              <IconShield size={16} />
              <span>Authority Console</span>
            </button>
          </div>

          <div className="auth-head">
            <span className={`badge ${role === 'admin' ? 'badge-ai' : 'badge-neutral'}`} style={{ marginBottom: 12 }}>
              {c.badge}
            </span>
            <h1>{c.heading}</h1>
            <p>{c.lede}</p>
          </div>

          <Card className="card-pad">
            <form className="stack g16" onSubmit={submit} noValidate>
              {error && (
                <div className="auth-error" role="alert">
                  <IconAlert size={16} style={{ flex: 'none', marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              <Field label="Email or Username">
                <div className="search">
                  <IconMail size={16} />
                  <input
                    className="input"
                    type="text"
                    autoComplete="username"
                    placeholder={role === 'admin' ? 'admin@chennai.gov.in' : 'citizen@chennai.gov.in'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </Field>

              <Field label="Password">
                <div className="search">
                  <IconLock size={16} />
                  <input
                    className="input"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: 4 }}
                  >
                    <IconEye size={16} />
                  </button>
                </div>
              </Field>

              <div className="between">
                <label className="row g8" style={{ fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--brand)' }} />
                  Keep me signed in
                </label>
                <a
                  href="#reset"
                  className="meta"
                  style={{ fontWeight: 600, color: 'var(--brand)' }}
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>

              <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>
                {busy ? 'Signing in…' : <>{c.buttonLabel} <IconArrowRight size={16} /></>}
              </button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}

export const CitizenLogin = () => <LoginPage defaultRole="citizen" />;
export const AdminLogin = () => <LoginPage defaultRole="admin" />;
