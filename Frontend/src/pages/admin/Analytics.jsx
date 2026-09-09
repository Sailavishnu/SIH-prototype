import React, { useMemo, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { IssueMarkers, MapCanvas, useCategoryLegend } from '../../components/maps';
import {
  Badge, Card, CardHead, DataTable, KpiCard, Segmented, StatusBadge, useMockLoading,
} from '../../components/ui';
import { ChartTooltip, CHART, axisProps, gridProps } from '../../components/charts';
import { useAdminFilters } from '../../components/layout/AdminLayout';
import { useOverrides } from '../../data/overrides';
import {
  CATEGORIES, byDistrict, confidenceDistribution, detectionsOverTime, issues, monthlyTrend, resolutionTime,
} from '../../data/mock';
import { formatDate } from '../../lib/format';
import { IconChart, IconTable, IconMap, IconTarget, IconClock, IconCheckCircle, IconInbox } from '../../lib/icons';

const RANGES = [
  { key: '7', label: '7 days' },
  { key: '14', label: '14 days' },
  { key: '30', label: '30 days' },
];

export default function Analytics() {
  const f = useAdminFilters();
  const loading = useMockLoading(430);
  const { withIssues } = useOverrides();

  const [range, setRange] = useState('30');
  const [view, setView] = useState('chart');

  const data = useMemo(() => withIssues(f.apply(issues)), [f, withIssues]);
  const series = useMemo(() => detectionsOverTime.slice(-Number(range)), [range]);

  const catData = useMemo(
    () =>
      Object.values(CATEGORIES)
        .map((c) => ({ name: c.short, key: c.key, color: c.color, value: data.filter((i) => i.category === c.key).length }))
        .filter((c) => c.value > 0)
        .sort((a, b) => b.value - a.value),
    [data],
  );

  const avgConfidence = data.length ? (data.reduce((s, i) => s + i.confidence, 0) / data.length).toFixed(1) : '0';
  const resolvedCount = data.filter((i) => i.status === 'resolved').length;
  const legend = useCategoryLegend(data);

  const tableColumns = [
    { key: 'id', label: 'ID', render: (r) => <span className="mono" style={{ fontWeight: 600 }}>{r.id}</span>, width: 104 },
    {
      key: 'categoryLabel',
      label: 'Category',
      render: (r) => (
        <span className="row g8">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flex: 'none' }} />
          {CATEGORIES[r.category].short}
        </span>
      ),
    },
    { key: 'zone', label: 'Zone' },
    { key: 'district', label: 'District' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'confidence', label: 'Confidence', align: 'right', render: (r) => <span className="mono">{r.confidence}%</span>, width: 108 },
    { key: 'detectedAt', label: 'Detected', render: (r) => formatDate(r.detectedAt), width: 108 },
  ];

  return (
    <div className="admin-page stack g16">
      {/* summary */}
      <div className="grid-4">
        <KpiCard label="Reports in view" value={data.length} icon={<IconInbox size={16} />} tone="brand" sub={f.rangeLabel.toLowerCase()} />
        <KpiCard label="Resolved" value={resolvedCount} icon={<IconCheckCircle size={16} />} tone="success"
          sub={`${data.length ? Math.round((resolvedCount / data.length) * 100) : 0}% of reports`} />
        <KpiCard label="Avg AI confidence" value={`${avgConfidence}%`} icon={<IconTarget size={16} />} tone="ai" sub="across all detections" />
        <KpiCard label="Median resolution" value="4.2 days" icon={<IconClock size={16} />} tone="warning" delta={-9} sub="assignment to closure" />
      </div>

      {/* detections over time */}
      <Card>
        <CardHead
          title="Detections over time"
          subtitle="Daily detections against resolutions"
          action={<Segmented options={RANGES} value={range} onChange={setRange} />}
        />
        <div className="card-body">
          {loading ? <div className="chart-box tall skeleton" /> : (
            <div className="chart-box tall">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ left: -14, right: 8, top: 8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="detFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.26} />
                      <stop offset="100%" stopColor={CHART.brand} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="resFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.ai} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={CHART.ai} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} interval={Math.max(0, Math.floor(series.length / 8))} />
                  <YAxis {...axisProps} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12.5, paddingTop: 8 }} />
                  <Area type="monotone" dataKey="detections" name="Detected" stroke={CHART.brand} strokeWidth={2.4} fill="url(#detFill)" />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke={CHART.ai} strokeWidth={2.4} fill="url(#resFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>

      {/* category + district */}
      <div className="grid-2">
        <Card>
          <CardHead title="Issues by category" />
          <div className="card-body">
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid {...gridProps} horizontal={false} vertical />
                  <XAxis type="number" {...axisProps} />
                  <YAxis type="category" dataKey="name" width={112} {...axisProps} />
                  <Tooltip cursor={{ fill: 'rgba(21,94,239,.05)' }} content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Reports" radius={[0, 6, 6, 0]} barSize={17}>
                    {catData.map((c) => <Cell key={c.key} fill={c.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <CardHead title="Issues by district" subtitle="Raised against resolved" />
          <div className="card-body">
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDistrict} margin={{ left: -14, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip cursor={{ fill: 'rgba(21,94,239,.05)' }} content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12.5, paddingTop: 8 }} />
                  <Bar dataKey="value" name="Raised" fill={CHART.brand} radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="resolved" name="Resolved" fill={CHART.ai} radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* resolution time + confidence */}
      <div className="grid-2">
        <Card>
          <CardHead title="Average resolution time" subtitle="Days from detection to closure, by category" />
          <div className="card-body">
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resolutionTime} margin={{ left: -14, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="name" {...axisProps} interval={0} angle={-16} textAnchor="end" height={52} />
                  <YAxis {...axisProps} unit="d" />
                  <Tooltip cursor={{ fill: 'rgba(21,94,239,.05)' }} content={<ChartTooltip unit=" days" />} />
                  <Bar dataKey="days" name="Resolution time" radius={[6, 6, 0, 0]} maxBarSize={42}>
                    {resolutionTime.map((r) => (
                      <Cell key={r.name} fill={r.days > 7 ? CHART.critical : r.days > 4 ? CHART.warning : CHART.success} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <CardHead title="AI confidence distribution" subtitle="How certain the model was across all detections" />
          <div className="card-body">
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceDistribution} margin={{ left: -14, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip cursor={{ fill: 'rgba(20,184,166,.06)' }} content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Detections" fill={CHART.ai} radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="meta" style={{ marginTop: 8 }}>
              Detections below 80% confidence are held for manual verification before assignment.
            </p>
          </div>
        </Card>
      </div>

      {/* monthly comparison */}
      <Card>
        <CardHead title="Monthly comparison" subtitle="Detected against resolved over the last 12 months" />
        <div className="card-body">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ left: -14, right: 8, top: 8, bottom: 4 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12.5, paddingTop: 8 }} />
                <Line type="monotone" dataKey="detected" name="Detected" stroke={CHART.brand} strokeWidth={2.4} dot={false} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke={CHART.success} strokeWidth={2.4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* main dataset — chart / table / map */}
      <Card>
        <CardHead
          title="Main dataset"
          subtitle={`${data.length} report${data.length === 1 ? '' : 's'} in the current filter`}
          action={
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { key: 'chart', label: 'Chart', icon: <IconChart size={14} /> },
                { key: 'table', label: 'Table', icon: <IconTable size={14} /> },
                { key: 'map', label: 'Map', icon: <IconMap size={14} /> },
              ]}
            />
          }
        />

        {view === 'chart' && (
          <div className="card-body">
            <div className="chart-box tall">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} margin={{ left: -14, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="name" {...axisProps} interval={0} angle={-16} textAnchor="end" height={58} />
                  <YAxis {...axisProps} />
                  <Tooltip cursor={{ fill: 'rgba(21,94,239,.05)' }} content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Reports" radius={[6, 6, 0, 0]} maxBarSize={54}>
                    {catData.map((c) => <Cell key={c.key} fill={c.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {view === 'table' && (
          <DataTable columns={tableColumns} rows={data} pageSize={10} initialSort={{ key: 'detectedAt', dir: 'desc' }} />
        )}

        {view === 'map' && (
          <div style={{ padding: 20 }}>
            <MapCanvas height={420} zoom={11} legend={legend}>
              <IssueMarkers issues={data} pulseCritical={false} />
            </MapCanvas>
          </div>
        )}
      </Card>
    </div>
  );
}
