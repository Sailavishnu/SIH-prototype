/* ============================================================
   UrbanSight AI — mock dataset
   Everything the UI renders comes from this file. No backend.
   Data is generated from a fixed seed, so it is identical on
   every reload (stable IDs, stable charts, stable demo).
   Context: Chennai / Tamil Nadu.
   ============================================================ */

/* ---------- deterministic PRNG (mulberry32) ---------- */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20240915);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + rand() * (max - min);
const intBetween = (min, max) => Math.floor(between(min, max + 1));

const NOW = Date.now();
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

export const CITY = { name: 'Chennai', state: 'Tamil Nadu', center: [13.0827, 80.2707], zoom: 12 };

/* ============================================================
   Taxonomy
   ============================================================ */
export const CATEGORIES = {
  pothole:         { key: 'pothole',         label: 'Pothole',            short: 'Pothole',      group: 'road',           color: '#F04438', dept: 'Road Maintenance' },
  damaged_road:    { key: 'damaged_road',    label: 'Damaged Road',       short: 'Road Damage',  group: 'road',           color: '#F79009', dept: 'Road Maintenance' },
  waterlogging:    { key: 'waterlogging',    label: 'Waterlogging',       short: 'Waterlogging', group: 'infrastructure', color: '#0BA5EC', dept: 'Water Management' },
  signboard:       { key: 'signboard',       label: 'Damaged Signboard',  short: 'Signboard',    group: 'infrastructure', color: '#7A5AF8', dept: 'Municipal Corporation' },
  zebra_crossing:  { key: 'zebra_crossing',  label: 'Missing Zebra Crossing', short: 'Zebra Crossing', group: 'infrastructure', color: '#EE46BC', dept: 'Road Maintenance' },
  divider:         { key: 'divider',         label: 'Missing Divider',    short: 'Divider',      group: 'infrastructure', color: '#6172F3', dept: 'Municipal Corporation' },
  congestion:      { key: 'congestion',      label: 'Traffic Congestion', short: 'Congestion',   group: 'traffic',        color: '#EAAA08', dept: 'Traffic Police' },
  safety_incident: { key: 'safety_incident', label: 'Safety Incident',    short: 'Safety',       group: 'safety',         color: '#E31B54', dept: 'Safety Department' },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const GROUPS = [
  { key: 'all',            label: 'All' },
  { key: 'road',           label: 'Road' },
  { key: 'infrastructure', label: 'Infrastructure' },
  { key: 'traffic',        label: 'Traffic' },
  { key: 'safety',         label: 'Safety' },
];

export const STATUSES = {
  open:        { key: 'open',        label: 'Open',        tone: 'critical' },
  verified:    { key: 'verified',    label: 'Verified',    tone: 'info' },
  assigned:    { key: 'assigned',    label: 'Assigned',    tone: 'info' },
  in_progress: { key: 'in_progress', label: 'In Progress', tone: 'warning' },
  resolved:    { key: 'resolved',    label: 'Resolved',    tone: 'success' },
};
export const STATUS_LIST = Object.values(STATUSES);

export const SEVERITIES = {
  critical: { key: 'critical', label: 'Critical', tone: 'critical', color: '#F04438', rank: 4 },
  high:     { key: 'high',     label: 'High',     tone: 'warning',  color: '#F79009', rank: 3 },
  medium:   { key: 'medium',   label: 'Medium',   tone: 'info',     color: '#155EEF', rank: 2 },
  low:      { key: 'low',      label: 'Low',      tone: 'neutral',  color: '#98A2B3', rank: 1 },
};
export const SEVERITY_LIST = Object.values(SEVERITIES);

export const PRIORITIES = {
  P1: { key: 'P1', label: 'P1', tone: 'critical', rank: 3 },
  P2: { key: 'P2', label: 'P2', tone: 'warning', rank: 2 },
  P3: { key: 'P3', label: 'P3', tone: 'neutral', rank: 1 },
};

/* ============================================================
   Geography — real Chennai localities
   ============================================================ */
export const LOCATIONS = [
  // --- Chennai & Metro Region ---
  { area: 'T. Nagar',        zone: 'Central Zone', district: 'Chennai',       lat: 13.0418, lng: 80.2341, road: 'Usman Road' },
  { area: 'Adyar',           zone: 'South Zone',   district: 'Chennai',       lat: 13.0067, lng: 80.2570, road: 'Lattice Bridge Road' },
  { area: 'Velachery',       zone: 'South Zone',   district: 'Chennai',       lat: 12.9791, lng: 80.2210, road: 'Velachery Main Road' },
  { area: 'Anna Nagar',      zone: 'North Zone',   district: 'Chennai',       lat: 13.0850, lng: 80.2101, road: '2nd Avenue' },
  { area: 'Guindy',          zone: 'South Zone',   district: 'Chennai',       lat: 13.0067, lng: 80.2206, road: 'Race Course Road' },
  { area: 'Mylapore',        zone: 'East Zone'   , district: 'Chennai',       lat: 13.0339, lng: 80.2698, road: 'Kutchery Road' },
  { area: 'Perungudi',       zone: 'South Zone',   district: 'Chennai',       lat: 12.9698, lng: 80.2455, road: 'OMR Service Road' },
  { area: 'Egmore',          zone: 'Central Zone', district: 'Chennai',       lat: 13.0732, lng: 80.2609, road: 'Pantheon Road' },
  { area: 'Nungambakkam',    zone: 'Central Zone', district: 'Chennai',       lat: 13.0569, lng: 80.2425, road: 'Sterling Road' },
  { area: 'Thoraipakkam',    zone: 'South Zone',   district: 'Chennai',       lat: 12.9401, lng: 80.2350, road: 'Rajiv Gandhi Salai' },
  { area: 'Porur',           zone: 'West Zone',    district: 'Chennai',       lat: 13.0374, lng: 80.1575, road: 'Mount Poonamallee Road' },
  { area: 'Ambattur',        zone: 'West Zone',    district: 'Tiruvallur',    lat: 13.1143, lng: 80.1548, road: 'MTH Road' },
  { area: 'Tambaram',        zone: 'South Zone',   district: 'Chengalpattu',  lat: 12.9229, lng: 80.1275, road: 'GST Road' },
  { area: 'Kodambakkam',     zone: 'Central Zone', district: 'Chennai',       lat: 13.0500, lng: 80.2260, road: 'Arcot Road' },
  { area: 'Besant Nagar',    zone: 'East Zone' ,   district: 'Chennai',       lat: 12.9987, lng: 80.2669, road: '2nd Avenue' },
  { area: 'Avadi',           zone: 'West Zone',    district: 'Tiruvallur',    lat: 13.1147, lng: 80.1098, road: 'CTH Road' },
  { area: 'Chromepet',       zone: 'South Zone',   district: 'Chengalpattu',  lat: 12.9516, lng: 80.1462, road: 'GST Road' },
  { area: 'Perambur',        zone: 'North Zone',   district: 'Chennai',       lat: 13.1067, lng: 80.2333, road: 'Paper Mills Road' },

  // --- North Tamil Nadu ---
  { area: 'Katpadi',         zone: 'North Zone',   district: 'Vellore',       lat: 12.9698, lng: 79.1384, road: 'Chittoor Main Road' },
  { area: 'Bagayam',         zone: 'North Zone',   district: 'Vellore',       lat: 12.8712, lng: 79.1332, road: 'Bagayam High Road' },
  { area: 'Kanchipuram Town', zone: 'North Zone',  district: 'Kancheepuram',  lat: 12.8342, lng: 79.7036, road: 'Gandhi Road' },
  { area: 'Tiruvannamalai',  zone: 'North Zone',   district: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, road: 'Girivalam Chengam Road' },
  { area: 'Hosur SIPCOT',    zone: 'North Zone',   district: 'Krishnagiri',   lat: 12.7409, lng: 77.8253, road: 'Bagalur Road' },

  // --- South Tamil Nadu ---
  { area: 'Mattuthavani',    zone: 'South Zone',   district: 'Madurai',       lat: 9.9392,  lng: 78.1567, road: 'Melur Main Road' },
  { area: 'Simmakkal',       zone: 'South Zone',   district: 'Madurai',       lat: 9.9252,  lng: 78.1198, road: 'North Veli Street' },
  { area: 'Palayamkottai',   zone: 'South Zone',   district: 'Tirunelveli',   lat: 8.7139,  lng: 77.7567, road: 'Tirunelveli High Road' },
  { area: 'Vannarpettai',    zone: 'South Zone',   district: 'Tirunelveli',   lat: 8.7302,  lng: 77.7314, road: 'South Bypass Road' },
  { area: 'Nagercoil',       zone: 'South Zone',   district: 'Kanyakumari',   lat: 8.1833,  lng: 77.4119, road: 'Cape Road' },
  { area: 'Thoothukudi Port', zone: 'South Zone',  district: 'Thoothukudi',   lat: 8.7642,  lng: 78.1348, road: 'Harbour Express Highway' },
  { area: 'Dindigul Town',   zone: 'South Zone',   district: 'Dindigul',      lat: 10.3673, lng: 77.9803, road: 'Palani Main Road' },

  // --- West Tamil Nadu ---
  { area: 'Gandhipuram',     zone: 'West Zone',    district: 'Coimbatore',    lat: 11.0168, lng: 76.9558, road: 'Cross Cut Road' },
  { area: 'RS Puram',        zone: 'West Zone',    district: 'Coimbatore',    lat: 11.0086, lng: 76.9482, road: 'DB Road' },
  { area: 'Peelamedu',       zone: 'West Zone',    district: 'Coimbatore',    lat: 11.0267, lng: 77.0125, road: 'Avinashi Road' },
  { area: 'Salem Five Roads', zone: 'West Zone',   district: 'Salem',         lat: 11.6643, lng: 78.1460, road: 'Omalur Main Road' },
  { area: 'Brough Road',     zone: 'West Zone',    district: 'Erode',         lat: 11.3410, lng: 77.7172, road: 'Perundurai Road' },
  { area: 'Kumaran Nagar',   zone: 'West Zone',    district: 'Tiruppur',      lat: 11.1085, lng: 77.3411, road: 'Avinashi Bypass' },

  // --- East & Central Coastal Tamil Nadu ---
  { area: 'Thillai Nagar',   zone: 'East Zone',    district: 'Tiruchirappalli', lat: 10.8271, lng: 78.6890, road: 'Salai Road' },
  { area: 'Trichy Cantonment', zone: 'East Zone',  district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, road: 'Bharathidasan Salai' },
  { area: 'Thanjavur Palace', zone: 'East Zone',   district: 'Thanjavur',     lat: 10.7870, lng: 79.1378, road: 'Medical College Road' },
  { area: 'Cuddalore Port',  zone: 'East Zone',    district: 'Cuddalore',     lat: 11.7480, lng: 79.7714, road: 'Imperial Road' },
  { area: 'Nagapattinam Town', zone: 'East Zone',  district: 'Nagapattinam',  lat: 10.7672, lng: 79.8449, road: 'Beach Road' },
  { area: 'Kumbakonam',      zone: 'East Zone',    district: 'Thanjavur',     lat: 10.9602, lng: 79.3845, road: 'TSR Big Street' },
];

export const ZONES = ['North Zone', 'South Zone', 'Central Zone', 'East Zone', 'West Zone'];
export const DISTRICTS = [
  'Chennai', 'Chengalpattu', 'Tiruvallur', 'Kancheepuram', 'Vellore', 'Tiruvannamalai', 'Krishnagiri',
  'Coimbatore', 'Salem', 'Erode', 'Tiruppur', 'Tiruchirappalli', 'Thanjavur', 'Cuddalore', 'Nagapattinam',
  'Madurai', 'Tirunelveli', 'Kanyakumari', 'Thoothukudi', 'Dindigul',
];
export const STATES = ['Tamil Nadu'];

/* ============================================================
   Fleet — MTC buses carrying the AI cameras
   ============================================================ */
const ROUTES = [
  { no: '21G',  name: 'Broadway – Tambaram' },
  { no: '5C',   name: 'Perambur – Adyar Depot' },
  { no: '27B',  name: 'Anna Nagar – Parrys' },
  { no: '570',  name: 'Kelambakkam – CMBT' },
  { no: '51M',  name: 'Thiruvanmiyur – Poonamallee' },
  { no: '102',  name: 'Broadway – Kandigai' },
  { no: '12B',  name: 'Saidapet – Ayanavaram' },
  { no: '47D',  name: 'T. Nagar – Kelambakkam' },
  { no: '29C',  name: 'Perambur – Besant Nagar' },
  { no: '18',   name: 'Saidapet – Central' },
  { no: '23C',  name: 'Ayanavaram – Thiruvanmiyur' },
  { no: 'M1',   name: 'CMBT – Velachery' },
];

const CAMERA_STATES = ['online', 'online', 'online', 'online', 'degraded', 'offline'];

export const buses = ROUTES.map((r, i) => {
  const loc = LOCATIONS[(i * 3 + 2) % LOCATIONS.length];
  const camera = i === 4 ? 'degraded' : i === 9 ? 'offline' : pick(CAMERA_STATES);
  const active = camera !== 'offline';
  return {
    id: `TN-BUS-${String(1041 + i * 7)}`,
    plate: `TN 01 N ${String(intBetween(1000, 9999))}`,
    route: `${r.no} — ${r.name}`,
    routeNo: r.no,
    depot: pick(['Adyar Depot', 'Perambur Depot', 'Vadapalani Depot', 'Tambaram Depot', 'Anna Nagar Depot']),
    status: camera === 'offline' ? 'In Depot' : active ? 'On Route' : 'Idle',
    lastArea: loc.area,
    lat: loc.lat + between(-0.006, 0.006),
    lng: loc.lng + between(-0.006, 0.006),
    eventsToday: camera === 'offline' ? 0 : intBetween(4, 38),
    camera,
    cameraHealth: {
      lens: camera === 'online' ? 98 : camera === 'degraded' ? 62 : 0,
      storage: intBetween(38, 92),
      uplink: camera === 'online' ? intBetween(88, 99) : camera === 'degraded' ? intBetween(40, 65) : 0,
    },
    lastSync: NOW - (camera === 'offline' ? intBetween(6, 30) * HOUR : intBetween(1, 46) * 60 * 1000),
    kmToday: Number(between(38, 184).toFixed(1)),
  };
});

/* ============================================================
   Issues / detections — the core dataset
   ============================================================ */
const TITLE_BY_CATEGORY = {
  pothole: ['Deep pothole on carriageway', 'Cluster of potholes near junction', 'Pothole beside bus stop', 'Pothole on service lane'],
  damaged_road: ['Road surface cracking', 'Edge break on main road', 'Sunken road patch', 'Damaged road after utility work'],
  waterlogging: ['Waterlogging on main road', 'Stagnant water near subway', 'Drain overflow on street', 'Waterlogging at bus terminus'],
  signboard: ['Signboard bent out of position', 'Faded direction signboard', 'Broken speed limit board', 'Signboard obstructed by growth'],
  zebra_crossing: ['Zebra crossing markings faded', 'Missing crossing at school zone', 'Worn pedestrian crossing', 'Crossing paint erased'],
  divider: ['Median divider missing', 'Broken road divider section', 'Divider damaged after collision', 'Gap in central median'],
  congestion: ['Sustained congestion at junction', 'Slow-moving traffic corridor', 'Queue build-up at signal', 'Peak-hour congestion'],
  safety_incident: ['Unsafe overtaking detected', 'Pedestrian on carriageway', 'Vehicle on wrong side', 'Near-miss at junction'],
};

const DESCRIPTIONS = {
  pothole: 'On-bus camera captured a road surface depression across the left lane. Depth estimated above the 75 mm action threshold. Repeated detections from multiple bus passes confirm the defect.',
  damaged_road: 'Continuous surface distress detected over a stretch of the carriageway. Model classified the pattern as bituminous layer failure requiring resurfacing rather than patchwork.',
  waterlogging: 'Standing water detected covering a significant portion of the carriageway width. Detection recurred across consecutive passes, indicating blocked drainage rather than transient rainfall.',
  signboard: 'Traffic signboard detected in a displaced orientation, reducing legibility for approaching vehicles. Flagged for municipal maintenance.',
  zebra_crossing: 'Pedestrian crossing markings detected below the visibility threshold. Model compared against expected marking template for this junction class.',
  divider: 'A discontinuity in the central median was detected across multiple passes. Missing divider segments raise head-on collision risk on this corridor.',
  congestion: 'Vehicle density and average speed on this stretch stayed outside normal bounds for the time of day across a sustained window.',
  safety_incident: 'Camera flagged a road-safety event involving unsafe vehicle or pedestrian behaviour. Clip retained for review by the Safety Department.',
};

const SEVERITY_WEIGHTS = {
  pothole: ['critical', 'high', 'high', 'medium'],
  damaged_road: ['high', 'medium', 'medium', 'high'],
  waterlogging: ['critical', 'high', 'medium', 'high'],
  signboard: ['medium', 'low', 'low', 'medium'],
  zebra_crossing: ['medium', 'medium', 'low', 'high'],
  divider: ['high', 'critical', 'medium', 'high'],
  congestion: ['medium', 'high', 'medium', 'low'],
  safety_incident: ['critical', 'critical', 'high', 'high'],
};

const CATEGORY_POOL = [
  'pothole', 'pothole', 'pothole', 'pothole', 'pothole',
  'damaged_road', 'damaged_road', 'damaged_road',
  'waterlogging', 'waterlogging', 'waterlogging',
  'signboard', 'signboard',
  'zebra_crossing', 'zebra_crossing',
  'divider',
  'congestion', 'congestion',
  'safety_incident',
];

const STATUS_FLOW = ['open', 'verified', 'assigned', 'in_progress', 'resolved'];
const STATUS_LABELS = {
  open: 'Detected',
  verified: 'Verified',
  assigned: 'Assigned',
  in_progress: 'Work Started',
  resolved: 'Resolved',
};
const STATUS_NOTES = {
  open: 'AI detection logged from on-bus camera feed and geotagged.',
  verified: 'Detection reviewed and confirmed by the city control room.',
  assigned: 'Work order raised and routed to the responsible department.',
  in_progress: 'Field crew mobilised, repair work underway at site.',
  resolved: 'Repair completed and verified by a follow-up bus pass.',
};

function buildTimeline(status, detectedAt) {
  const idx = STATUS_FLOW.indexOf(status);
  let t = detectedAt;
  return STATUS_FLOW.map((s, i) => {
    if (i > 0) t += intBetween(4, 40) * HOUR;
    return {
      key: s,
      label: STATUS_LABELS[s],
      note: STATUS_NOTES[s],
      at: i <= idx ? t : null,
      done: i < idx,
      current: i === idx,
    };
  });
}

const OFFICERS = ['R. Karthikeyan', 'S. Meenakshi', 'A. Dhanasekaran', 'P. Lakshmi Priya', 'M. Vigneshwaran', 'K. Anitha'];

function makeIssue(i) {
  const loc = LOCATIONS[Math.floor(rand() * LOCATIONS.length)];
  const category = pick(CATEGORY_POOL);
  const cat = CATEGORIES[category];
  const severity = pick(SEVERITY_WEIGHTS[category]);
  const ageDays = between(0, 44);
  const detectedAt = Math.round(NOW - ageDays * DAY);
  // older detections are far more likely to be closed out
  const r = rand();
  let status;
  if (ageDays > 26) status = r < 0.78 ? 'resolved' : r < 0.9 ? 'in_progress' : 'assigned';
  else if (ageDays > 12) status = r < 0.38 ? 'resolved' : r < 0.6 ? 'in_progress' : r < 0.8 ? 'assigned' : r < 0.92 ? 'verified' : 'open';
  else if (ageDays > 4) status = r < 0.12 ? 'resolved' : r < 0.36 ? 'in_progress' : r < 0.6 ? 'assigned' : r < 0.82 ? 'verified' : 'open';
  else status = r < 0.6 ? 'open' : r < 0.85 ? 'verified' : 'assigned';

  const priority = severity === 'critical' ? 'P1' : severity === 'high' ? (rand() < 0.6 ? 'P1' : 'P2') : severity === 'medium' ? 'P2' : 'P3';
  const bus = buses[Math.floor(rand() * buses.length)];
  const source = rand() < 0.14 ? 'Citizen' : 'AI';

  return {
    id: `URB-${10240 + i * 3}`,
    title: pick(TITLE_BY_CATEGORY[category]),
    category,
    categoryLabel: cat.label,
    group: cat.group,
    color: cat.color,
    description: DESCRIPTIONS[category],
    area: loc.area,
    road: loc.road,
    zone: loc.zone,
    district: loc.district,
    state: 'Tamil Nadu',
    lat: Number((loc.lat + between(-0.008, 0.008)).toFixed(5)),
    lng: Number((loc.lng + between(-0.008, 0.008)).toFixed(5)),
    severity,
    priority,
    status,
    confidence: Number(between(71, 98.6).toFixed(1)),
    detectedAt,
    updatedAt: detectedAt + intBetween(2, 60) * HOUR,
    source,
    busId: source === 'AI' ? bus.id : null,
    route: source === 'AI' ? bus.route : null,
    department: cat.dept,
    assignedTo: ['assigned', 'in_progress', 'resolved'].includes(status) ? pick(OFFICERS) : null,
    passes: intBetween(1, 9),
    distanceKm: Number(between(0.3, 7.8).toFixed(1)),
    timeline: buildTimeline(status, detectedAt),
  };
}

export const issues = Array.from({ length: 148 }, (_, i) => makeIssue(i)).sort((a, b) => b.detectedAt - a.detectedAt);

/* Reports filed by the signed-in citizen — shown in "My Reports" */
export const myReportIds = issues.filter((it) => it.source === 'Citizen').slice(0, 8).map((it) => it.id);
issues.forEach((it) => { it.mine = myReportIds.includes(it.id); });

export const getIssue = (id) => issues.find((it) => it.id === id);

/* ============================================================
   Incidents — hit-and-run / rash driving with plate OCR
   ============================================================ */
const INCIDENT_TYPES = [
  { key: 'hit_and_run', label: 'Hit and Run', tone: 'critical' },
  { key: 'rash_driving', label: 'Rash Driving', tone: 'warning' },
  { key: 'wrong_side', label: 'Wrong Side Driving', tone: 'warning' },
  { key: 'signal_jump', label: 'Signal Jump', tone: 'warning' },
  { key: 'overspeeding', label: 'Overspeeding', tone: 'critical' },
];
export const INCIDENT_TYPE_LIST = INCIDENT_TYPES;

export const INCIDENT_STEPS = [
  { key: 'detected', label: 'Detected' },
  { key: 'verified', label: 'Verified' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'closed', label: 'Closed' },
];

const PLATE_SERIES = ['TN 07', 'TN 09', 'TN 10', 'TN 11', 'TN 01', 'TN 22', 'TN 12', 'TN 05', 'KA 03', 'AP 39'];
const PLATE_LETTERS = ['AB', 'BC', 'CG', 'DK', 'AL', 'BM', 'CH', 'AZ', 'EF', 'BQ'];
const VEHICLE_TYPES = ['Hatchback', 'Sedan', 'SUV', 'Two-wheeler', 'Auto-rickshaw', 'Light truck', 'Tempo'];

export const incidents = Array.from({ length: 34 }, (_, i) => {
  const type = INCIDENT_TYPES[Math.floor(rand() * INCIDENT_TYPES.length)];
  const loc = LOCATIONS[Math.floor(rand() * LOCATIONS.length)];
  const ageDays = between(0, 21);
  const detectedAt = Math.round(NOW - ageDays * DAY);
  const r = rand();
  const step = ageDays > 14 ? (r < 0.7 ? 4 : 3) : ageDays > 7 ? (r < 0.4 ? 3 : 2) : ageDays > 2 ? (r < 0.5 ? 2 : 1) : 0;
  const bus = buses[Math.floor(rand() * buses.length)];
  return {
    id: `INC-${2210 + i * 4}`,
    type: type.key,
    typeLabel: type.label,
    tone: type.tone,
    plate: `${pick(PLATE_SERIES)} ${pick(PLATE_LETTERS)} ${intBetween(1000, 9999)}`,
    vehicleType: pick(VEHICLE_TYPES),
    vehicleColor: pick(['White', 'Silver', 'Black', 'Red', 'Blue', 'Grey']),
    ocrConfidence: Number(between(68, 97.8).toFixed(1)),
    detectionConfidence: Number(between(79, 99).toFixed(1)),
    area: loc.area,
    road: loc.road,
    zone: loc.zone,
    district: loc.district,
    lat: Number((loc.lat + between(-0.006, 0.006)).toFixed(5)),
    lng: Number((loc.lng + between(-0.006, 0.006)).toFixed(5)),
    detectedAt,
    speedKmph: intBetween(48, 112),
    busId: bus.id,
    route: bus.route,
    stepIndex: step,
    status: INCIDENT_STEPS[step].label,
    officer: step >= 2 ? pick(OFFICERS) : null,
    fir: step >= 3 ? `FIR/${intBetween(200, 899)}/${new Date(detectedAt).getFullYear()}` : null,
    notes: 'Evidence clip and plate crop retained. Cross-checked against the state vehicle registry for owner details.',
  };
}).sort((a, b) => b.detectedAt - a.detectedAt);

export const getIncident = (id) => incidents.find((i) => i.id === id);

/* ============================================================
   Departments
   ============================================================ */
export const departments = [
  { key: 'road', name: 'Road Maintenance', head: 'Er. S. Ramanathan', color: '#F04438', crews: 14, categories: ['pothole', 'damaged_road', 'zebra_crossing'] },
  { key: 'traffic', name: 'Traffic Police', head: 'DCP T. Selvakumar', color: '#EAAA08', crews: 9, categories: ['congestion'] },
  { key: 'municipal', name: 'Municipal Corporation', head: 'Er. P. Radhakrishnan', color: '#7A5AF8', crews: 21, categories: ['signboard', 'divider'] },
  { key: 'water', name: 'Water Management', head: 'Er. M. Arulmozhi', color: '#0BA5EC', crews: 11, categories: ['waterlogging'] },
  { key: 'safety', name: 'Safety Department', head: 'ADCP R. Jeyanthi', color: '#E31B54', crews: 7, categories: ['safety_incident'] },
];

const DEPT_BY_NAME = {
  'Road Maintenance': 'road',
  'Traffic Police': 'traffic',
  'Municipal Corporation': 'municipal',
  'Water Management': 'water',
  'Safety Department': 'safety',
};

departments.forEach((d) => {
  const mine = issues.filter((it) => DEPT_BY_NAME[it.department] === d.key);
  d.total = mine.length;
  d.active = mine.filter((it) => it.status !== 'resolved').length;
  d.resolved = mine.filter((it) => it.status === 'resolved').length;
  d.slaPct = Math.round(60 + (d.resolved / Math.max(1, d.total)) * 38);
});

/* ============================================================
   Derived aggregates
   ============================================================ */
export const counts = {
  total: issues.length,
  open: issues.filter((i) => i.status === 'open').length,
  verified: issues.filter((i) => i.status === 'verified').length,
  assigned: issues.filter((i) => i.status === 'assigned').length,
  inProgress: issues.filter((i) => i.status === 'in_progress').length,
  resolved: issues.filter((i) => i.status === 'resolved').length,
  critical: issues.filter((i) => i.severity === 'critical').length,
  thisMonth: issues.filter((i) => i.detectedAt > NOW - 30 * DAY).length,
  resolvedThisMonth: issues.filter((i) => i.status === 'resolved' && i.detectedAt > NOW - 30 * DAY).length,
  activeIncidents: incidents.filter((i) => i.stepIndex < 4).length,
};
counts.unresolved = counts.total - counts.resolved;
counts.resolutionRate = Math.round((counts.resolved / counts.total) * 100);

export const byCategory = CATEGORY_LIST.map((c) => ({
  key: c.key,
  name: c.short,
  label: c.label,
  color: c.color,
  value: issues.filter((i) => i.category === c.key).length,
  resolved: issues.filter((i) => i.category === c.key && i.status === 'resolved').length,
})).sort((a, b) => b.value - a.value);

export const byZone = ZONES.map((z) => ({
  name: z,
  value: issues.filter((i) => i.zone === z).length,
  critical: issues.filter((i) => i.zone === z && i.severity === 'critical').length,
})).sort((a, b) => b.value - a.value);

export const byDistrict = DISTRICTS.map((d) => ({
  name: d,
  value: issues.filter((i) => i.district === d).length,
  resolved: issues.filter((i) => i.district === d && i.status === 'resolved').length,
})).filter((d) => d.value > 0).sort((a, b) => b.value - a.value);

export const byStatus = STATUS_LIST.map((s) => ({
  key: s.key,
  name: s.label,
  value: issues.filter((i) => i.status === s.key).length,
}));

export const bySeverity = SEVERITY_LIST.map((s) => ({
  key: s.key,
  name: s.label,
  color: s.color,
  value: issues.filter((i) => i.severity === s.key).length,
}));

/* Monthly trend — 12 months ending this month */
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(NOW);
  d.setMonth(d.getMonth() - (11 - i));
  const detected = Math.round(180 + i * 14 + between(-38, 46));
  const resolved = Math.round(detected * between(0.62, 0.88));
  return { month: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), detected, resolved };
});

