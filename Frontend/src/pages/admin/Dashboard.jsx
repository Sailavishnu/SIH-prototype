import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from 'recharts';
import { ActivityItem, Card, CardHead, KpiCard, useToast } from '../../components/ui';
import { ChartTooltip, CHART, axisProps, gridProps } from '../../components/charts';
import { useAdminFilters } from '../../components/layout/AdminLayout';
import { CATEGORIES, incidents, issues, monthlyTrend, recentActivity } from '../../data/mock';
import { exportPdf, ISSUE_COLUMNS } from '../../lib/export';
import { formatDate } from '../../lib/format';
import {
  IconDownload, IconInbox, IconAlert, IconCheckCircle, IconClock, IconShield, IconArrowRight,
} from '../../lib/icons';

export default function Dashboard() {
  const f = useAdminFilters();
  const toast = useToast();
  const data = useMemo(() => f.apply(issues), [f]);

  const kpis = useMemo(() => {
    const open = data.filter((i) => ['open', 'verified'].includes(i.status)).length;
    const resolved = data.filter((i) => i.status === 'resolved').length;
    return {
      total: data.length,
      open,
      resolved,
      rate: data.length ? Math.round((resolved / data.length) * 100) : 0,
      activeIncidents: incidents.filter((i) => i.stepIndex < 4).length,
    };
  }, [data]);

  const catData = useMemo(
    () =>
      Object.values(CATEGORIES)
        .map((c) => ({ name: c.short, key: c.key, color: c.color, value: data.filter((i) => i.category === c.key).length }))
        .filter((c) => c.value > 0)
        .sort((a, b) => b.value - a.value),
    [data],
  );

  const download = () => {
    const file = exportPdf({
      name: 'Daily City Intelligence Report',
      subtitle: 'Detections, resolutions and open critical items across Greater Chennai.',
      meta: [
        { label: 'Period', value: f.rangeLabel },
        { label: 'Region', value: f.regionLabel },
      ],
      summary: [
        { label: 'Total reports', value: kpis.total },
        { label: 'Open', value: kpis.open },
        { label: 'Resolved', value: kpis.resolved },
        { label: 'Resolution rate', value: `${kpis.rate}%` },
      ],
      breakdown: {
        title: 'Detections by category',
        columns: [
          { key: 'name', label: 'Category' },
          { key: 'value', label: 'Reports' },
        ],
        rows: catData,
      },
      columns: ISSUE_COLUMNS,
      rows: data.slice(0, 60),
      note: 'Generated from bus-mounted AI camera detections. Confidence values reflect model output at the time of detection.',
    });
    toast(`Downloaded ${file}`);
  };

  return (
    <div className="admin-page stack g16">
      {/* KPI row */}
      <div className="between wrap g12">
        <p className="meta">
          Showing {f.rangeLabel.toLowerCase()} · {f.regionLabel} · {data.length} report{data.length === 1 ? '' : 's'}
        </p>
        <button className="btn btn-primary" onClick={download}>
          <IconDownload size={16} /> Download Report
        </button>
      </div>

      <div className="kpi-row">
        <KpiCard label="Total reports" value={kpis.total} icon={<IconInbox size={16} />} tone="brand" delta={9} sub="vs previous period" />
        <KpiCard label="Open" value={kpis.open} icon={<IconAlert size={16} />} tone="critical" delta={-4} sub="awaiting action" />
        <KpiCard label="Resolved" value={kpis.resolved} icon={<IconCheckCircle size={16} />} tone="success" delta={14} deltaInvert sub={`${kpis.rate}% of total`} />
        <KpiCard label="Avg response time" value="6.4 h" icon={<IconClock size={16} />} tone="ai" delta={-11} sub="detection to assignment" />
        <KpiCard label="Active incidents" value={kpis.activeIncidents} icon={<IconShield size={16} />} tone="warning" sub="open safety cases" />
      </div>

      {/* charts */}
      <div className="grid-2">
        <Card>
          <CardHead title="Reports by category" subtitle="Detections in the selected period" />
          <div className="card-body">
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} margin={{ left: -14, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="name" {...axisProps} interval={0} angle={-18} textAnchor="end" height={54} />
                  <YAxis {...axisProps} />
                  <Tooltip cursor={{ fill: 'rgba(21,94,239,.05)' }} content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Reports" radius={[6, 6, 0, 0]} maxBarSize={44}>
                    {catData.map((c) => <Cell key={c.key} fill={c.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <CardHead title="Monthly trend" subtitle="Detected against resolved, last 12 months" />
          <div className="card-body">
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ left: -14, right: 8, top: 8, bottom: 4 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12.5, color: '#475467', paddingTop: 8 }} />
                  <Line type="monotone" dataKey="detected" name="Detected" stroke={CHART.brand} strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="resolved" name="Resolved" stroke={CHART.ai} strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* activity + critical queue */}
      <div className="split-2">
        <Card>
          <CardHead
            title="Recent activity"
            subtitle="Latest events across the platform"
            action={<Link to="/admin/reports" className="btn btn-ghost btn-sm">View all <IconArrowRight size={14} /></Link>}
          />
          <ul>
            {recentActivity.map((a) => <ActivityItem key={a.id} item={a} />)}
          </ul>
        </Card>

        <Card>
          <CardHead title="Critical and unassigned" subtitle="Needs a decision today" />
          <ul className="rank-list">
            {data
              .filter((i) => i.severity === 'critical' && i.status !== 'resolved')
              .slice(0, 6)
              .map((i) => (
                <li key={i.id}>
                  <span className="rank-num" style={{ background: 'var(--critical-soft)', color: 'var(--critical)' }}>!</span>
                  <span className="grow stack" style={{ gap: 2, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i.title}
                    </span>
                    <span className="meta">{i.area} · {formatDate(i.detectedAt)}</span>
                  </span>
                  <Link to="/admin/map" className="btn btn-ghost btn-sm">Open</Link>
                </li>
              ))}
            {data.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length === 0 && (
              <li><span className="meta">No critical items outstanding in this period.</span></li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
