import React from 'react';
import { Link } from 'react-router-dom';
import { MapCanvas, IssueMarkers } from '../../components/maps';
import { AiTag, Card } from '../../components/ui';
import { counts, issues, CITY } from '../../data/mock';
import { formatNumber } from '../../lib/format';
import {
  IconLogo, IconSparkle, IconGauge, IconPin, IconArrowRight, IconPen, IconMap,
} from '../../lib/icons';

const TRUST = [
  { icon: IconSparkle, title: 'AI-powered monitoring', sub: 'Cameras on public buses scan roads all day' },
  { icon: IconGauge, title: 'Real-time city insights', sub: 'Detections reach the right department in minutes' },
  { icon: IconPin, title: 'Location-based tracking', sub: 'Every issue geotagged and followed to closure' },
];

export default function Landing() {
  const preview = issues.slice(0, 26);

  return (
    <div className="public-shell">
      {/* minimal landing header — the full nav lives inside the signed-in app */}
      <header className="public-nav">
        <div className="nav-in">
          <Link to="/" className="brand-lockup">
            <IconLogo size={30} />
            <span>
              <strong>UrbanSight AI</strong>
              <span>Chennai</span>
            </span>
          </Link>
          <div className="row g8" style={{ marginLeft: 'auto' }}>
            <Link to="/admin/login" className="btn btn-ghost btn-sm">Authority portal</Link>
            <Link to="/login" className="btn btn-secondary btn-sm">Citizen sign in</Link>
          </div>
        </div>
      </header>

      <main className="public-main">
        {/* ---------- hero ---------- */}
        <section className="hero">
          <div className="hero-in">
            <div className="hero-copy">
              <AiTag>POWERED BY ON-BUS AI CAMERAS</AiTag>
              <h1 className="hero-title" style={{ marginTop: 16 }}>Your city, seen smarter.</h1>
              <p className="lead">
                Cameras riding on Chennai&apos;s public buses spot potholes, waterlogging, broken
                signboards and unsafe driving as they happen — then route each one to the
                department that can fix it. See what has been found near you, and add what it missed.
              </p>
              <div className="hero-cta">
                <Link to="/app/map" className="btn btn-primary btn-lg">
                  <IconMap size={17} /> Explore City Map
                </Link>
                <Link to="/app/report" className="btn btn-secondary btn-lg">
                  <IconPen size={16} /> Report an Issue
                </Link>
              </div>

              <div className="row g32 wrap" style={{ marginTop: 34, gap: 32 }}>
                <Stat value={formatNumber(counts.total)} label="Issues detected" />
                <Stat value={formatNumber(counts.resolved)} label="Resolved" />
                <Stat value={`${counts.resolutionRate}%`} label="Resolution rate" />
                <Stat value="12" label="Buses on patrol" />
              </div>
            </div>

            <div className="hero-visual">
              <Card style={{ overflow: 'hidden', boxShadow: 'var(--sh-lg)' }}>
                <div className="card-head">
                  <div className="row g8">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                    <strong style={{ fontSize: 13 }}>Live detections — Chennai</strong>
                  </div>
                  <span className="meta">Updated just now</span>
                </div>
                <MapCanvas
                  height={330}
                  flush
                  center={CITY.center}
                  zoom={11}
                  scrollWheelZoom={false}
                  legend={[
                    { label: 'Potholes', color: '#F04438' },
                    { label: 'Waterlogging', color: '#0BA5EC' },
                    { label: 'Infrastructure', color: '#7A5AF8' },
                  ]}
                >
                  <IssueMarkers issues={preview} />
                </MapCanvas>
              </Card>
            </div>
          </div>
        </section>

        {/* ---------- trust strip ---------- */}
        <section className="trust-strip">
          <div className="trust-in">
            {TRUST.map(({ icon: Icon, title, sub }) => (
              <div className="trust-item" key={title}>
                <span className="trust-ic"><Icon size={18} /></span>
                <span>
                  <strong>{title}</strong>
                  <span>{sub}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- entry points ---------- */}
        <section className="public-page">
          <div className="grid-2">
            <EntryCard
              to="/login"
              tone="var(--ai)"
              eyebrow="For residents"
              title="Citizen portal"
              body="Browse the city map, report an issue with a photo, and track every report you file through to repair."
              cta="Sign in as a citizen"
            />
            <EntryCard
              to="/admin/login"
              tone="var(--brand)"
              eyebrow="For officials"
              title="Authority console"
              body="GIS dashboards, incident records with plate recognition, department workloads and downloadable city reports."
              cta="Sign in as an authority"
            />
          </div>
        </section>
      </main>

      <footer className="public-foot">
        <div className="foot-in">
          <div className="row g12">
            <IconLogo size={22} />
            <span className="meta">UrbanSight AI · Greater Chennai Corporation · Tamil Nadu</span>
          </div>
          <span className="meta">Prototype for demonstration — no live civic data.</span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }} className="mono">{value}</div>
      <div className="meta">{label}</div>
    </div>
  );
}

function EntryCard({ to, tone, eyebrow, title, body, cta }) {
  return (
    <Card className="card-pad" interactive>
      <span className="eyebrow" style={{ color: tone }}>{eyebrow}</span>
      <h3 className="section-title" style={{ marginTop: 8 }}>{title}</h3>
      <p className="body" style={{ marginTop: 8, maxWidth: '46ch' }}>{body}</p>
      <Link to={to} className="btn btn-secondary btn-sm" style={{ marginTop: 18 }}>
        {cta} <IconArrowRight size={15} />
      </Link>
    </Card>
  );
}
