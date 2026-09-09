import React, { useMemo, useState } from 'react';
import { MiniMap } from '../../components/maps';
import {
  AiTag, Badge, Card, CardHead, ConfidenceBar, DataTable, Drawer, KeyValue, Photo,
  PriorityBadge, SeverityBadge, StatusBadge, useMockLoading, useToast,
} from '../../components/ui';
import { useAdminFilters } from '../../components/layout/AdminLayout';
import { useOverrides } from '../../data/overrides';
import { CATEGORIES, STATUS_LIST, departments, issues } from '../../data/mock';
import { exportCsv, exportPdf, ISSUE_COLUMNS } from '../../lib/export';
import { formatDate, formatDateTime, formatGps } from '../../lib/format';
import { IconDownload, IconFile, IconTable, IconCheckCircle, IconUsers } from '../../lib/icons';

export default function ReportsTable() {
  const f = useAdminFilters();
  const toast = useToast();
  const loading = useMockLoading(420);
  const { withIssues, setStatus, setDepartment } = useOverrides();

  const [selected, setSelected] = useState(null);
  const [assignTo, setAssignTo] = useState(departments[0].name);

  const rows = useMemo(() => withIssues(f.apply(issues)), [f, withIssues]);

  const exportCfg = () => ({
    name: 'Reports Export',
    subtitle: 'Filtered report register from the UrbanSight AI console.',
    meta: [
      { label: 'Period', value: f.rangeLabel },
      { label: 'Region', value: f.regionLabel },
      { label: 'Filters', value: f.activeCount ? `${f.activeCount} applied` : 'None' },
    ],
    summary: [
      { label: 'Records', value: rows.length },
      { label: 'Open', value: rows.filter((r) => ['open', 'verified'].includes(r.status)).length },
      { label: 'Resolved', value: rows.filter((r) => r.status === 'resolved').length },
      { label: 'Critical', value: rows.filter((r) => r.severity === 'critical').length },
    ],
    columns: ISSUE_COLUMNS,
    rows,
  });

  const doExport = (format) => {
    const file = format === 'CSV' ? exportCsv(exportCfg()) : exportPdf(exportCfg());
    toast(`Downloaded ${file}`);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (r) => <span className="mono" style={{ fontWeight: 600 }}>{r.id}</span>,
      width: 104,
    },
    {
      key: 'categoryLabel',
      label: 'Category',
      render: (r) => (
        <span className="row g8">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORIES[r.category].color, flex: 'none' }} />
          {CATEGORIES[r.category].short}
        </span>
      ),
    },
    { key: 'district', label: 'District', render: (r) => <span>{r.district}<span className="meta" style={{ display: 'block' }}>{r.area}</span></span> },
    { key: 'detectedAt', label: 'Date', render: (r) => formatDate(r.detectedAt), width: 108 },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} />, sortValue: (r) => STATUS_LIST.findIndex((s) => s.key === r.status) },
    {
      key: 'confidence',
      label: 'AI Confidence',
      align: 'right',
      render: (r) => (
        <span className="row g8" style={{ justifyContent: 'flex-end' }}>
          <span style={{ width: 44 }}>
            <span className="meter"><span style={{ width: `${r.confidence}%`, background: r.confidence >= 90 ? 'var(--success)' : 'var(--ai)' }} /></span>
          </span>
          <span className="mono" style={{ fontWeight: 600, width: 42, textAlign: 'right' }}>{r.confidence}%</span>
        </span>
      ),
      width: 150,
    },
    { key: 'priority', label: 'Priority', render: (r) => <PriorityBadge priority={r.priority} />, width: 88 },
  ];

  const cat = selected ? CATEGORIES[selected.category] : null;
  const act = (fn, message) => { fn(); toast(message); setSelected(null); };

  return (
    <div className="admin-page stack g16">
      <Card>
        <CardHead
          title="Report register"
          subtitle={`${rows.length} record${rows.length === 1 ? '' : 's'} · ${f.rangeLabel.toLowerCase()} · ${f.regionLabel}`}
          icon={<IconTable size={18} />}
          action={
            <div className="row g8">
              <button className="btn btn-secondary btn-sm" onClick={() => doExport('CSV')}>
                <IconDownload size={15} /> Export CSV
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => doExport('PDF')}>
                <IconFile size={15} /> Export PDF
              </button>
            </div>
          }
        />
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pageSize={12}
          initialSort={{ key: 'detectedAt', dir: 'desc' }}
          activeKey={selected?.id}
          onRowClick={(r) => { setSelected(r); setAssignTo(r.department); }}
        />
      </Card>

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
                  onClick={() => act(() => setStatus(selected.id, 'verified'), `${selected.id} marked verified`)}>
                  Mark verified
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
              height={190}
              label="Evidence frame — on-bus camera"
              tag={<AiTag confidence={selected.confidence}>{cat.label.toUpperCase()}</AiTag>}
              bbox={{ x: '26%', y: '40%', w: '32%', h: '34%', label: `${cat.short} ${selected.confidence}%` }}
            />

            <div className="row g8 wrap">
              <Badge tone="neutral" style={{ background: `${cat.color}14`, color: cat.color }}>{cat.label}</Badge>
              <SeverityBadge severity={selected.severity} />
              <StatusBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
            </div>

            <ConfidenceBar value={selected.confidence} />
            <p className="body" style={{ lineHeight: 1.6 }}>{selected.description}</p>

            <MiniMap lat={selected.lat} lng={selected.lng} color={cat.color} height={160} />

            <KeyValue
              items={[
                { label: 'GPS', value: <span className="mono">{formatGps(selected.lat, selected.lng)}</span> },
                { label: 'Zone', value: `${selected.zone} · ${selected.district}` },
                { label: 'Detected', value: formatDateTime(selected.detectedAt) },
                { label: 'Source', value: selected.source === 'AI' ? 'AI camera detection' : 'Citizen report' },
                selected.busId && { label: 'Captured by', value: selected.busId },
                { label: 'Department', value: selected.department },
                selected.assignedTo && { label: 'Officer', value: selected.assignedTo },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
