import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IssueMarkers, MapCanvas } from '../../components/maps';
import IssueCard from '../../components/IssueCard';
import { AiTag, Card, CardHead, EmptyState, KpiCard, useMockLoading, SkeletonCard } from '../../components/ui';
import { useAuth } from '../../auth/AuthContext';
import { useLocalReports } from '../../data/localReports';
import { CITY, counts, issues } from '../../data/mock';
import {
  IconPen, IconMap, IconArrowRight, IconInbox, IconCheckCircle, IconSparkle, IconChart,
} from '../../lib/icons';

export default function CitizenHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const loading = useMockLoading(400);
  const { reports: local } = useLocalReports();

  const mine = useMemo(
    () => [...local, ...issues.filter((i) => i.mine)].sort((a, b) => b.detectedAt - a.detectedAt),
    [local],
  );
  const active = mine.filter((i) => i.status !== 'resolved');
  const nearby = useMemo(() => [...issues].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4), []);
  const preview = useMemo(() => issues.slice(0, 40), []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="public-page stack g16">
      {/* greeting */}
      <div className="between wrap g16">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0] || 'there'}</h1>
          <p className="body" style={{ marginTop: 4 }}>
            Here is what the city has picked up around {user?.ward || 'your area'}.
          </p>
        </div>
        <div className="row g8">
          <Link to="/app/map" className="btn btn-secondary"><IconMap size={16} /> Explore City Map</Link>
          <Link to="/app/report" className="btn btn-primary"><IconPen size={16} /> Report an Issue</Link>
        </div>
      </div>

      {/* stats */}
      <div className="grid-4">
        {loading ? (
          <><SkeletonCard lines={1} /><SkeletonCard lines={1} /><SkeletonCard lines={1} /><SkeletonCard lines={1} /></>
        ) : (
          <>
            <KpiCard label="Your active reports" value={active.length} icon={<IconInbox size={16} />} tone="brand"
              sub="being worked on" onClick={() => navigate('/app/my-reports')} />
            <KpiCard label="Your resolved reports" value={mine.length - active.length} icon={<IconCheckCircle size={16} />} tone="success"
              sub="closed by the city" onClick={() => navigate('/app/my-reports')} />
            <KpiCard label="Detected citywide" value={counts.thisMonth} icon={<IconSparkle size={16} />} tone="ai"
              sub="in the last 30 days" />
            <KpiCard label="City resolution rate" value={`${counts.resolutionRate}%`} icon={<IconChart size={16} />} tone="warning"
              sub="of all reports closed" onClick={() => navigate('/app/insights')} />
          </>
        )}
      </div>

      <div className="split-2">
        {/* map preview */}
        <Card style={{ overflow: 'hidden' }}>
          <CardHead
            title="Issues near you"
            subtitle="Live detections from buses on your routes"
            action={<Link to="/app/map" className="btn btn-ghost btn-sm">Open full map <IconArrowRight size={14} /></Link>}
          />
          <MapCanvas height={360} flush center={CITY.center} zoom={12} scrollWheelZoom={false}>
            <IssueMarkers issues={preview} onSelect={(i) => navigate(`/app/issue/${i.id}`)} />
          </MapCanvas>
        </Card>

        {/* lists */}
        <div className="stack g16">
          <Card>
            <CardHead
              title="Your reports"
              action={<Link to="/app/my-reports" className="btn btn-ghost btn-sm">All <IconArrowRight size={14} /></Link>}
            />
            <div className="card-body stack g12">
              {mine.length === 0 ? (
                <EmptyState
                  title="You have not reported anything yet"
                  message="Spotted a pothole or waterlogging? It takes under a minute."
                  action={<Link to="/app/report" className="btn btn-primary btn-sm" style={{ marginTop: 6 }}>Report an issue</Link>}
                />
              ) : (
                mine.slice(0, 3).map((i) => (
                  <IssueCard key={i.id} issue={i} showDistance={false} onClick={() => navigate(`/app/issue/${i.id}`)} />
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHead title="Closest to you" subtitle="Sorted by distance" />
            <div className="card-body stack g12">
              {nearby.map((i) => (
                <IssueCard key={i.id} issue={i} onClick={() => navigate(`/app/issue/${i.id}`)} />
              ))}
            </div>
          </Card>

          <Card className="card-pad">
            <div className="row g12" style={{ alignItems: 'flex-start' }}>
              <AiTag>HOW IT WORKS</AiTag>
            </div>
            <p className="body" style={{ marginTop: 10, lineHeight: 1.65 }}>
              Cameras mounted on {'12'} public buses scan the road as they run their routes. When the
              model spots a defect it geotags it, scores its confidence, and routes it to the
              department responsible. Your reports are matched against the same feed.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