/* Detections over the last 30 days */
export const detectionsOverTime = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(NOW - (29 - i) * DAY);
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  const detections = Math.round((weekend ? 22 : 41) + between(-9, 15) + i * 0.35);
  return {
    date: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
    fullDate: d.toISOString().slice(0, 10),
    detections,
    resolved: Math.round(detections * between(0.5, 0.82)),
  };
});

/* AI confidence distribution */
const CONF_BUCKETS = ['70–75%', '75–80%', '80–85%', '85–90%', '90–95%', '95–100%'];
export const confidenceDistribution = CONF_BUCKETS.map((name, i) => {
  const lo = 70 + i * 5;
  return { name, value: issues.filter((x) => x.confidence >= lo && x.confidence < lo + 5).length };
});

/* Resolution time by category (days) */
export const resolutionTime = byCategory.slice(0, 6).map((c) => ({
  name: c.name,
  days: Number(between(1.6, 9.4).toFixed(1)),
  color: c.color,
}));

/* ============================================================
   Traffic intelligence
   ============================================================ */
export const trafficKpis = {
  avgDensity: 268,
  avgDensityDelta: 6.4,
  peakZones: 7,
  peakZonesDelta: 2,
  mostCongested: 'Anna Salai — Saidapet to Guindy',
  mostCongestedDelay: '14 min',
  avgSpeed: 21.4,
  avgSpeedDelta: -3.1,
};

