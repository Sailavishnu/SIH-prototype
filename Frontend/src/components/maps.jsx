/* ============================================================
   Leaflet / OpenStreetMap building blocks.
   One tile source, one pin style, shared by every map screen.
   ============================================================ */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { CATEGORIES, CITY } from '../data/mock';
import { cx, timeAgo } from '../lib/format';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/* ---------- icons ---------- */
const iconCache = new Map();

export function pinIcon(color = '#155EEF', { pulse = false, size = 24, glyph = '' } = {}) {
  const key = `${color}|${pulse}|${size}|${glyph}`;
  if (iconCache.has(key)) return iconCache.get(key);
  const icon = L.divIcon({
    className: 'urban-pin',
    html: `<span class="pin${pulse ? ' pulse' : ''}" style="--pin-c:${color}"><i></i>${glyph ? `<b>${glyph}</b>` : ''}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 2],
  });
  iconCache.set(key, icon);
  return icon;
}

export const busIcon = (() => {
  let cached;
  return () => {
    if (cached) return cached;
    cached = L.divIcon({
      className: 'urban-pin',
      html: '<span class="bus-pin"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="4" width="16" height="12" rx="2"/><path d="M4 11h16M7.5 19v1M16.5 19v1M7 16v3M17 16v3"/></svg></span>',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14],
    });
    return cached;
  };
})();

/* ---------- helpers that live inside the map ---------- */
function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center?.[0], center?.[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Keeps Leaflet honest when its container is resized by layout changes. */
function ResizeFix() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const t = setTimeout(fix, 220);
    window.addEventListener('resize', fix);
    return () => { clearTimeout(t); window.removeEventListener('resize', fix); };
  }, [map]);
  return null;
}

function ClickCapture({ onPick }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

/* ---------- heat layer ---------- */
/**
 * leaflet.heat is a classic global-L plugin, so it is loaded lazily after
 * L is exposed on window. If that ever fails we still render a readable
 * density overlay from stacked circles rather than showing nothing.
 */
export function HeatLayer({ points, radius = 30, blur = 22, max = 1, gradient }) {
  const map = useMap();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let layer;
    let cancelled = false;

    (async () => {
      if (!L.heatLayer) {
        window.L = L;
        try {
          await import('leaflet.heat');
        } catch {
          /* fall through to the circle overlay */
        }
      }
      if (cancelled) return;
      if (typeof L.heatLayer === 'function') {
        layer = L.heatLayer(points, {
          radius, blur, max, minOpacity: 0.35,
          gradient: gradient || { 0.2: '#155EEF', 0.4: '#14B8A6', 0.6: '#F79009', 0.85: '#F04438' },
        });
        layer.addTo(map);
      } else {
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (layer) map.removeLayer(layer);
    };
  }, [map, points, radius, blur, max]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!failed) return null;
  return (
    <>
      {points.map((p, i) => (
        <CircleMarker key={i} center={[p[0], p[1]]}
          radius={8 + p[2] * 18}
          pathOptions={{
            stroke: false,
            fillColor: p[2] > 0.75 ? '#F04438' : p[2] > 0.5 ? '#F79009' : p[2] > 0.3 ? '#14B8A6' : '#155EEF',
            fillOpacity: 0.16 + p[2] * 0.2,
          }} />
      ))}
    </>
  );
}

/* ---------- the map shell ---------- */
export function MapCanvas({
  height = 420, center = CITY.center, zoom = CITY.zoom, children,
  className, flush, scrollWheelZoom = true, legend, overlay, onPick, style,
}) {
  return (
    <div className={cx('map-shell', flush && 'flush', className)} style={{ height, ...style }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={scrollWheelZoom}
        style={{ height: '100%', width: '100%' }} zoomControl>
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} maxZoom={19} />
        <ResizeFix />
        {onPick && <ClickCapture onPick={onPick} />}
        {children}
      </MapContainer>
      {overlay}
      {legend && <MapLegend items={legend} />}
    </div>
  );
}

export { Recenter, Marker, Popup, CircleMarker, Polyline, useMap };

export function MapLegend({ items, title }) {
  return (
    <div className="map-legend">
      {title && <span className="eyebrow" style={{ marginBottom: 2 }}>{title}</span>}
      {items.map((it) => (
        <span className="lg-row" key={it.label}>
          <span className="lg-dot" style={{ background: it.color }} />
          {it.label}
          {it.count !== undefined && <b className="mono" style={{ marginLeft: 'auto', paddingLeft: 8 }}>{it.count}</b>}
        </span>
      ))}
    </div>
  );
}

/* ---------- issue markers ---------- */
export function IssueMarkers({ issues, onSelect, pulseCritical = true }) {
  return (
    <>
      {issues.map((it) => (
        <Marker
          key={it.id}
          position={[it.lat, it.lng]}
          icon={pinIcon(CATEGORIES[it.category].color, { pulse: pulseCritical && it.severity === 'critical' })}
          eventHandlers={onSelect ? { click: () => onSelect(it) } : undefined}
        >
          <Popup>
            <div style={{ minWidth: 190 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORIES[it.category].color }} />
                <strong style={{ fontSize: 12, letterSpacing: '.03em', textTransform: 'uppercase' }}>
                  {it.categoryLabel}
                </strong>
              </div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{it.title}</div>
              <div style={{ color: '#475467' }}>{it.road}, {it.area}</div>
              <div style={{ color: '#98A2B3', marginTop: 4, fontSize: 12 }}>
                {timeAgo(it.detectedAt)} · {it.confidence}% confidence
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

/** Legend entries built from whatever categories are actually on screen. */
export function useCategoryLegend(issues) {
  return useMemo(() => {
    const seen = new Map();
    issues.forEach((i) => seen.set(i.category, (seen.get(i.category) || 0) + 1));
    return [...seen.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, count]) => ({ label: CATEGORIES[key].short, color: CATEGORIES[key].color, count }));
  }, [issues]);
}

/* ---------- small single-point map ---------- */
export function MiniMap({ lat, lng, color = '#155EEF', height = 160, zoom = 15, label }) {
  return (
    <MapCanvas height={height} center={[lat, lng]} zoom={zoom} scrollWheelZoom={false}>
      <Marker position={[lat, lng]} icon={pinIcon(color)}>
        {label && <Popup>{label}</Popup>}
      </Marker>
    </MapCanvas>
  );
}

/* ---------- location picker (citizen report flow) ---------- */
export function LocationPicker({ value, onChange, height = 260 }) {
  const ref = useRef(null);
  return (
    <MapCanvas height={height} center={value} zoom={15} onPick={onChange} style={{ cursor: 'crosshair' }}>
      <Recenter center={value} />
      <Marker
        position={value}
        icon={pinIcon('#155EEF')}
        draggable
        ref={ref}
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            onChange([lat, lng]);
          },
        }}
      />
    </MapCanvas>
  );
}
