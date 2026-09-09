import React from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { HeatLayer, MapCanvas } from '../../components/maps';
import { Card, CardHead, KpiCard, useMockLoading } from '../../components/ui';
import { ChartLegend, ChartTooltip, CHART, axisProps, gridProps } from '../../components/charts';
import { congestionPoints, trafficKpis, vehicleSplit, vehiclesByHour, zoneDensity } from '../../data/mock';
import { IconGauge, IconFlame, IconRoad, IconTraffic } from '../../lib/icons';

export default function Traffic() {
  const loading = useMockLoading(420);

  return (
    <div className="admin-page stack g16">
      {/* KPIs */}
      <div className="grid-4">
        <KpiCard label="Avg vehicle density" value={`${trafficKpis.avgDensity}/km`} icon={<IconTraffic size={16} />}
          tone="brand" delta={trafficKpis.avgDensityDelta} sub="vs last week" />
        <KpiCard label="Peak congestion zones" value={trafficKpis.peakZones} icon={<IconFlame size={16} />}
          tone="critical" delta={trafficKpis.peakZonesDelta} deltaSuffix="" sub="above threshold" />
        <KpiCard label="Most congested route" value={trafficKpis.mostCongestedDelay} icon={<IconRoad size={16} />}
          tone="warning" sub={trafficKpis.mostCongested} />
        <KpiCard label="Avg traffic speed" value={`${trafficKpis.avgSpeed} km/h`} icon={<IconGauge size={16} />}
          tone="ai" delta={trafficKpis.avgSpeedDelta} deltaInvert sub="citywide, all hours" />
      </div>

      {/* congestion heatmap */}
      <Card>
        <CardHead
          title="Congestion heatmap"
          subtitle="Density derived from vehicle counts along bus routes over the last 24 hours"
        />
        <div style={{ padding: 20 }}>
          <MapCanvas
            height={440}
            center={[10.9, 78.5]}
            zoom={7}
            legend={[
              { label: 'Free flowing', color: '#155EEF' },
              { label: 'Moderate', color: '#14B8A6' },
              { label: 'Heavy', color: '#F79009' },
              { label: 'Severe', color: '#F04438' },
            ]}
          >
            <HeatLayer points={congestionPoints} radius={34} blur={24} />
          </MapCanvas>
        </div>
      </Card>

      {/* hourly counts */}
      <Card>
        <CardHead title="Vehicle count by hour" subtitle="Citywide average across all monitored corridors" />
        <div className="card-body">
          {loading ? <div className="chart-box tall skeleton" /> : (
            <div className="chart-box tall">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vehiclesByHour} margin={{ left: -14, right: 8, top: 8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="vehFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={CHART.brand} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="hour" {...axisProps} interval={2} />
                  <YAxis {...axisProps} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="vehicles" name="Vehicles/hour" stroke={CHART.brand}
                    strokeWidth={2.4} fill="url(#vehFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="meta" style={{ marginTop: 8 }}>
            Two clear peaks: the 08:00–10:00 commute and a heavier 17:30–19:30 evening return.
          </p>
        </div>
      </Card>

      <div className="grid-2">
        {/* vehicle mix */}
        <Card>
          <CardHead title="Vehicle classification" subtitle="Share of all classified vehicles" />
          <div className="card-body">
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vehicleSplit} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={62} outerRadius={94} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                    {vehicleSplit.map((v) => <Cell key={v.name} fill={v.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit="%" />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ChartLegend items={vehicleSplit.map((v) => ({ label: v.name, color: v.color, value: `${v.value}%` }))} />
          </div>
        </Card>

        {/* zone density */}
        <Card>
          <CardHead title="Density by zone" subtitle="Vehicles per km against average speed" />
          <div className="card-body">
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneDensity} layout="vertical" margin={{ left: 12, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid {...gridProps} horizontal={false} vertical />
                  <XAxis type="number" {...axisProps} />
                  <YAxis type="category" dataKey="name" width={98} {...axisProps} />
                  <Tooltip cursor={{ fill: 'rgba(21,94,239,.05)' }} content={<ChartTooltip />} />
                  <Bar dataKey="density" name="Vehicles/km" radius={[0, 6, 6, 0]} barSize={20}>
                    {zoneDensity.map((z) => (
                      <Cell key={z.name} fill={z.density > 350 ? CHART.critical : z.density > 280 ? CHART.warning : CHART.brand} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="rank-list" style={{ marginTop: 8 }}>
              {zoneDensity.slice(0, 3).map((z, i) => (
                <li key={z.name} style={{ padding: '8px 0' }}>
                  <span className="rank-num">{i + 1}</span>
                  <span className="grow">{z.name}</span>
                  <span className="meta">{z.speed} km/h avg</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
