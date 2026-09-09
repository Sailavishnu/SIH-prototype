import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MiniMap } from '../../components/maps';
import {
  AiTag, Badge, Card, CardHead, ConfidenceBar, ErrorState, KeyValue, Photo, Stepper, useToast,
} from '../../components/ui';
import { useOverrides } from '../../data/overrides';
import { INCIDENT_STEPS, getIncident } from '../../data/mock';
import { formatDateTime, formatGps } from '../../lib/format';
import {
  IconArrowLeft, IconCheckCircle, IconUsers, IconAlert, IconX, IconBus, IconGauge, IconTarget,
} from '../../lib/icons';

const STEP_TONE = ['critical', 'info', 'info', 'warning', 'success'];

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { withIncident, setIncidentStep } = useOverrides();

  const raw = getIncident(id);
  if (!raw) {
    return (
      <div className="admin-page">
        <Card className="card-pad">
          <ErrorState title="Incident not found" message={`No case matches the ID “${id}”.`} onRetry={() => navigate('/admin/incidents')} />
        </Card>
      </div>
    );
  }

  const inc = withIncident(raw);
  const step = inc.stepIndex;

  const advance = (to, message) => { setIncidentStep(inc.id, to); toast(message); };

  return (
    <div className="admin-page stack g16">
      <Link to="/admin/incidents" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginLeft: -12 }}>
        <IconArrowLeft size={15} /> Back to incidents
      </Link>

      <div className="between wrap g16">
        <div>
          <div className="row wrap g8" style={{ marginBottom: 8 }}>
            <Badge tone={inc.tone}>{inc.typeLabel}</Badge>
            <Badge tone={STEP_TONE[step]} dot>{INCIDENT_STEPS[step].label}</Badge>
            <Badge tone="neutral">{inc.id}</Badge>
            {inc.fir && <Badge tone="info">{inc.fir}</Badge>}
          </div>
          <h1 className="page-title">{inc.typeLabel} — {inc.area}</h1>
          <p className="body" style={{ marginTop: 4 }}>
            {inc.road}, {inc.area} · {inc.district} · detected {formatDateTime(inc.detectedAt)}
          </p>
        </div>
      </div>

      {/* status stepper */}
      <Card className="card-pad">
        <Stepper steps={INCIDENT_STEPS} activeIndex={step} />
      </Card>

      <div className="split-2">
        <div className="stack g16">
          {/* evidence */}
          <Card style={{ overflow: 'hidden' }}>
            <CardHead title="Vehicle evidence" subtitle="Frame captured by the on-bus camera at the moment of detection" />
            <div style={{ padding: 20 }}>
              <Photo
                height={340}
                label="Vehicle evidence frame"
                caption={`${inc.vehicleColor} ${inc.vehicleType}`}
                tag={<AiTag confidence={inc.detectionConfidence}>{inc.typeLabel.toUpperCase()}</AiTag>}
                tagRight={<Badge tone="neutral" style={{ background: 'rgba(255,255,255,.92)' }}>{formatDateTime(inc.detectedAt)}</Badge>}
                bbox={{ x: '30%', y: '34%', w: '40%', h: '34%', label: `VEHICLE ${inc.detectionConfidence}%` }}
                plate={inc.plate}
              />
              <p className="meta" style={{ marginTop: 10 }}>
                Plate region cropped and passed to the OCR model. Highlighted box shows the detected vehicle.
              </p>
            </div>
          </Card>

          {/* OCR */}
          <Card>
            <CardHead title="Number plate recognition" icon={<IconTarget size={18} />} />
            <div className="card-body stack g16">
              <div className="row g16 wrap" style={{ alignItems: 'center' }}>
                <span className="plate" style={{ fontSize: 20, padding: '8px 18px' }}>{inc.plate}</span>
                <AiTag>OCR RESULT</AiTag>
              </div>
              <ConfidenceBar value={inc.ocrConfidence} label="OCR confidence" />
              <ConfidenceBar value={inc.detectionConfidence} label="Incident detection confidence" />
              {inc.ocrConfidence < 80 && (
                <div className="callout" style={{ background: 'var(--warning-soft)', borderColor: 'rgba(247,144,9,.28)' }}>
                  <span className="callout-icon" style={{ background: 'var(--warning)' }}><IconAlert size={17} /></span>
                  <div>
                    <strong style={{ fontSize: 14 }}>Manual verification required</strong>
                    <p className="body" style={{ marginTop: 4, fontSize: 13.5 }}>
                      OCR confidence is below the 80% enforcement threshold. Confirm the plate against
                      the registry before assigning an investigation.
                    </p>
                  </div>
                </div>
              )}
              <p className="body" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{inc.notes}</p>
            </div>
          </Card>
        </div>

        <div className="stack g16">
          {/* actions */}
          <Card>
            <CardHead title="Case actions" />
            <div className="card-body stack g8">
              <button className="btn btn-secondary btn-block" disabled={step >= 1}
                onClick={() => advance(1, `${inc.id} marked verified`)}>
                <IconCheckCircle size={16} /> Mark Verified
              </button>
              <button className="btn btn-secondary btn-block" disabled={step >= 2}
                onClick={() => advance(2, `Investigation assigned for ${inc.id}`)}>
                <IconUsers size={16} /> Assign Investigation
              </button>
              <button className="btn btn-danger btn-block" disabled={step >= 3}
                onClick={() => advance(3, `${inc.id} escalated to Traffic Police`)}>
                <IconAlert size={16} /> Escalate
              </button>
              <button className="btn btn-primary btn-block" disabled={step >= 4}
                onClick={() => advance(4, `${inc.id} closed`)}>
                <IconX size={16} /> Close Incident
              </button>
              {step === 4 && <p className="meta" style={{ textAlign: 'center', marginTop: 4 }}>This case is closed. No further action available.</p>}
            </div>
          </Card>

          <Card>
            <CardHead title="Location" />
            <MiniMap lat={inc.lat} lng={inc.lng} color="#E31B54" height={180} label={inc.typeLabel} />
            <div className="card-body">
              <KeyValue
                items={[
                  { label: 'Road', value: inc.road },
                  { label: 'Area', value: `${inc.area}, ${inc.zone}` },
                  { label: 'District', value: inc.district },
                  { label: 'GPS', value: <span className="mono">{formatGps(inc.lat, inc.lng)}</span> },
                ]}
              />
            </div>
          </Card>

          <Card>
            <CardHead title="Case details" />
            <div className="card-body">
              <KeyValue
                items={[
                  { label: 'Incident ID', value: <span className="mono">{inc.id}</span> },
                  { label: 'Type', value: inc.typeLabel },
                  { label: 'Vehicle', value: `${inc.vehicleColor} ${inc.vehicleType}` },
                  { label: 'Speed', value: <span className="row g8"><IconGauge size={14} />{inc.speedKmph} km/h</span> },
                  { label: 'Detected by', value: <span className="row g8"><IconBus size={14} />{inc.busId}</span> },
                  { label: 'Route', value: inc.route },
                  { label: 'Detected at', value: formatDateTime(inc.detectedAt) },
                  inc.officer && { label: 'Officer', value: inc.officer },
                  inc.fir && { label: 'FIR number', value: inc.fir },
                ]}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
