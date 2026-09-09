import React from 'react';
import { Link } from 'react-router-dom';
import { IconLogo, IconArrowLeft } from '../lib/icons';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bg)' }}>
      <div className="card card-pad stack g16" style={{ maxWidth: 440, textAlign: 'center', alignItems: 'center' }}>
        <IconLogo size={40} />
        <div>
          <h1 className="page-title">Page not found</h1>
          <p className="body" style={{ marginTop: 6 }}>
            That address does not match anything in UrbanSight AI. It may have moved, or the link may be incomplete.
          </p>
        </div>
        <div className="row g8 wrap" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary"><IconArrowLeft size={15} /> Back to home</Link>
          <Link to="/app/map" className="btn btn-secondary">Open the city map</Link>
        </div>
      </div>
    </div>
  );
}
