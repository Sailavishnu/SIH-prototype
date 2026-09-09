import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { DEMO_ACCOUNTS } from '../../data/mock';
import { Card, Field } from '../../components/ui';
import {
  IconLogo, IconAlert, IconEye, IconLock, IconMail, IconArrowRight,
  IconCamera, IconMap, IconShield, IconSparkle, IconChart, IconBell,
} from '../../lib/icons';

const COPY = {
  citizen: {
    role: 'citizen',
    heading: 'Citizen sign in',
    lede: 'Track the issues around you and follow what the city does about them.',
    asideTitle: 'Your city, seen smarter.',
    asideBody:
      'Cameras on public buses scan the roads you use every day. Sign in to see what they found near you, report what they missed, and follow every repair to completion.',
    points: [
      { icon: IconMap, text: 'See live road, water and safety issues on a city map' },
      { icon: IconCamera, text: 'Report a problem in under a minute with a photo' },
      { icon: IconBell, text: 'Follow your report from detection through to repair' },
    ],
    home: '/app',
    switchTo: '/admin/login',
    switchLabel: 'Are you a city official? Use the authority portal',
    accent: 'citizen',
  },
  admin: {
    role: 'admin',
    heading: 'Authority sign in',
    lede: 'Access the city intelligence console for Greater Chennai Corporation.',
    asideTitle: 'The whole city, one console.',
    asideBody:
      'Every detection from the bus-mounted camera fleet, geolocated and prioritised — with the GIS maps, incident records and reports your departments work from.',
    points: [
      { icon: IconShield, text: 'Restricted to authorised municipal and police staff' },
      { icon: IconSparkle, text: 'AI-prioritised defects, incidents and congestion' },
      { icon: IconChart, text: 'Department dashboards and downloadable reports' },
    ],
    home: '/admin',
    switchTo: '/login',
    switchLabel: 'Not an official? Go to the citizen portal',
    accent: 'admin',
  },
};

function LoginScreen({ variant }) {
  const c = COPY[variant];
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // already signed in — don't show a login form
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter both your email address and password.');
      return;
    }
    setBusy(true);
    const res = await login(c.role, email, password);
    setBusy(false);
    if (res.ok) navigate(location.state?.from || c.home, { replace: true });
    else setError(res.error);
  };

  const fillDemo = () => {
    setEmail(DEMO_ACCOUNTS[c.role].email);
    setPassword(DEMO_ACCOUNTS[c.role].password);
    setError('');
  };

  return (
    <div className="auth-shell">
      <aside className={`auth-aside ${c.accent === 'citizen' ? 'citizen' : ''}`}>
        <Link to="/" className="row g12" style={{ color: '#fff' }}>
          <IconLogo size={32} />
          <span>
            <strong style={{ fontSize: 17, fontWeight: 700, display: 'block' }}>UrbanSight AI</strong>
            <span style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7 }}>
              {variant === 'admin' ? 'Authority Console' : 'Citizen Portal'}
            </span>
          </span>
        </Link>

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
          Greater Chennai Corporation · Tamil Nadu · Prototype build
        </p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-head">
            <span className="badge badge-ai" style={{ marginBottom: 14 }}>
              {variant === 'admin' ? 'Authority access' : 'Citizen access'}
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

              <Field label="Email address">
                <div className="search">
                  <IconMail size={16} />
                  <input className="input" type="email" autoComplete="username" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </Field>

              <Field label="Password">
                <div className="search">
                  <IconLock size={16} />
                  <input className="input" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                    placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: 40 }} />
                  <button type="button" className="icon-btn" onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: 4 }}>
                    <IconEye size={16} />
                  </button>
                </div>
              </Field>

              <div className="between">
                <label className="row g8" style={{ fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--brand)' }} />
                  Keep me signed in
                </label>
                <a href="#reset" className="meta" style={{ fontWeight: 600, color: 'var(--brand)' }}
                  onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>
                {busy ? 'Signing in…' : <>Sign in <IconArrowRight size={16} /></>}
              </button>
            </form>

            <div className="demo-box">
              <div className="between" style={{ marginBottom: 6 }}>
                <strong style={{ fontSize: 12, color: 'var(--text)' }}>Demo credentials</strong>
                <button type="button" className="btn btn-ghost btn-sm" onClick={fillDemo}>Fill</button>
              </div>
              <div><code>{DEMO_ACCOUNTS[c.role].email}</code></div>
              <div><code>{DEMO_ACCOUNTS[c.role].password}</code></div>
            </div>
          </Card>

          <p className="auth-alt">
            <Link to={c.switchTo}>{c.switchLabel}</Link>
          </p>
          <p className="auth-alt" style={{ marginTop: 8 }}>
            <Link to="/" className="muted">← Back to the public site</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export const CitizenLogin = () => <LoginScreen variant="citizen" />;
export const AdminLogin = () => <LoginScreen variant="admin" />;