export const vehiclesByHour = Array.from({ length: 24 }, (_, h) => {
  const morningPeak = Math.exp(-Math.pow(h - 9, 2) / 5) * 720;
  const eveningPeak = Math.exp(-Math.pow(h - 18.5, 2) / 6) * 810;
  const base = h >= 6 && h <= 22 ? 240 : 60;
  return {
    hour: `${String(h).padStart(2, '0')}:00`,
    vehicles: Math.round(base + morningPeak + eveningPeak + between(-40, 40)),
    speed: Number(Math.max(9, 46 - (morningPeak + eveningPeak) / 34 + between(-3, 3)).toFixed(1)),
  };
});

export const vehicleSplit = [
  { name: 'Two-wheeler', value: 41, color: '#155EEF' },
  { name: 'Car', value: 26, color: '#14B8A6' },
  { name: 'Auto-rickshaw', value: 14, color: '#F79009' },
  { name: 'Bus', value: 11, color: '#7A5AF8' },
  { name: 'Truck', value: 8, color: '#98A2B3' },
];

export const zoneDensity = [
  { name: 'Central Zone', density: 412, speed: 16.2 },
  { name: 'South Zone', density: 338, speed: 22.8 },
  { name: 'North Zone', density: 296, speed: 19.4 },
  { name: 'West Zone', density: 244, speed: 26.1 },
  { name: 'East Zone', density: 187, speed: 29.6 },
];

