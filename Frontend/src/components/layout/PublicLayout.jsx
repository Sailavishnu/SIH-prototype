import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { cx } from '../../lib/format';
import ViewSwitch from './ViewSwitch';
import { IconLogo, IconHome, IconMap, IconPen, IconInbox, IconChart, IconLogout, IconChevronDown } from '../../lib/icons';

const LINKS = [
  { to: '/app', end: true, label: 'Home', icon: IconHome },
  { to: '/app/map', label: 'City Map', icon: IconMap },
  { to: '/app/report', label: 'Report', icon: IconPen },
  { to: '/app/my-reports', label: 'My Reports', icon: IconInbox },
  { to: '/app/insights', label: 'Insights', icon: IconChart },
];

/* mobile bottom bar keeps the four core destinations */
const TABS = LINKS.filter((l) => l.label !== 'Insights');

export default function PublicLayout() {
  return (
    <div className="public-shell">
      <PublicNav />
      <main className="public-main">
        <Outlet />
      </main>
      <footer className="public-foot">
        <div className="foot-in">
          <div className="row g10" style={{ gap: 10 }}>
            <IconLogo size={22} />
            <span className="meta">UrbanSight AI · Greater Chennai Corporation · Data from bus-mounted AI cameras</span>
          </div>
          <span className="meta">Prototype for demonstration — no live civic data.</span>
        </div>
      </footer>
      <nav className="tabbar" aria-label="Primary">
        {TABS.map(({ to, end, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => cx(isActive && 'active')}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function PublicNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="public-nav">
      <div className="nav-in">
        <NavLink to="/app" className="brand-lockup">
          <IconLogo size={30} />
          <span>
            <strong>UrbanSight AI</strong>
            <span>Chennai</span>
          </span>
        </NavLink>

        <div className="nav-links grow">
          {LINKS.map(({ to, end, label }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cx('nav-link', isActive && 'active')}>
              {label}
            </NavLink>
          ))}
        </div>

        <div className="row g12" style={{ marginLeft: 'auto' }}>
          <ViewSwitch />
          <NavLink to="/app/report" className="btn btn-primary btn-sm">Report an Issue</NavLink>

          {user && (
            <div style={{ position: 'relative' }}>
              <button className="account" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
                <span className="avatar citizen">{user.initials}</span>
                <IconChevronDown size={14} />
              </button>
              {open && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
                  <div className="card" style={{ position: 'absolute', right: 0, top: 46, width: 232, zIndex: 41, boxShadow: 'var(--sh-lg)', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                      <strong style={{ fontSize: 14, display: 'block' }}>{user.name}</strong>
                      <span className="meta">{user.email}</span>
                      <div className="meta" style={{ marginTop: 4 }}>{user.ward}</div>
                    </div>
                    <button className="rail-item" style={{ width: 'calc(100% - 16px)', margin: 8 }}
                      onClick={() => { logout(); navigate('/login', { replace: true }); }}>
                      <IconLogout size={18} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
