import React, { useMemo, useState } from 'react';
import {
  Badge, Card, CardHead, Chip, ChipRow, Field, Segmented, useToast,
} from '../../components/ui';
import { useOverrides } from '../../data/overrides';
import {
  CATEGORY_LIST, ZONES, departments, incidents, issues, reportHistory,
  reportTemplates, vehiclesByHour, zoneDensity, trafficKpis, monthlyTrend,
} from '../../data/mock';
import { exportCsv, exportPdf, INCIDENT_COLUMNS, ISSUE_COLUMNS } from '../../lib/export';
import { cx, formatDate, formatDateTime, timeAgo, toInputDate } from '../../lib/format';
import {
  IconFile, IconDownload, IconCalendar, IconCheckCircle, IconClock, IconTable, IconChart,
} from '../../lib/icons';

/* ------------------------------------------------------------
   Each template assembles its own dataset, summary and columns.
   ------------------------------------------------------------ */
function buildConfig(templateKey, { from, to, region, categories, rows }) {
  const meta = [
    { label: 'Period', value: `${formatDate(from)} – ${formatDate(to)}` },
    { label: 'Region', value: region },
    { label: 'Categories', value: categories.length ? categories.length + ' selected' : 'All' },
  ];

  switch (templateKey) {
    case 'traffic': {
      const hourRows = vehiclesByHour.map((h) => ({ ...h, level: h.vehicles > 900 ? 'Severe' : h.vehicles > 650 ? 'Heavy' : h.vehicles > 400 ? 'Moderate' : 'Free flowing' }));
      return {
        name: 'Traffic Congestion Report',
        subtitle: 'Congestion corridors, hourly vehicle counts and average speeds from the bus camera fleet.',
        meta,
        summary: [
          { label: 'Avg density', value: `${trafficKpis.avgDensity}/km` },
          { label: 'Avg speed', value: `${trafficKpis.avgSpeed} km/h` },
          { label: 'Peak zones', value: trafficKpis.peakZones },
          { label: 'Peak hour', value: '18:30' },
        ],
        breakdown: {
          title: 'Density by zone',
          columns: [
            { key: 'name', label: 'Zone' },
            { key: 'density', label: 'Vehicles / km' },
            { key: 'speed', label: 'Avg speed (km/h)' },
          ],
          rows: zoneDensity,
        },
        columns: [
          { key: 'hour', label: 'Hour' },
          { key: 'vehicles', label: 'Vehicles' },
          { key: 'speed', label: 'Avg speed (km/h)' },
          { key: 'level', label: 'Congestion level' },
        ],
        rows: hourRows,
        note: `Most congested corridor in this period: ${trafficKpis.mostCongested} (average delay ${trafficKpis.mostCongestedDelay}).`,
      };
    }

    case 'incident': {
      const list = incidents.filter((i) => i.detectedAt >= from && i.detectedAt <= to);
      return {
        name: 'Incident Report',
        subtitle: 'Hit-and-run, rash driving and safety incidents with plate recognition results.',
        meta,
        summary: [
          { label: 'Incidents', value: list.length },
          { label: 'Open cases', value: list.filter((i) => i.stepIndex < 4).length },
          { label: 'Closed', value: list.filter((i) => i.stepIndex === 4).length },
          { label: 'Avg OCR conf.', value: list.length ? `${(list.reduce((s, i) => s + i.ocrConfidence, 0) / list.length).toFixed(1)}%` : '—' },
        ],
        columns: INCIDENT_COLUMNS,
        rows: list,
        note: 'Plate recognition output must be verified against the state vehicle registry before enforcement action.',
      };
    }

    case 'monthly_perf': {
      const deptRows = departments.map((d) => ({
        name: d.name,
        head: d.head,
        total: d.total,
        active: d.active,
        resolved: d.resolved,
        sla: `${d.slaPct}%`,
      }));
      return {
        name: 'Monthly Performance Report',
        subtitle: 'Department resolution performance and month-on-month comparison.',
        meta,
        summary: [
          { label: 'Total reports', value: rows.length },
          { label: 'Resolved', value: rows.filter((r) => r.status === 'resolved').length },
          { label: 'Departments', value: departments.length },
          { label: 'Avg SLA', value: `${Math.round(departments.reduce((s, d) => s + d.slaPct, 0) / departments.length)}%` },
        ],
        breakdown: {
          title: 'Month-on-month volume',
          columns: [
            { key: 'month', label: 'Month' },
            { key: 'detected', label: 'Detected' },
            { key: 'resolved', label: 'Resolved' },
            { key: 'rate', label: 'Rate', get: (r) => `${Math.round((r.resolved / r.detected) * 100)}%` },
          ],
          rows: monthlyTrend.slice(-6),
        },
        columns: [
          { key: 'name', label: 'Department' },
          { key: 'head', label: 'Head of department' },
          { key: 'total', label: 'Total assigned' },
          { key: 'active', label: 'Active' },
          { key: 'resolved', label: 'Resolved' },
          { key: 'sla', label: 'SLA met' },
        ],
        rows: deptRows,
      };
    }

    case 'weekly_infra': {
      const list = rows.filter((r) => r.group === 'road' || r.group === 'infrastructure');
      const zoneRows = ZONES.map((z) => ({
        name: z,
        total: list.filter((r) => r.zone === z).length,
        open: list.filter((r) => r.zone === z && r.status !== 'resolved').length,
      })).filter((z) => z.total > 0);
      return {
        name: 'Weekly Infrastructure Report',
        subtitle: 'Road and infrastructure defects raised over the period, grouped by zone.',
        meta,
        summary: [
          { label: 'Defects', value: list.length },
          { label: 'Open', value: list.filter((r) => r.status !== 'resolved').length },
          { label: 'Critical', value: list.filter((r) => r.severity === 'critical').length },
          { label: 'Zones affected', value: zoneRows.length },
        ],
        breakdown: {
          title: 'Defects by zone',
          columns: [
            { key: 'name', label: 'Zone' },
            { key: 'total', label: 'Total' },
            { key: 'open', label: 'Open' },
          ],
          rows: zoneRows,
        },
        columns: ISSUE_COLUMNS,
        rows: list,
      };
    }

    case 'daily_city':
    default:
      return {
        name: 'Daily City Intelligence Report',
        subtitle: 'Detections, resolutions and open critical items across Greater Chennai.',
        meta,
        summary: [
          { label: 'Total reports', value: rows.length },
          { label: 'Open', value: rows.filter((r) => ['open', 'verified'].includes(r.status)).length },
          { label: 'Resolved', value: rows.filter((r) => r.status === 'resolved').length },
          { label: 'Critical', value: rows.filter((r) => r.severity === 'critical').length },
        ],
        breakdown: {
          title: 'Detections by category',
          columns: [
            { key: 'name', label: 'Category' },
            { key: 'value', label: 'Reports' },
          ],
          rows: CATEGORY_LIST.map((c) => ({ name: c.label, value: rows.filter((r) => r.category === c.key).length })).filter((r) => r.value > 0),
        },
        columns: ISSUE_COLUMNS,
        rows,
        note: 'Generated from bus-mounted AI camera detections. Confidence values reflect model output at time of detection.',
      };
  }
}