/* Congestion points for the heat overlay: [lat, lng, intensity 0..1] */
export const congestionPoints = (() => {
  const hot = [
    // Chennai & Metro
    [13.0418, 80.2341, 1.0], [13.0213, 80.2231, 0.95], [13.0067, 80.2206, 0.9],
    [13.0569, 80.2425, 0.85], [12.9229, 80.1275, 0.75],
    // North TN
    [12.9698, 79.1384, 0.85], [12.7409, 77.8253, 0.8], [12.8342, 79.7036, 0.7],
    // West TN
    [11.0168, 76.9558, 0.95], [11.0267, 77.0125, 0.85], [11.6643, 78.1460, 0.88], [11.3410, 77.7172, 0.75],
    // South TN
    [9.9392, 78.1567, 0.92], [9.9252, 78.1198, 0.85], [8.7139, 77.7567, 0.8], [8.7642, 78.1348, 0.72], [8.1833, 77.4119, 0.7],
    // East TN
    [10.8271, 78.6890, 0.9], [10.7905, 78.7047, 0.82], [10.7870, 79.1378, 0.78], [11.7480, 79.7714, 0.68],
  ];
  const out = [];
  hot.forEach(([lat, lng, w]) => {
    out.push([lat, lng, w]);
    for (let i = 0; i < 14; i++) {
      out.push([lat + between(-0.02, 0.02), lng + between(-0.02, 0.02), Math.max(0.15, w * between(0.3, 0.9))]);
    }
  });
  return out;
})();

