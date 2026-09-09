import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { cx } from '../../lib/format';
import {
  IconLogo, IconMap, IconInbox, IconPen, IconChart, IconLogout,
} from '../../lib/icons';

const CITIZEN_NAV = [
  { to: '/app', end: true, label: 'GIS & Heat Map', icon: IconMap },
  { to: '/app/my-reports', label: 'My Reports & History', icon: IconInbox },
  { to: '/app/report', label: 'Report an Issue', icon: IconPen },
  { to: '/app/insights', label: 'City Insights', icon: IconChart },
];

export default function PublicLayout() {
  return (
    <div className="public-shell">
      <CitizenRail />
      <main className="public-main">
        <Outlet />
      </main>
    </div>
  );
}

function CitizenRail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNav = (e) => {
    e.currentTarget.blur();
  };

  return (
    <nav className="rail citizen-rail" aria-label="Citizen navigation">
      <div className="rail-brand citizen-brand">
        <span style={{ width: 28, display: 'grid', placeItems: 'center', flex: 'none' }}>
          <IconLogo size={28} />
        </span>
        <span className="rail-brand-text">
          <strong>UrbanSight AI</strong>
          <span style={{ color: 'var(--ai)' }}>Citizen Portal</span>
        </span>
      </div>

      <div className="rail-nav">
        <div className="rail-section">Citizen Services</div>
        {CITIZEN_NAV.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={handleNav}
            className={({ isActive }) => cx('rail-item', isActive && 'active')}
            title={label}
          >
            <Icon size={19} />
            <span className="rail-label">{label}</span>
          </NavLink>
        ))}
      </div>

      <div className="rail-foot">
        {user && (
          <div className="rail-user-block">
            <div className="rail-user-profile" title={user.name}>
              <span className="avatar citizen" style={{ width: 28, height: 28, fontSize: 11 }}>
                {user.initials || 'CU'}
              </span>
              <div className="rail-user-meta">
                <strong>{user.name}</strong>
                <span>{user.ward || 'Citizen User'}</span>
              </div>
            </div>
            <button
              className="rail-item rail-logout"
              title="Sign out"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
            >
              <IconLogout size={19} />
              <span className="rail-label">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