export default function ReportsExport() {
  const toast = useToast();
  const { withIssues } = useOverrides();

  const [template, setTemplate] = useState(reportTemplates[0]);
  const [from, setFrom] = useState(() => toInputDate(Date.now() - 30 * 86400000));
  const [to, setTo] = useState(() => toInputDate(Date.now()));
  const [region, setRegion] = useState('All Zones');
  const [categories, setCategories] = useState([]);
  const [format, setFormat] = useState('PDF');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState(reportHistory);

  const fromTs = new Date(`${from}T00:00:00`).getTime();
  const toTs = new Date(`${to}T23:59:59`).getTime();

  const rows = useMemo(() => {
    return withIssues(issues).filter((i) => {
      if (i.detectedAt < fromTs || i.detectedAt > toTs) return false;
      if (region !== 'All Zones' && i.zone !== region) return false;
      if (categories.length && !categories.includes(i.category)) return false;
      return true;
    });
  }, [fromTs, toTs, region, categories, withIssues]);

  const config = useMemo(
    () => buildConfig(template.key, { from: fromTs, to: toTs, region, categories, rows }),
    [template, fromTs, toTs, region, categories, rows],
  );

  const toggleCategory = (key) =>
    setCategories((c) => (c.includes(key) ? c.filter((k) => k !== key) : [...c, key]));

  const pickTemplate = (t) => {
    setTemplate(t);
    setFrom(toInputDate(Date.now() - t.defaultRange * 86400000));
    setTo(toInputDate(Date.now()));
  };

  const generate = () => {
    if (!config.rows.length) {
      toast('No records match these settings — widen the date range.', 'error');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const file = format === 'CSV' ? exportCsv(config) : exportPdf(config);
      setBusy(false);
      setHistory((h) => [
        {
          id: `RPT-${4822 + h.length}`,
          name: config.name,
          range: `${formatDate(fromTs)} – ${formatDate(toTs)}`,
          region,
          format,
          size: `${(config.rows.length * (format === 'CSV' ? 0.12 : 2.4) + 48).toFixed(0)} KB`,
          by: 'City Administrator',
          at: Date.now(),
          config,
        },
        ...h,
      ]);
      toast(`Downloaded ${file}`);
    }, 700);
  };

  const redownload = (entry) => {
    const cfg = entry.config || buildConfig('daily_city', { from: fromTs, to: toTs, region: entry.region, categories: [], rows });
    const file = entry.format === 'CSV' ? exportCsv(cfg) : exportPdf(cfg);
    toast(`Downloaded ${file}`);
  };

  return (
    <div className="admin-page stack g16">
      <div className="split-3">
        {/* ---------- template picker ---------- */}
        <div className="stack g16">
          <Card>
            <CardHead title="Report templates" subtitle="Pick what you need, then set the scope on the right" icon={<IconFile size={18} />} />
            <div className="card-body stack g12">
              {reportTemplates.map((t) => (
                <button key={t.key} type="button"
                  className={cx('card', 'interactive', 'card-pad')}
                  onClick={() => pickTemplate(t)}
                  style={{
                    textAlign: 'left', width: '100%', font: 'inherit', cursor: 'pointer',
                    borderColor: template.key === t.key ? 'var(--brand)' : undefined,
                    boxShadow: template.key === t.key ? '0 0 0 3px var(--brand-soft)' : undefined,
                    background: template.key === t.key ? 'var(--brand-softer)' : undefined,
                  }}>
                  <div className="between g12" style={{ marginBottom: 6 }}>
                    <strong className="card-title">{t.name}</strong>
                    {template.key === t.key && <IconCheckCircle size={18} style={{ color: 'var(--brand)', flex: 'none' }} />}
                  </div>
                  <p className="body" style={{ fontSize: 13.5, lineHeight: 1.55 }}>{t.description}</p>
                  <div className="row wrap g8" style={{ marginTop: 10 }}>
                    {t.sections.map((s) => <Badge key={s} tone="neutral">{s}</Badge>)}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* ---------- scope + generate ---------- */}
        <div className="stack g16">
          <Card>
            <CardHead title="Report scope" subtitle={template.name} />
            <div className="card-body stack g16">
              <div className="grid-2" style={{ gap: 12 }}>
                <Field label="From">
                  <input type="date" className="input" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
                </Field>
                <Field label="To">
                  <input type="date" className="input" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
                </Field>
              </div>

              <Field label="Region">
                <select className="select" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option>All Zones</option>
                  {ZONES.map((z) => <option key={z}>{z}</option>)}
                </select>
              </Field>

              <Field label="Categories" hint={categories.length ? `${categories.length} selected` : 'All categories included'}>
                <ChipRow>
                  {CATEGORY_LIST.map((c) => (
                    <Chip key={c.key} color={c.color} active={categories.includes(c.key)} onClick={() => toggleCategory(c.key)}>
                      {c.short}
                    </Chip>
                  ))}
                </ChipRow>
              </Field>

              <Field label="Format">
                <Segmented
                  value={format}
                  onChange={setFormat}
                  options={[
                    { key: 'PDF', label: 'PDF', icon: <IconFile size={14} /> },
                    { key: 'CSV', label: 'CSV', icon: <IconTable size={14} /> },
                  ]}
                />
              </Field>

              <div style={{ padding: '12px 14px', background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)' }}>
                <div className="between" style={{ marginBottom: 6 }}>
                  <span className="eyebrow">Preview</span>
                  <Badge tone="ai">{config.rows.length} rows</Badge>
                </div>
                <div className="row wrap g16" style={{ gap: 16 }}>
                  {config.summary.map((s) => (
                    <span key={s.label} className="stack" style={{ gap: 1 }}>
                      <span className="meta">{s.label}</span>
                      <strong className="mono" style={{ fontSize: 15 }}>{s.value}</strong>
                    </span>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg btn-block" onClick={generate} disabled={busy}>
                {busy ? 'Generating…' : <><IconDownload size={17} /> Generate Report</>}
              </button>
              <p className="meta" style={{ textAlign: 'center' }}>
                The file is built in your browser and downloaded straight away.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* ---------- history ---------- */}
      <Card>
        <CardHead title="Previously generated" subtitle="Re-download any earlier report" icon={<IconClock size={18} />} />
        <ul className="rank-list">
          {history.map((h) => (
            <li key={h.id}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: h.format === 'PDF' ? 'var(--critical-soft)' : 'var(--success-soft)', color: h.format === 'PDF' ? 'var(--critical)' : 'var(--success)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                {h.format === 'PDF' ? <IconFile size={16} /> : <IconChart size={16} />}
              </span>
              <span className="grow stack" style={{ gap: 2, minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{h.name}</span>
                <span className="meta">
                  {h.id} · {h.range} · {h.region} · {h.size} · {h.by}
                </span>
              </span>
              <Badge tone="neutral">{h.format}</Badge>
              <span className="meta" style={{ width: 84, textAlign: 'right' }}>{timeAgo(h.at)}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => redownload(h)}>
                <IconDownload size={14} /> Download
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