/* Heat points derived from the issue set — used by the GIS heatmap toggle */
export const issueHeatPoints = issues.map((i) => [
  i.lat,
  i.lng,
  i.severity === 'critical' ? 1 : i.severity === 'high' ? 0.75 : i.severity === 'medium' ? 0.5 : 0.3,
]);

/* ============================================================
   Infrastructure intelligence
   ============================================================ */
export const infraCards = [
  { key: 'pothole', label: 'Potholes' },
  { key: 'damaged_road', label: 'Damaged Roads' },
  { key: 'divider', label: 'Missing Dividers' },
  { key: 'zebra_crossing', label: 'Missing Zebra Crossings' },
  { key: 'signboard', label: 'Damaged Signboards' },
  { key: 'waterlogging', label: 'Waterlogging' },
].map((c, i) => {
  const value = issues.filter((x) => x.category === c.key).length;
  const deltas = [23, -8, 11, -4, 6, 18];
  return { ...c, value, color: CATEGORIES[c.key].color, delta: deltas[i], open: issues.filter((x) => x.category === c.key && x.status !== 'resolved').length };
});

export const affectedZones = byZone.map((z) => ({
  ...z,
  share: Math.round((z.value / issues.length) * 100),
}));

export const repeatedLocations = [
  { area: 'T. Nagar', road: 'Usman Road', count: 9, category: 'pothole', lastSeen: NOW - 8 * HOUR },
  { area: 'Velachery', road: 'Velachery Main Road', count: 7, category: 'waterlogging', lastSeen: NOW - 22 * HOUR },
  { area: 'Saidapet', road: 'Anna Salai', count: 6, category: 'damaged_road', lastSeen: NOW - 31 * HOUR },
  { area: 'Ambattur', road: 'MTH Road', count: 5, category: 'pothole', lastSeen: NOW - 2 * DAY },
  { area: 'Perungudi', road: 'OMR Service Road', count: 5, category: 'divider', lastSeen: NOW - 3 * DAY },
  { area: 'Kodambakkam', road: 'Arcot Road', count: 4, category: 'zebra_crossing', lastSeen: NOW - 4 * DAY },
];

