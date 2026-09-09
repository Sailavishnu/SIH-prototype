import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LocationPicker } from '../../components/maps';
import {
  AiTag, Badge, Card, CardHead, Field, KeyValue, Photo, Stepper, useToast,
} from '../../components/ui';
import { useLocalReports } from '../../data/localReports';
import { CATEGORIES, CITY } from '../../data/mock';
import { cx, formatGps } from '../../lib/format';
import {
  IconArrowLeft, IconArrowRight, IconCamera, IconUpload, IconLocate, IconCheckCircle,
  IconRoad, IconWater, IconSignal, IconPin, IconAlert, IconX, IconPen,
} from '../../lib/icons';

const STEPS = [
  { key: 'photo', label: 'Photo' },
  { key: 'category', label: 'Category' },
  { key: 'location', label: 'Location' },
  { key: 'details', label: 'Details' },
  { key: 'review', label: 'Review' },
];

const CHOICES = [
  { key: 'pothole', label: 'Pothole', icon: IconRoad },
  { key: 'damaged_road', label: 'Damaged Road', icon: IconRoad },
  { key: 'waterlogging', label: 'Waterlogging', icon: IconWater },
  { key: 'signboard', label: 'Broken Signboard', icon: IconSignal },
  { key: 'zebra_crossing', label: 'Missing Zebra Crossing', icon: IconPin },
  { key: 'divider', label: 'Other', icon: IconAlert },
];

