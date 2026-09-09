import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapCanvas, Marker, Polyline, IssueMarkers, busIcon } from '../../components/maps';
import {
  Badge, Card, CardHead, ErrorState, KeyValue, KpiCard,
} from '../../components/ui';
import { LOCATIONS, buses, issues } from '../../data/mock';
import { formatDateTime, formatGps, timeAgo } from '../../lib/format';
import {
  IconArrowLeft, IconBus, IconCamera, IconSignal, IconWifiOff, IconGauge, IconClock, IconChevronRight,
} from '../../lib/icons';

const CAMERA_META = {
  online: { label: 'Online', tone: 'success', icon: IconSignal },
  degraded: { label: 'Degraded', tone: 'warning', icon: IconCamera },
  offline: { label: 'Offline', tone: 'critical', icon: IconWifiOff },
};

/** Deterministic stand-in route path built from real Chennai localities. */
function routePath(busId) {
  let seed = 0;
  for (let i = 0; i < busId.length; i++) seed = (seed * 31 + busId.charCodeAt(i)) % 997;
  const stops = [];
  for (let i = 0; i < 6; i++) {
    stops.push(LOCATIONS[(seed + i * 5) % LOCATIONS.length]);
  }
  return stops;
}

export default function FleetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bus = buses.find((b) => b.id === id);

  const detections = useMemo(
    () => issues.filter((i) => i.busId === id).slice(0, 8),
    [id],
  );
  const stops = useMemo(() => (bus ? routePath(bus.id) : []), [bus]);

  if (!bus) {
    return (
      <div className="admin-page">
        <Card className="card-pad">
          <ErrorState title="Bus not found" message={`No vehicle matches the ID “${id}”.`} onRetry={() => navigate('/admin/fleet')} />
        </Card>
      </div>
    );
  }

  const cam = CAMERA_META[bus.camera];
  const CamIcon = cam.icon;

  return (
    <div className="admin-page stack g16">
      <Link to="/admin/fleet" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginLeft: -12 }}>
        <IconArrowLeft size={15} /> Back to fleet
      </Link>

      <div className="between wrap g16">
        <div>
          <div className="row wrap g8" style={{ marginBottom: 8 }}>
            <Badge tone={bus.status === 'On Route' ? 'success' : 'neutral'} dot>{bus.status}</Badge>
            <Badge tone={cam.tone}>Camera {cam.label.toLowerCase()}</Badge>
            <span className="plate">{bus.plate}</span>
          </div>
          <h1 className="page-title">{bus.id}</h1>
          <p className="body" style={{ marginTop: 4 }}>{bus.route} · {bus.depot}</p>
        </div>
      </div>

      <div className="grid-4">
        <KpiCard label="Events today" value={bus.eventsToday} icon={<IconCamera size={16} />} tone="ai" sub="detections uploaded" />
        <KpiCard label="Distance today" value={`${bus.kmToday} km`} icon={<IconGauge size={16} />} tone="brand" sub="on this route" />
        <KpiCard label="Camera status" value={cam.label} icon={<CamIcon size={16} />} tone={cam.tone === 'success' ? 'success' : cam.tone === 'warning' ? 'warning' : 'critical'} sub="lens and uplink" />
        <KpiCard label="Last sync" value={timeAgo(bus.lastSync)} icon={<IconClock size={16} />} tone="neutral" sub={formatDateTime(bus.lastSync)} />
      </div>

      <div className="split-2">
        <Card>
          <CardHead title="Route and last position" subtitle="Stops served on this route, with the bus at its last reported point" />
          <div style={{ padding: 20 }}>
            <MapCanvas height={400} center={[bus.lat, bus.lng]} zoom={11}>
              <Polyline
                positions={stops.map((s) => [s.lat, s.lng])}
                pathOptions={{ color: '#155EEF', weight: 4, opacity: 0.75, dashArray: '1 0' }}
              />
              {stops.map((s) => (
                <Marker key={s.area} position={[s.lat, s.lng]} icon={busIcon()} />
              ))}
              <Marker position={[bus.lat, bus.lng]} icon={busIcon()} />
              <IssueMarkers issues={detections} pulseCritical={false} />
            </MapCanvas>
            <div className="row wrap g12" style={{ marginTop: 12 }}>
              {stops.map((s, i) => (
                <span key={s.area} className="row g4 meta">
                  {i > 0 && <IconChevronRight size={12} />}
                  {s.area}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <div className="stack g16">
          <Card>
            <CardHead title="Camera health" icon={<CamIcon size={18} />} />
            <div className="card-body stack g16">
              <Health label="Lens clarity" value={bus.cameraHealth.lens} />
              <Health label="Storage available" value={bus.cameraHealth.storage} />
              <Health label="Uplink strength" value={bus.cameraHealth.uplink} />
              {bus.camera !== 'online' && (
                <p className="meta" style={{ lineHeight: 1.55 }}>
                  {bus.camera === 'offline'
                    ? 'Unit has not reported since it returned to depot. Scheduled for inspection.'
                    : 'Lens obstruction detected — detections from this unit carry reduced confidence until cleaned.'}
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHead title="Vehicle details" icon={<IconBus size={18} />} />
            <div className="card-body">
              <KeyValue
                items={[
                  { label: 'Bus ID', value: <span className="mono">{bus.id}</span> },
                  { label: 'Number plate', value: <span className="plate">{bus.plate}</span> },
                  { label: 'Route', value: bus.route },
                  { label: 'Depot', value: bus.depot },
                  { label: 'Last area', value: bus.lastArea },
                  { label: 'Position', value: <span className="mono">{formatGps(bus.lat, bus.lng)}</span> },
                ]}
              />
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHead title="Recent detections" subtitle={`Latest events uploaded from ${bus.id}`} />
        <ul className="rank-list">
          {detections.length === 0 && (
            <li><span className="meta">No detections recorded from this unit in the current dataset.</span></li>
          )}
          {detections.map((d) => (
            <li key={d.id}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flex: 'none' }} />
              <span className="grow stack" style={{ gap: 2, minWidth: 0 }}>
                <span style={{ fontWeight: 500, fontSize: 13.5 }}>{d.title}</span>
                <span className="meta">{d.road}, {d.area} · {formatDateTime(d.detectedAt)}</span>
              </span>
              <Badge tone="ai">{d.confidence}%</Badge>
              <Badge tone="neutral">{d.categoryLabel}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Health({ label, value }) {
  const tone = value >= 80 ? 'var(--success)' : value >= 50 ? 'var(--warning)' : 'var(--critical)';
  return (
    <div className="stack g8">
      <div className="between">
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: tone }}>{value}%</span>
      </div>
      <div className="meter"><span style={{ width: `${value}%`, background: tone }} /></div>
    </div>
  );
}