export const aiInsights = [
  'North Zone has shown a 23% increase in road surface defects in the last 30 days, concentrated along Poonamallee High Road and Paper Mills Road.',
  'Waterlogging detections cluster within 400 m of four storm-water outfalls in Velachery — a drainage cause rather than a road-surface one.',
  'Repeat potholes on Usman Road reappear a median of 19 days after each patch repair, indicating the base layer needs rework.',
];

/* ============================================================
   Activity feed
   ============================================================ */
export const recentActivity = [
  { id: 1, type: 'detection', text: 'Pothole detected on Usman Road, T. Nagar', meta: 'Bus TN-BUS-1041 • 97.2% confidence', at: NOW - 12 * 60 * 1000, tone: 'critical' },
  { id: 2, type: 'resolved', text: 'Waterlogging at Velachery Main Road marked resolved', meta: 'Water Management • Er. M. Arulmozhi', at: NOW - 48 * 60 * 1000, tone: 'success' },
  { id: 3, type: 'incident', text: 'Hit-and-run flagged — plate TN 07 AB 4821', meta: 'Safety Department • escalated', at: NOW - 2.4 * HOUR, tone: 'critical' },
  { id: 4, type: 'assigned', text: '6 road defects assigned to Road Maintenance', meta: 'Auto-routed by category rules', at: NOW - 4.1 * HOUR, tone: 'info' },
  { id: 5, type: 'fleet', text: 'Camera on TN-BUS-1104 reported degraded lens', meta: 'Fleet monitoring • Vadapalani Depot', at: NOW - 6.8 * HOUR, tone: 'warning' },
  { id: 6, type: 'report', text: 'Weekly Infrastructure Report generated', meta: 'Municipal Corporation • PDF', at: NOW - 9.2 * HOUR, tone: 'info' },
];

