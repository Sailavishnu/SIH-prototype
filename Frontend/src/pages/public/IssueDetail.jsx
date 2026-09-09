import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MiniMap } from '../../components/maps';
import {
  AiTag, Badge, Card, CardHead, ConfidenceBar, ErrorState, KeyValue,
  Photo, SeverityBadge, StatusBadge, StatusTimeline, useToast,
} from '../../components/ui';
import { CATEGORIES, getIssue } from '../../data/mock';
import { useLocalReports } from '../../data/localReports';
import { formatDateTime, formatGps } from '../../lib/format';
import { IconArrowLeft, IconBell, IconShare, IconCheckCircle, IconBus, IconStar } from '../../lib/icons';

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { reports } = useLocalReports();
  // a report filed in this session resolves before the seeded dataset
  const issue = reports.find((r) => r.id === id) || getIssue(id);
  const [following, setFollowing] = useState(false);

  if (!issue) {
    return (
      <div className="public-page">
        <Card className="card-pad">
          <ErrorState
            title="Report not found"
            message={`No report matches the ID “${id}”. It may have been merged into another report.`}
            onRetry={() => navigate('/app/map')}
          />
        </Card>
      </div>
    );
  }

  const cat = CATEGORIES[issue.category];
  const resolved = issue.status === 'resolved';

  const share = async () => {
    const url = `${window.location.origin}/app/issue/${issue.id}`;
    try {
      if (navigator.share) await navigator.share({ title: issue.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast('Link copied to clipboard');
      }
    } catch {
      toast('Could not share this link', 'error');
    }
  };

  return (
    <div className="public-page">
      <Link to="/app/map" className="btn btn-ghost btn-sm" style={{ marginLeft: -12, marginBottom: 12 }}>
        <IconArrowLeft size={15} /> Back to map
      </Link>

      {/* header */}
      <div className="between wrap g16" style={{ marginBottom: 20 }}>
        <div style={{ minWidth: 0 }}>
          <div className="row wrap g8" style={{ marginBottom: 8 }}>
            {issue.source === 'Citizen'
              ? <Badge tone="info">CITIZEN REPORT</Badge>
              : <AiTag>{cat.label.toUpperCase()} DETECTED</AiTag>}
            <SeverityBadge severity={issue.severity} />
            <StatusBadge status={issue.status} />
            <Badge tone="neutral">{issue.id}</Badge>
          </div>
          <h1 className="page-title">{issue.title}</h1>
          <p className="body" style={{ marginTop: 4 }}>
            {issue.road}, {issue.area} · {issue.district} · detected {formatDateTime(issue.detectedAt)}
          </p>
        </div>

        <div className="row g8">
          <button className={`btn ${following ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => { setFollowing((v) => !v); toast(following ? 'Stopped following this issue' : 'You will be notified on every update'); }}>
            {following ? <><IconCheckCircle size={16} /> Following</> : <><IconBell size={16} /> Follow Updates</>}
          </button>
          <button className="btn btn-secondary" onClick={share}>
            <IconShare size={16} /> Share Issue
          </button>
        </div>
      </div>

      <div className="split-2">
        {/* ---------- left column ---------- */}
        <div className="stack g16">
          <Card style={{ overflow: 'hidden' }}>
            {issue.photo ? (
              <img src={issue.photo} alt={issue.title}
                style={{ width: '100%', height: 320, objectFit: 'cover' }} />
            ) : (
              <Photo
                height={320}
                label="Evidence frame — on-bus camera"
                caption={issue.busId ? `Captured by ${issue.busId}` : 'Citizen-submitted photo'}
                tag={<AiTag confidence={issue.confidence}>{cat.label.toUpperCase()}</AiTag>}
                tagRight={<Badge tone="neutral" style={{ background: 'rgba(255,255,255,.9)' }}>{formatDateTime(issue.detectedAt)}</Badge>}
                bbox={{ x: '22%', y: '44%', w: '36%', h: '30%', label: `${cat.label} ${issue.confidence}%` }}
              />
            )}
          </Card>

          <Card>
            <CardHead title="What the model saw" />
            <div className="card-body stack g16">
              <p className="body" style={{ lineHeight: 1.65 }}>{issue.description}</p>
              <ConfidenceBar value={issue.confidence} />
              {issue.passes > 1 && (
                <p className="meta">
                  Confirmed across {issue.passes} separate bus passes over this location.
                </p>
              )}
            </div>
          </Card>

          {resolved && (
            <Card>
              <CardHead title="Before and after" subtitle="Verified by a follow-up bus pass after the repair" />
              <div className="card-body grid-2">
                <div className="stack g8">
                  <Photo height={170} label="Before repair" tag={<Badge tone="critical">Before</Badge>} />
                  <span className="meta">{formatDateTime(issue.detectedAt)}</span>
                </div>
                <div className="stack g8">
                  <Photo height={170} label="After repair" tag={<Badge tone="success">After</Badge>} />
                  <span className="meta">{formatDateTime(issue.timeline[4].at)}</span>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHead title="Status timeline" subtitle="Every step from detection to closure" />
            <div className="card-body">
              <StatusTimeline steps={issue.timeline} />
            </div>
          </Card>
        </div>

        {/* ---------- right column ---------- */}
        <div className="stack g16">
          <Card>
            <CardHead title="Location" />
            <MiniMap lat={issue.lat} lng={issue.lng} color={cat.color} height={190} label={issue.title} />
            <div className="card-body">
              <KeyValue
                items={[
                  { label: 'Road', value: issue.road },
                  { label: 'Area', value: issue.area },
                  { label: 'Zone', value: issue.zone },
                  { label: 'District', value: `${issue.district}, ${issue.state}` },
                  { label: 'GPS', value: <span className="mono">{formatGps(issue.lat, issue.lng)}</span> },
                ]}
              />
            </div>
          </Card>

          <Card>
            <CardHead title="Report details" />
            <div className="card-body">
              <KeyValue
                items={[
                  { label: 'Report ID', value: <span className="mono">{issue.id}</span> },
                  { label: 'Category', value: issue.categoryLabel },
                  { label: 'Priority', value: issue.priority },
                  { label: 'Source', value: issue.source === 'AI' ? 'AI camera detection' : 'Citizen report' },
                  issue.busId && { label: 'Detected by', value: <span className="row g8"><IconBus size={14} />{issue.busId}</span> },
                  issue.route && { label: 'Route', value: issue.route },
                  { label: 'Department', value: issue.department },
                  { label: 'Last update', value: formatDateTime(issue.updatedAt) },
                ]}
              />
            </div>
          </Card>

          <Card className="card-pad">
            <div className="row g12" style={{ alignItems: 'flex-start' }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--warning-soft)', color: 'var(--warning)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                <IconStar size={16} />
              </span>
              <div>
                <strong style={{ fontSize: 14 }}>Is this still a problem?</strong>
                <p className="meta" style={{ marginTop: 4, lineHeight: 1.5 }}>
                  If the issue has reappeared after being closed, report it again and it will be
                  linked to this record as a repeat detection.
                </p>
                <Link to="/app/report" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
                  Report again
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
