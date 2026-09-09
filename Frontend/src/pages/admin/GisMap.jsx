import React, { useMemo, useState } from 'react';
import { HeatLayer, IssueMarkers, MapCanvas, useCategoryLegend } from '../../components/maps';
import {
  AiTag, Badge, Chip, ChipRow, ConfidenceBar, Drawer, KeyValue, Photo,
  Segmented, SeverityBadge, StatusBadge, useToast,
} from '../../components/ui';
import { useAdminFilters } from '../../components/layout/AdminLayout';
import { useOverrides } from '../../data/overrides';
import { CATEGORIES, GROUPS, SEVERITY_LIST, STATUS_LIST, issues, departments } from '../../data/mock';
import { formatDateTime, formatGps } from '../../lib/format';
import { IconLayers, IconPin, IconFlame, IconCheckCircle, IconUsers, IconBus } from '../../lib/icons';

export default function GisMap() {
  const f = useAdminFilters();
  const toast = useToast();
  const { withIssues, setStatus, setDepartment } = useOverrides();

  const [view, setView] = useState('markers');
  const [group, setGroup] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [assignTo, setAssignTo] = useState(departments[0].name);

  const visible = useMemo(() => {
    return withIssues(f.apply(issues)).filter((i) => {
      if (group !== 'all' && i.group !== group) return false;
      if (severity !== 'all' && i.severity !== severity) return false;
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      return true;
    });
  }, [f, group, severity, statusFilter, withIssues]);

  const legend = useCategoryLegend(visible);
  const heatPoints = useMemo(
    () => visible.map((i) => [i.lat, i.lng, i.severity === 'critical' ? 1 : i.severity === 'high' ? 0.75 : i.severity === 'medium' ? 0.5 : 0.3]),
    [visible],
  );

  const open = (issue) => { setSelected(issue); setAssignTo(issue.department); };
  const cat = selected ? CATEGORIES[selected.category] : null;

  const act = (fn, message) => { fn(); toast(message); setSelected(null); };

  return (
    <div className="admin-page flush" style={{ height: 'calc(100vh - var(--topbar-h))' }}>
      {/* filter row */}
      <div className="between wrap g12" style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flex: 'none' }}>
        <ChipRow>
          {GROUPS.map((g) => (
            <Chip key={g.key} active={group === g.key} onClick={() => setGroup(g.key)}>{g.label}</Chip>
          ))}
        </ChipRow>

        <div className="row g8 wrap">
          <select className="select" style={{ height: 34, width: 138 }} value={severity} onChange={(e) => setSeverity(e.target.value)} aria-label="Severity">
            <option value="all">All severities</option>
            {SEVERITY_LIST.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <select className="select" style={{ height: 34, width: 138 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status">
            <option value="all">All statuses</option>
            {STATUS_LIST.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { key: 'markers', label: 'Markers', icon: <IconPin size={14} /> },
              { key: 'heatmap', label: 'Heatmap', icon: <IconFlame size={14} /> },
            ]}
          />
        </div>
      </div>

      {/* map */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <MapCanvas
          height="100%"
          flush
          zoom={11}
          legend={view === 'markers' ? legend : [
            { label: 'Low density', color: '#155EEF' },
            { label: 'Moderate', color: '#14B8A6' },
            { label: 'High', color: '#F79009' },
            { label: 'Severe', color: '#F04438' },
          ]}
          overlay={
            <div className="map-overlay-tr">
              <div className="map-float row g12" style={{ padding: '8px 14px' }}>
                <span className="row g8" style={{ fontSize: 13, fontWeight: 600 }}>
                  <IconLayers size={15} /> {visible.length} detections
                </span>
                <span className="badge badge-critical">
                  {visible.filter((i) => i.severity === 'critical').length} critical
                </span>
              </div>
            </div>
          }
        >
          {view === 'markers'
            ? <IssueMarkers issues={visible} onSelect={open} />
            : <HeatLayer points={heatPoints} radius={34} blur={26} />}
        </MapCanvas>
      </div>

      {/* detail drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        subtitle={selected ? `${selected.id} · ${selected.road}, ${selected.area}` : ''}
        footer={
          selected && (
            <div className="stack g8">
              <div className="row g8">
                <select className="select" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} aria-label="Assign to department">
                  {departments.map((d) => <option key={d.key} value={d.name}>{d.name}</option>)}
                </select>
                <button className="btn btn-secondary" style={{ flex: 'none' }}
                  onClick={() => act(() => { setDepartment(selected.id, assignTo); setStatus(selected.id, 'assigned'); }, `${selected.id} assigned to ${assignTo}`)}>
                  <IconUsers size={15} /> Assign
                </button>
              </div>
              <div className="row g8">
                <button className="btn btn-secondary grow"
                  onClick={() => act(() => setStatus(selected.id, 'in_progress'), `${selected.id} marked in progress`)}>
                  Mark in progress
                </button>
                <button className="btn btn-primary grow"
                  onClick={() => act(() => setStatus(selected.id, 'resolved'), `${selected.id} marked resolved`)}>
                  <IconCheckCircle size={15} /> Resolve
                </button>
              </div>
            </div>
          )
        }
      >
        {selected && (
          <div className="stack g16">
            <Photo
              height={200}
              label="Evidence frame — on-bus camera"
              tag={<AiTag confidence={selected.confidence}>{cat.label.toUpperCase()}</AiTag>}
              bbox={{ x: '24%', y: '42%', w: '34%', h: '32%', label: `${cat.short} ${selected.confidence}%` }}
            />

            <div className="row g8 wrap">
              <Badge tone="neutral" style={{ background: `${cat.color}14`, color: cat.color }}>{cat.label}</Badge>
              <SeverityBadge severity={selected.severity} />
              <StatusBadge status={selected.status} />
              <Badge tone="neutral">{selected.priority}</Badge>
            </div>

            <ConfidenceBar value={selected.confidence} />

            <p className="body" style={{ lineHeight: 1.6 }}>{selected.description}</p>

            <KeyValue
              items={[
                { label: 'Report ID', value: <span className="mono">{selected.id}</span> },
                { label: 'GPS', value: <span className="mono">{formatGps(selected.lat, selected.lng)}</span> },
                { label: 'Zone', value: `${selected.zone} · ${selected.district}` },
                { label: 'Detected', value: formatDateTime(selected.detectedAt) },
                { label: 'Last update', value: formatDateTime(selected.updatedAt) },
                { label: 'Source', value: selected.source === 'AI' ? 'AI camera detection' : 'Citizen report' },
                selected.busId && { label: 'Captured by', value: <span className="row g8"><IconBus size={14} />{selected.busId}</span> },
                { label: 'Department', value: selected.department },
                selected.assignedTo && { label: 'Officer', value: selected.assignedTo },
                { label: 'Confirmations', value: `${selected.passes} bus pass${selected.passes === 1 ? '' : 'es'}` },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
