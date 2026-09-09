import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapCanvas, Marker, Popup, busIcon } from '../../components/maps';
import {
  Badge, Card, CardHead, Chip, ChipRow, DataTable, KpiCard, useMockLoading,
} from '../../components/ui';
import { buses } from '../../data/mock';
import { formatNumber, timeAgo } from '../../lib/format';
import { IconBus, IconCamera, IconSignal, IconWifiOff, IconMap } from '../../lib/icons';

const CAMERA_META = {
  online: { label: 'Online', tone: 'success', icon: IconSignal },
  degraded: { label: 'Degraded', tone: 'warning', icon: IconCamera },
  offline: { label: 'Offline', tone: 'critical', icon: IconWifiOff },
};

export default function Fleet() {
  const navigate = useNavigate();
  const loading = useMockLoading(400);
  const [filter, setFilter] = useState('all');

  const rows = useMemo(
    () => (filter === 'all' ? buses : buses.filter((b) => b.camera === filter)),
    [filter],
  );

  const totals = useMemo(() => ({
    active: buses.filter((b) => b.status === 'On Route').length,
    events: buses.reduce((s, b) => s + b.eventsToday, 0),
    online: buses.filter((b) => b.camera === 'online').length,
    issues: buses.filter((b) => b.camera !== 'online').length,
  }), []);

  const columns = [
    { key: 'id', label: 'Bus ID', render: (b) => <span className="mono" style={{ fontWeight: 600 }}>{b.id}</span>, width: 128 },
    {
      key: 'route',
      label: 'Route',
      render: (b) => (
        <span className="stack" style={{ gap: 1 }}>
          <span style={{ fontWeight: 500 }}>{b.route}</span>
          <span className="meta">{b.depot}</span>
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (b) => (
        <Badge tone={b.status === 'On Route' ? 'success' : b.status === 'Idle' ? 'warning' : 'neutral'} dot>
          {b.status}
        </Badge>
      ),
      width: 116,
    },
    { key: 'lastArea', label: 'Last location', render: (b) => <span>{b.lastArea}<span className="meta" style={{ display: 'block' }}>{b.kmToday} km today</span></span> },
    {
      key: 'eventsToday',
      label: 'Events today',
      align: 'right',
      render: (b) => <span className="mono" style={{ fontWeight: 600 }}>{b.eventsToday}</span>,
      width: 112,
    },
    {
      key: 'camera',
      label: 'Camera',
      render: (b) => {
        const m = CAMERA_META[b.camera];
        return <Badge tone={m.tone} dot>{m.label}</Badge>;
      },
      width: 118,
    },
    { key: 'lastSync', label: 'Last sync', render: (b) => <span className="meta">{timeAgo(b.lastSync)}</span>, width: 110 },
  ];

  return (
    <div className="admin-page stack g16">
      <div className="grid-4">
        <KpiCard label="Buses on route" value={`${totals.active} / ${buses.length}`} icon={<IconBus size={16} />} tone="brand" sub="carrying AI cameras" />
        <KpiCard label="Events detected today" value={totals.events} icon={<IconCamera size={16} />} tone="ai" delta={7} sub="across the fleet" />
        <KpiCard label="Cameras online" value={totals.online} icon={<IconSignal size={16} />} tone="success" sub={`${Math.round((totals.online / buses.length) * 100)}% of fleet`} />
        <KpiCard label="Needs attention" value={totals.issues} icon={<IconWifiOff size={16} />} tone="warning" sub="degraded or offline" />
      </div>

      <Card>
        <CardHead title="Fleet live positions" subtitle="Last reported location of every camera-equipped bus" icon={<IconMap size={18} />} />
        <div style={{ padding: 20 }}>
          <MapCanvas height={320} zoom={11}>
            {buses.map((b) => (
              <Marker key={b.id} position={[b.lat, b.lng]} icon={busIcon()}
                eventHandlers={{ click: () => navigate(`/admin/fleet/${b.id}`) }}>
                <Popup>
                  <strong>{b.id}</strong><br />
                  {b.route}<br />
                  <span style={{ color: '#98A2B3' }}>{b.eventsToday} events today · camera {b.camera}</span>
                </Popup>
              </Marker>
            ))}
          </MapCanvas>
        </div>
      </Card>

      <Card>
        <CardHead title="Bus fleet" subtitle="Click a bus to open its profile" />
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <ChipRow>
            <Chip active={filter === 'all'} onClick={() => setFilter('all')} count={buses.length}>All buses</Chip>
            {Object.entries(CAMERA_META).map(([key, m]) => (
              <Chip key={key} active={filter === key} onClick={() => setFilter(key)}
                count={buses.filter((b) => b.camera === key).length}>
                {m.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pageSize={12}
          initialSort={{ key: 'eventsToday', dir: 'desc' }}
          onRowClick={(b) => navigate(`/admin/fleet/${b.id}`)}
        />
      </Card>
    </div>
  );
}