/* ============================================================
   Reports & export
   ============================================================ */
export const reportTemplates = [
  {
    key: 'daily_city',
    name: 'Daily City Intelligence Report',
    description: 'Everything the control room logged in a single day — detections, resolutions and open critical items across all zones.',
    sections: ['Summary stats', 'Detections by category', 'Critical open items'],
    defaultRange: 1,
  },
  {
    key: 'weekly_infra',
    name: 'Weekly Infrastructure Report',
    description: 'Road and infrastructure defects raised over the week, grouped by zone with repeat-location analysis.',
    sections: ['Zone breakdown', 'Repeat locations', 'Department load'],
    defaultRange: 7,
  },
  {
    key: 'traffic',
    name: 'Traffic Congestion Report',
    description: 'Congestion corridors, hourly vehicle counts and average speeds captured by the bus-mounted camera fleet.',
    sections: ['Congestion KPIs', 'Hourly density', 'Zone comparison'],
    defaultRange: 7,
  },
  {
    key: 'incident',
    name: 'Incident Report',
    description: 'Hit-and-run, rash driving and safety incidents with plate OCR results and case status.',
    sections: ['Incident log', 'OCR confidence', 'Case status'],
    defaultRange: 30,
  },
  {
    key: 'monthly_perf',
    name: 'Monthly Performance Report',
    description: 'Department-wise resolution performance, response times and month-on-month comparison.',
    sections: ['Resolution rate', 'Department SLA', 'Monthly comparison'],
    defaultRange: 30,
  },
];

