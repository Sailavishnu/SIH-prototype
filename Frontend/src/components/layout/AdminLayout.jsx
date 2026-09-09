import React, { createContext, useContext, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { CATEGORY_LIST, DISTRICTS, STATES, counts } from '../../data/mock';
import { cx } from '../../lib/format';
import {
  IconGrid, IconMap, IconTable, IconAlert, IconTraffic, IconRoad, IconBus,
  IconChart, IconFile, IconUsers, IconLogo, IconSearch, IconLogout, IconMenu,
  IconBell, IconSettings,
} from '../../lib/icons';

/* ------------------------------------------------------------
   Global admin filters — set once in the top bar, read by any page
   ------------------------------------------------------------ */
const FilterCtx = createContext(null);
export const useAdminFilters = () => useContext(FilterCtx);

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

function FilterProvider({ children }) {
  const [range, setRange] = useState('30');
  const [state, setState] = useState('all');
  const [district, setDistrict] = useState('all');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const value = useMemo(() => {
    const cutoff = range === 'all' ? 0 : Date.now() - Number(range) * 86400000;
    const apply = (list) =>
      list.filter((it) => {
        if (it.detectedAt < cutoff) return false;
        if (state !== 'all' && it.state !== state) return false;
        if (district !== 'all' && it.district !== district) return false;
        if (category !== 'all' && it.category !== category) return false;
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          const hay = `${it.id} ${it.title || ''} ${it.area} ${it.road || ''} ${it.categoryLabel || it.typeLabel || ''} ${it.plate || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

    const activeCount = [range !== '30', state !== 'all', district !== 'all', category !== 'all', !!query.trim()].filter(Boolean).length;

    const reset = () => { setRange('30'); setState('all'); setDistrict('all'); setCategory('all'); setQuery(''); };

    return {
      range, setRange, state, setState, district, setDistrict,
      category, setCategory, query, setQuery, apply, activeCount, reset,
      rangeLabel: RANGE_OPTIONS.find((r) => r.value === range)?.label ?? 'Last 30 days',
      regionLabel: district === 'all' ? 'All districts' : district,
    };
  }, [range, state, district, category, query]);

  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>;
}

/* ------------------------------------------------------------
   Navigation
   ------------------------------------------------------------ */
const NAV = [
  {
    section: 'Overview',
    items: [
      { to: '/admin', end: true, label: 'Dashboard', icon: IconGrid },
      { to: '/admin/map', label: 'GIS Intelligence', icon: IconMap },
    ],
  },
  {
    section: 'Operations',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: IconTable },
      { to: '/admin/incidents', label: 'Incidents', icon: IconAlert, badge: counts.activeIncidents },
      { to: '/admin/teams', label: 'Departments', icon: IconUsers },
    ],
  },
  {
    section: 'Intelligence',
    items: [
      { to: '/admin/traffic', label: 'Traffic', icon: IconTraffic },
      { to: '/admin/infrastructure', label: 'Infrastructure', icon: IconRoad },
      { to: '/admin/fleet', label: 'Fleet', icon: IconBus },
      { to: '/admin/analytics', label: 'Analytics', icon: IconChart },
    ],
  },
  {
    section: 'Output',
    items: [{ to: '/admin/exports', label: 'Reports & Export', icon: IconFile }],
  },
];

const PAGE_META = {
  '/admin': { title: 'City Dashboard', sub: 'Live overview across all zones' },
  '/admin/map': { title: 'GIS Intelligence Map', sub: 'Geospatial view of every detection' },
  '/admin/reports': { title: 'Reports', sub: 'All AI and citizen-raised reports' },
  '/admin/incidents': { title: 'Incident Management', sub: 'Hit-and-run, rash driving and safety events' },
  '/admin/traffic': { title: 'Traffic Intelligence', sub: 'Congestion, density and vehicle mix' },
  '/admin/infrastructure': { title: 'Infrastructure Intelligence', sub: 'Road asset condition across the city' },
  '/admin/fleet': { title: 'Fleet Monitoring', sub: 'Camera-equipped buses and their health' },
  '/admin/analytics': { title: 'Analytics', sub: 'Trends, distributions and comparisons' },
  '/admin/exports': { title: 'Reports & Export', sub: 'Generate and download city reports' },
  '/admin/teams': { title: 'Team & Departments', sub: 'Workload and issue assignment' },
};

function pageMeta(pathname) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  const base = '/' + pathname.split('/').slice(1, 3).join('/');
  if (pathname.startsWith('/admin/incidents/')) return { title: 'Incident Detail', sub: 'Evidence, OCR result and case status' };
  if (pathname.startsWith('/admin/fleet/')) return { title: 'Bus Profile', sub: 'Route, detections and camera health' };
  return PAGE_META[base] || { title: 'UrbanSight AI', sub: '' };
}

/* ------------------------------------------------------------
   Shell
   ------------------------------------------------------------ */
export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const meta = pageMeta(pathname);

  return (
    <FilterProvider>
      <div className="admin-shell">
        {mobileOpen && <div className="rail-scrim" onClick={() => setMobileOpen(false)} />}
        <Rail open={mobileOpen} onNavigate={() => setMobileOpen(false)} />
        <div className="admin-main">
          <TopBar meta={meta} onMenu={() => setMobileOpen((v) => !v)} />
          <Outlet />
        </div>
      </div>
    </FilterProvider>
  );
}

function Rail({ open, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNav = (e) => {
    e.currentTarget.blur();
    if (onNavigate) onNavigate();
  };

  return (
    <nav className={cx('rail', open && 'open')} aria-label="Admin sections">
      <div className="rail-brand">
        <span style={{ width: 28, display: 'grid', placeItems: 'center', flex: 'none' }}><IconLogo size={28} /></span>
        <span className="rail-brand-text">
          <strong>UrbanSight AI</strong>
          <span>Authority Console</span>
        </span>
      </div>

      <div className="rail-nav">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="rail-section">{group.section}</div>
            {group.items.map(({ to, end, label, icon: Icon, badge }) => (
              <NavLink key={to} to={to} end={end} onClick={handleNav}
                className={({ isActive }) => cx('rail-item', isActive && 'active')} title={label}>
                <Icon size={19} />
                <span className="rail-label">{label}</span>
                {badge ? <span className="rail-badge">{badge}</span> : null}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="rail-foot">
        {user && (
          <div className="rail-user-block">
            <div className="rail-user-profile" title={user.name}>
              <span className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{user.initials}</span>
              <div className="rail-user-meta">
                <strong>{user.name}</strong>
                <span>{user.title || 'Authority'}</span>
              </div>
            </div>
            <button
              className="rail-item rail-logout"
              title="Sign out"
              onClick={() => {
                logout();
                navigate('/admin/login', { replace: true });
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

function TopBar({ meta, onMenu }) {
  const f = useAdminFilters();
  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open navigation"><IconMenu size={20} /></button>

      <div className="topbar-title">
        <h1>{meta.title}</h1>
        {meta.sub && <p>{meta.sub}</p>}
      </div>

      <div className="topbar-filters">
        <select className="select" value={f.range} onChange={(e) => f.setRange(e.target.value)} aria-label="Date range" style={{ width: 132 }}>
          {RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="select" value={f.state} onChange={(e) => f.setState(e.target.value)} aria-label="State" style={{ width: 122 }}>
          <option value="all">All states</option>
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" value={f.district} onChange={(e) => f.setDistrict(e.target.value)} aria-label="District" style={{ width: 134 }}>
          <option value="all">All districts</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="select" value={f.category} onChange={(e) => f.setCategory(e.target.value)} aria-label="Category" style={{ width: 150 }}>
          <option value="all">All categories</option>
          {CATEGORY_LIST.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <div className="search" style={{ width: 190 }}>
          <IconSearch size={15} />
          <input className="input" placeholder="Search reports…" value={f.query} onChange={(e) => f.setQuery(e.target.value)} />
        </div>
        {f.activeCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={f.reset}>Clear</button>
        )}
      </div>

      <div className="row g12">
        <button className="icon-btn" aria-label="Notifications" style={{ position: 'relative' }}>
          <IconBell size={19} />
          <span style={{ position: 'absolute', top: 5, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--critical)', border: '1.5px solid #fff' }} />
        </button>
      </div>
    </header>
  );
}
