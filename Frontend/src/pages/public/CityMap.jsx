import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeatLayer, IssueMarkers, MapCanvas, useCategoryLegend } from '../../components/maps';
import {
  AiTag, Badge, Chip, ChipRow, ConfidenceBar, Drawer, KeyValue, Photo,
  Segmented, SeverityBadge, StatusBadge, useToast,
} from '../../components/ui';
import {
  CATEGORIES, DISTRICTS, GROUPS, SEVERITY_LIST, STATUS_LIST, issues,
} from '../../data/mock';
import { formatDateTime, formatGps } from '../../lib/format';
import {
  IconLayers, IconPin, IconFlame, IconSearch, IconPen, IconArrowRight, IconShare, IconLocate,
} from '../../lib/icons';

export default function CityMap() {
  const navigate = useNavigate();
  const toast = useToast();

  const [view, setView] = useState('markers');
  const [group, setGroup] = useState('all');
  const [district, setDistrict] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues.filter((i) => {
      if (group !== 'all' && i.group !== group) return false;
      if (district !== 'all' && i.district !== district) return false;
      if (severity !== 'all' && i.severity !== severity) return false;
      if (q) {
        const hay = `${i.id} ${i.title || ''} ${i.area} ${i.road || ''} ${i.categoryLabel || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [group, district, severity, query]);

  const legend = useCategoryLegend(visible);
  const heatPoints = useMemo(
    () =>
      visible.map((i) => [
        i.lat,
        i.lng,
        i.severity === 'critical' ? 1 : i.severity === 'high' ? 0.75 : i.severity === 'medium' ? 0.5 : 0.3,
      ]),
    [visible],
  );

  const open = (issue) => setSelected(issue);
  const cat = selected ? CATEGORIES[selected.category] : null;

  return (
    <div className="public-page flush" style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Filter & Control Strip */}
      <div
        className="between wrap g12"
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flex: 'none',
          boxShadow: 'var(--sh-xs)',
        }}
      >
        <ChipRow>
          {GROUPS.map((g) => (
            <Chip key={g.key} active={group === g.key} onClick={() => setGroup(g.key)}>
              {g.label}
            </Chip>
          ))}
        </ChipRow>

        <div className="row g8 wrap">
          <select
            className="select"
            style={{ height: 34, width: 136 }}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            aria-label="District"
          >
            <option value="all">All districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            className="select"
            style={{ height: 34, width: 130 }}
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            aria-label="Severity"
          >
            <option value="all">All severities</option>
            {SEVERITY_LIST.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>

          <div className="search" style={{ width: 180 }}>
            <IconSearch size={14} />
            <input
              className="input"
              style={{ height: 34, fontSize: 13 }}
              placeholder="Search area or issue…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Segmented
            value={view}
            onChange={setView}
            options={[
              { key: 'markers', label: 'GIS Map', icon: <IconPin size={14} /> },
              { key: 'heatmap', label: 'Heatmap', icon: <IconFlame size={14} /> },
            ]}
          />
        </div>
      </div>

      {/* Full-bleed Map Canvas */}
      <div style={{ flex: 1, minHeight: 480, display: 'flex', flexDirection: 'column' }}>
        <MapCanvas
          height="100%"
          style={{ flex: 1, minHeight: 480 }}
          flush
          center={[10.9, 78.5]}
          zoom={7}
          legend={
            view === 'markers'
              ? legend
              : [
                  { label: 'Low density', color: '#155EEF' },
                  { label: 'Moderate', color: '#14B8A6' },
                  { label: 'High', color: '#F79009' },
                  { label: 'Severe', color: '#F04438' },
                ]
          }
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
          {view === 'markers' ? (
            <IssueMarkers issues={visible} onSelect={open} />
          ) : (
            <HeatLayer points={heatPoints} radius={34} blur={24} />
          )}
        </MapCanvas>
      </div>

      {/* Citizen Issue Detail Drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        subtitle={selected ? `${selected.id} · ${selected.road}, ${selected.area}` : ''}
        footer={
          selected && (
            <div className="stack g8">
              <button
                className="btn btn-primary btn-block"
                onClick={() => navigate(`/app/issue/${selected.id}`)}
              >
                View Full Report & Timeline <IconArrowRight size={15} />
              </button>
              <div className="row g8">
                <button
                  className="btn btn-secondary grow"
                  onClick={() => {
                    navigator.clipboard?.writeText?.(window.location.href);
                    toast('Issue link copied to clipboard!');
                  }}
                >
                  <IconShare size={15} /> Share
                </button>
                <button
                  className="btn btn-secondary grow"
                  onClick={() => navigate('/app/report')}
                >
                  <IconPen size={15} /> Report New
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
              label="Evidence frame — on-bus AI camera"
              tag={<AiTag confidence={selected.confidence}>{cat.label.toUpperCase()}</AiTag>}
              bbox={{ x: '24%', y: '42%', w: '34%', h: '32%', label: `${cat.short} ${selected.confidence}%` }}
            />

            <div className="row g8 wrap">
              <Badge tone="neutral" style={{ background: `${cat.color}14`, color: cat.color }}>
                {cat.label}
              </Badge>
              <SeverityBadge severity={selected.severity} />
              <StatusBadge status={selected.status} />
              <Badge tone="neutral">{selected.priority}</Badge>
            </div>

            <ConfidenceBar value={selected.confidence} />

            <p className="body" style={{ lineHeight: 1.6 }}>{selected.description}</p>

            <KeyValue
              items={[
                { label: 'Issue ID', value: <span className="mono">{selected.id}</span> },
                { label: 'Location', value: `${selected.road}, ${selected.area}` },
                { label: 'District / Zone', value: `${selected.district} · ${selected.zone}` },
                { label: 'GPS', value: <span className="mono">{formatGps(selected.lat, selected.lng)}</span> },
                { label: 'Detected on', value: formatDateTime(selected.detectedAt) },
                { label: 'Responsible Dept', value: selected.department },
                { label: 'Status', value: <StatusBadge status={selected.status} /> },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