/* Ranges are derived from "now" so the history never contradicts the
   rest of the dataset, which is also generated relative to today. */
const shortDate = (ts) => {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};
const span = (fromDaysAgo, toDaysAgo) => `${shortDate(NOW - fromDaysAgo * DAY)} – ${shortDate(NOW - toDaysAgo * DAY)}`;
const lastMonthLabel = (() => {
  const d = new Date(NOW);
  d.setMonth(d.getMonth() - 1);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
})();

export const reportHistory = [
  { id: 'RPT-4821', name: 'Daily City Intelligence Report', range: shortDate(NOW - DAY), region: 'All Zones', format: 'PDF', size: '284 KB', by: 'S. Meenakshi', at: NOW - 20 * HOUR },
  { id: 'RPT-4818', name: 'Weekly Infrastructure Report', range: span(9, 3), region: 'North Zone', format: 'PDF', size: '612 KB', by: 'Er. S. Ramanathan', at: NOW - 2 * DAY },
  { id: 'RPT-4809', name: 'Traffic Congestion Report', range: span(10, 4), region: 'Central Zone', format: 'CSV', size: '96 KB', by: 'DCP T. Selvakumar', at: NOW - 3 * DAY },
  { id: 'RPT-4794', name: 'Incident Report', range: span(38, 8), region: 'All Zones', format: 'PDF', size: '1.1 MB', by: 'ADCP R. Jeyanthi', at: NOW - 6 * DAY },
  { id: 'RPT-4788', name: 'Monthly Performance Report', range: lastMonthLabel, region: 'All Zones', format: 'PDF', size: '742 KB', by: 'City Administrator', at: NOW - 8 * DAY },
];

/* ============================================================
   Demo accounts — the two logins
   ============================================================ */
export const DEMO_ACCOUNTS = {
  citizen: {
    email: 'citizen@chennai.gov.in',
    password: 'demo1234',
    name: 'Arjun Ramesh',
    role: 'citizen',
    initials: 'AR',
    ward: 'Ward 129, T. Nagar',
  },
  admin: {
    email: 'admin@chennai.gov.in',
    password: 'admin1234',
    name: 'City Administrator',
    role: 'admin',
    initials: 'AD',
    title: 'Deputy Commissioner — Works',
    org: 'Greater Chennai Corporation',
  },
};
