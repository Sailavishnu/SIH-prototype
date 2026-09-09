import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge, Card, CardHead, Chip, ChipRow, DataTable, KpiCard, useMockLoading, useToast,
} from '../../components/ui';
import { useAdminFilters } from '../../components/layout/AdminLayout';
import { useOverrides } from '../../data/overrides';
import { INCIDENT_STEPS, INCIDENT_TYPE_LIST, incidents } from '../../data/mock';
import { exportCsv, exportPdf, INCIDENT_COLUMNS } from '../../lib/export';
import { formatDateTime, timeAgo } from '../../lib/format';
import { IconCamera, IconDownload, IconFile, IconAlert, IconShield, IconTarget, IconClock } from '../../lib/icons';

const STEP_TONE = ['critical', 'info', 'info', 'warning', 'success'];

export default function Incidents() {
  const f = useAdminFilters();
  const toast = useToast();
  const navigate = useNavigate();
  const loading = useMockLoading(420);
  const { withIncidents } = useOverrides();
  const [type, setType] = useState('all');

  const rows = useMemo(() => {
    const base = withIncidents(incidents).filter((i) => {
      const cutoff = f.range === 'all' ? 0 : Date.now() - Number(f.range) * 86400000;
      if (i.detectedAt < cutoff) return false;
      if (f.district !== 'all' && i.district !== f.district) return false;
      if (f.query.trim()) {
        const q = f.query.trim().toLowerCase();
        if (!`${i.id} ${i.plate} ${i.typeLabel} ${i.area}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    return type === 'all' ? base : base.filter((i) => i.type === type);
  }, [f, type, withIncidents]);

  const openCases = rows.filter((i) => i.stepIndex < 4).length;
  const avgOcr = rows.length ? (rows.reduce((s, i) => s + i.ocrConfidence, 0) / rows.length).toFixed(1) : '0';

  const cfg = () => ({
    name: 'Incident Report',
    subtitle: 'Hit-and-run, rash driving and safety incidents captured by the bus camera fleet.',
    meta: [{ label: 'Period', value: f.rangeLabel }, { label: 'Region', value: f.regionLabel }],
    summary: [
      { label: 'Incidents', value: rows.length },
      { label: 'Open cases', value: openCases },
      { label: 'Closed', value: rows.length - openCases },
      { label: 'Avg OCR conf.', value: `${avgOcr}%` },
    ],
    columns: INCIDENT_COLUMNS,
    rows,
    note: 'Plate recognition results are model output and must be verified against the state vehicle registry before any enforcement action.',
  });

  const columns = [
    { key: 'id', label: 'ID', render: (r) => <span className="mono" style={{ fontWeight: 600 }}>{r.id}</span>, width: 96 },
    {
      key: 'typeLabel',
      label: 'Incident type',
      render: (r) => <Badge tone={r.tone}>{r.typeLabel}</Badge>,
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      sortable: false,
      render: (r) => (
        <span className="row g10" style={{ gap: 10 }}>
          <span style={{ width: 46, height: 32, borderRadius: 5, background: 'linear-gradient(145deg,#e4e9ef,#f1f4f7)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', color: 'var(--text-3)', flex: 'none' }}>
            <IconCamera size={14} />
          </span>
          <span className="stack" style={{ gap: 1 }}>
            <span style={{ fontSize: 13 }}>{r.vehicleType}</span>
            <span className="meta">{r.vehicleColor}</span>
          </span>
        </span>
      ),
      width: 150,
    },
    { key: 'plate', label: 'Number plate', render: (r) => <span className="plate">{r.plate}</span>, width: 150 },
    {
      key: 'ocrConfidence',
      label: 'OCR',
      align: 'right',
      render: (r) => (
        <span className="mono" style={{ fontWeight: 600, color: r.ocrConfidence >= 90 ? 'var(--success)' : r.ocrConfidence >= 78 ? 'var(--text)' : 'var(--warning)' }}>
          {r.ocrConfidence}%
        </span>
      ),
      width: 84,
    },
    { key: 'area', label: 'Location', render: (r) => <span>{r.area}<span className="meta" style={{ display: 'block' }}>{r.road}</span></span> },
    { key: 'detectedAt', label: 'Time', render: (r) => <span>{timeAgo(r.detectedAt)}<span className="meta" style={{ display: 'block' }}>{formatDateTime(r.detectedAt)}</span></span>, width: 150 },
    {
      key: 'stepIndex',
      label: 'Status',
      render: (r) => <Badge tone={STEP_TONE[r.stepIndex]} dot>{INCIDENT_STEPS[r.stepIndex].label}</Badge>,
      width: 118,
    },
  ];

  return (
    <div className="admin-page stack g16">
      <div className="grid-4">
        <KpiCard label="Total incidents" value={rows.length} icon={<IconAlert size={16} />} tone="critical" />
        <KpiCard label="Open cases" value={openCases} icon={<IconClock size={16} />} tone="warning" sub="not yet closed" />
        <KpiCard label="Avg OCR confidence" value={`${avgOcr}%`} icon={<IconTarget size={16} />} tone="ai" sub="plate recognition" />
        <KpiCard label="Hit and run" value={rows.filter((r) => r.type === 'hit_and_run').length} icon={<IconShield size={16} />} tone="critical" sub="highest priority" />
      </div>

      <Card>
        <CardHead
          title="Incident log"
          subtitle="Click any row to open the full case file"
          action={
            <div className="row g8">
              <button className="btn btn-secondary btn-sm" onClick={() => toast(`Downloaded ${exportCsv(cfg())}`)}>
                <IconDownload size={15} /> CSV
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => toast(`Downloaded ${exportPdf(cfg())}`)}>
                <IconFile size={15} /> PDF
              </button>
            </div>
          }
        />

        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <ChipRow>
            <Chip active={type === 'all'} onClick={() => setType('all')} count={incidents.length}>All types</Chip>
            {INCIDENT_TYPE_LIST.map((t) => (
              <Chip key={t.key} active={type === t.key} onClick={() => setType(t.key)}
                count={incidents.filter((i) => i.type === t.key).length}>
                {t.label}
              </Chip>
            ))}
          </ChipRow>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pageSize={10}
          initialSort={{ key: 'detectedAt', dir: 'desc' }}
          onRowClick={(r) => navigate(`/admin/incidents/${r.id}`)}
        />
      </Card>
    </div>
  );
}