export default function ReportIssue() {
  const navigate = useNavigate();
  const toast = useToast();
  const { addReport } = useLocalReports();
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [category, setCategory] = useState(null);
  const [position, setPosition] = useState(CITY.center);
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [locating, setLocating] = useState(false);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto({ name: file.name, url: URL.createObjectURL(file), size: (file.size / 1024).toFixed(0) });
  };

  const useMyLocation = () => {
    setLocating(true);
    const fallback = () => {
      setPosition([13.0418, 80.2341]);
      setAddress('Usman Road, T. Nagar, Chennai 600017');
      setArea('T. Nagar');
      setLocating(false);
      toast('Using your approximate area');
    };
    if (!navigator.geolocation) return fallback();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAddress('Detected from your device location');
        setLocating(false);
        toast('Location pinned from your device');
      },
      fallback,
      { timeout: 6000 },
    );
  };

  const canAdvance = () => {
    if (step === 1) return !!category;
    if (step === 2) return address.trim().length > 3;
    return true;
  };

  const submit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const report = addReport({
        category,
        title: CATEGORIES[category].label,
        description,
        address,
        area: area || address.split(',')[1]?.trim() || 'Chennai',
        lat: position[0],
        lng: position[1],
        photo: photo?.url || null,
      });
      setSubmitting(false);
      setSubmitted(report);
    }, 900);
  };

  /* ---------- success screen ---------- */
  if (submitted) {
    return (
      <div className="public-page">
        <div className="wizard" style={{ paddingTop: 24 }}>
          <Card className="card-pad stack g16" style={{ textAlign: 'center', alignItems: 'center' }}>
            <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-soft)', color: 'var(--success)', display: 'grid', placeItems: 'center' }}>
              <IconCheckCircle size={32} />
            </span>
            <h1 className="page-title">Report submitted successfully</h1>
            <p className="body" style={{ maxWidth: '44ch' }}>
              Thank you. Your report has been added to the city queue and will be checked against
              camera footage from buses passing this location.
            </p>

            <div style={{ padding: '14px 20px', borderRadius: 'var(--r-lg)', background: 'var(--surface-sunken)', minWidth: 260 }}>
              <div className="eyebrow">Your report ID</div>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.02em', marginTop: 2 }}>
                {submitted.id}
              </div>
            </div>

            <div className="row g8 wrap" style={{ justifyContent: 'center' }}>
              <Link to={`/app/issue/${submitted.id}`} className="btn btn-primary">
                Track Report <IconArrowRight size={16} />
              </Link>
              <Link to="/app/my-reports" className="btn btn-secondary">View my reports</Link>
            </div>

            <p className="meta" style={{ marginTop: 4 }}>
              You will be notified when the status changes. Typical first response: under 24 hours.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------- wizard ---------- */
  return (
    <div className="public-page">
      <div className="wizard">
        <div style={{ marginBottom: 20 }}>
          <h1 className="page-title">Report an issue</h1>
          <p className="body" style={{ marginTop: 4 }}>
            Five quick steps. Everything except the photo is optional detail that helps crews find it faster.
          </p>
        </div>

        <div className="wizard-steps">
          <Stepper steps={STEPS} activeIndex={step} />
        </div>

        <Card>
          <CardHead
            title={`Step ${step + 1} of 5 — ${['Add a photo', 'Choose a category', 'Pin the location', 'Add details', 'Review and submit'][step]}`}
            action={<Badge tone="neutral">{STEPS[step].label}</Badge>}
          />

          <div className="card-body">
            {/* ---- step 1: photo ---- */}
            {step === 0 && (
              <div className="stack g16">
                {photo ? (
                  <div className="stack g12">
                    <div style={{ position: 'relative' }}>
                      <img src={photo.url} alt="Selected evidence"
                        style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }} />
                      <button className="icon-btn" onClick={() => setPhoto(null)} aria-label="Remove photo"
                        style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,.94)' }}>
                        <IconX size={16} />
                      </button>
                    </div>
                    <span className="meta">{photo.name} · {photo.size} KB</span>
                  </div>
                ) : (
                  <div className="upload-drop">
                    <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand)', display: 'grid', placeItems: 'center' }}>
                      <IconCamera size={22} />
                    </span>
                    <strong style={{ fontSize: 15 }}>Add a photo of the issue</strong>
                    <p className="meta" style={{ maxWidth: '40ch' }}>
                      A clear photo taken from the roadside helps the AI match your report with camera detections.
                    </p>
                    <div className="row g8 wrap" style={{ justifyContent: 'center', marginTop: 6 }}>
                      <button className="btn btn-primary" onClick={() => cameraRef.current?.click()}>
                        <IconCamera size={16} /> Take Photo
                      </button>
                      <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
                        <IconUpload size={16} /> Upload from Gallery
                      </button>
                    </div>
                    <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
                  </div>
                )}
                <p className="meta">You can skip this step, but reports with a photo are verified roughly twice as fast.</p>
              </div>
            )}

            {/* ---- step 2: category ---- */}
            {step === 1 && (
              <div className="cat-grid">
                {CHOICES.map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button"
                    className={cx('cat-tile', category === key && 'active')}
                    onClick={() => setCategory(key)}>
                    <span className="cat-ic" style={{ background: CATEGORIES[key].color }}><Icon size={20} /></span>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* ---- step 3: location ---- */}
            {step === 2 && (
              <div className="stack g16">
                <div className="between wrap g12">
                  <p className="meta">Tap the map or drag the pin to the exact spot.</p>
                  <button className="btn btn-secondary btn-sm" onClick={useMyLocation} disabled={locating}>
                    <IconLocate size={15} /> {locating ? 'Locating…' : 'Use My Location'}
                  </button>
                </div>
                <LocationPicker value={position} onChange={setPosition} height={280} />
                <Field label="Address or landmark" required>
                  <input className="input" placeholder="e.g. Near Panagal Park, Usman Road, T. Nagar"
                    value={address} onChange={(e) => setAddress(e.target.value)} />
                </Field>
                <Field label="Area / locality">
                  <input className="input" placeholder="e.g. T. Nagar" value={area} onChange={(e) => setArea(e.target.value)} />
                </Field>
                <span className="meta mono">Pinned at {formatGps(position[0], position[1])}</span>
              </div>
            )}

            {/* ---- step 4: description ---- */}
            {step === 3 && (
              <Field label="Description" hint="Optional — 500 characters max.">
                <textarea className="textarea" maxLength={500} value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you saw — how large the problem is, whether it blocks traffic, how long it has been there…" />
                <span className="meta" style={{ alignSelf: 'flex-end' }}>{description.length}/500</span>
              </Field>
            )}

            {/* ---- step 5: review ---- */}
            {step === 4 && (
              <div className="stack g16">
                {photo ? (
                  <img src={photo.url} alt="Evidence"
                    style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }} />
                ) : (
                  <Photo height={180} label="No photo attached" />
                )}

                <KeyValue
                  items={[
                    { label: 'Category', value: category ? CATEGORIES[category].label : 'Not selected' },
                    { label: 'Address', value: address || '—' },
                    { label: 'Area', value: area || '—' },
                    { label: 'GPS', value: <span className="mono">{formatGps(position[0], position[1])}</span> },
                    { label: 'Description', value: description || 'None added' },
                  ]}
                />

                <div className="callout">
                  <span className="callout-icon"><IconCheckCircle size={17} /></span>
                  <div>
                    <strong style={{ fontSize: 14 }}>What happens next</strong>
                    <p className="body" style={{ marginTop: 4, fontSize: 13.5 }}>
                      Your report is matched against detections from buses that passed this location,
                      then routed to {category ? CATEGORIES[category].dept : 'the right department'}.
                      You will get a report ID to track it.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="drawer-foot between">
            <button className="btn btn-ghost" onClick={() => (step === 0 ? navigate('/app') : setStep(step - 1))}>
              <IconArrowLeft size={15} /> {step === 0 ? 'Cancel' : 'Back'}
            </button>

            {step < 4 ? (
              <button className="btn btn-primary" disabled={!canAdvance()} onClick={() => setStep(step + 1)}>
                Continue <IconArrowRight size={15} />
              </button>
            ) : (
              <button className="btn btn-primary" disabled={submitting || !category} onClick={submit}>
                {submitting ? 'Submitting…' : <><IconPen size={15} /> Submit report</>}
              </button>
            )}
          </div>
        </Card>

        {step === 1 && !category && (
          <p className="meta" style={{ textAlign: 'center', marginTop: 12 }}>Pick a category to continue.</p>
        )}
        {step === 2 && address.trim().length <= 3 && (
          <p className="meta" style={{ textAlign: 'center', marginTop: 12 }}>Add an address or landmark to continue.</p>
        )}
      </div>
    </div>
  );
}
