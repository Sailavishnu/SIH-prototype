import React from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardHead, KpiCard, SkeletonCard, useMockLoading } from '../../components/ui';
import { ChartTooltip, axisProps, gridProps } from '../../components/charts';
import { byCategory, counts, byZone } from '../../data/mock';
import { IconCheckCircle, IconGauge, IconSparkle } from '../../lib/icons';

export default function CityInsights() {
  const loading = useMockLoading(450);

  return (
    <div className="public-page">
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">City insights</h1>
        <p className="body" style={{ marginTop: 4 }}>
          What the camera fleet found across Chennai over the last 30 days.
        </p>
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        {loading ? (
          <>
            <SkeletonCard lines={1} />
            <SkeletonCard lines={1} />
            <SkeletonCard lines={1} />
          </>
        ) : (
          <>
            <KpiCard label="Detected this month" value={counts.thisMonth} icon={<IconSparkle size={16} />} tone="ai"
              delta={12} sub="vs last month" />
            <KpiCard label="Resolved this month" value={counts.resolvedThisMonth} icon={<IconCheckCircle size={16} />} tone="success"
              delta={8} deltaInvert sub="vs last month" />
            <KpiCard label="Resolution rate" value={`${counts.resolutionRate}%`} icon={<IconGauge size={16} />} tone="brand"
              sub="of all reports closed" />
          </>
        )}
      </div>

      <Card>
        <CardHead title="Issues by category" subtitle="All reports raised across the city" />
        <div className="card-body">
          {loading ? (
            <div className="chart-box skeleton" />
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid {...gridProps} horizontal={false} vertical />
                  <XAxis type="number" {...axisProps} />
                  <YAxis type="category" dataKey="name" width={116} {...axisProps} />
                  <Tooltip cursor={{ fill: 'rgba(21,94,239,.05)' }} content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Reports" radius={[0, 6, 6, 0]} barSize={18}>
                    {byCategory.map((c) => <Cell key={c.key} fill={c.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <Card>
          <CardHead title="Where issues are concentrated" subtitle="Share of all reports by zone" />
          <ul className="rank-list">
            {byZone.map((z, i) => (
              <li key={z.name}>
                <span className="rank-num">{i + 1}</span>
                <span className="grow">{z.name}</span>
                <span style={{ width: 120 }}>
                  <span className="meter">
                    <span style={{ width: `${(z.value / byZone[0].value) * 100}%` }} />
                  </span>
                </span>
                <strong className="mono" style={{ width: 28, textAlign: 'right' }}>{z.value}</strong>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="card-pad">
          <div className="callout" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <span className="callout-icon"><IconSparkle size={17} /></span>
            <div>
              <strong style={{ fontSize: 15 }}>What this means for you</strong>
              <p className="body" style={{ marginTop: 8, lineHeight: 1.65 }}>
                Road-surface defects — potholes and damaged carriageway — make up the largest share
                of everything the buses detect. {byZone[0].name} carries the highest load, and about
                {' '}{counts.resolutionRate}% of all reports have already been closed by the
                responsible department.
              </p>
              <p className="body" style={{ marginTop: 10, lineHeight: 1.65 }}>
                Reporting an issue you see adds a citizen confirmation to the AI detection, which
                moves it up the queue.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
