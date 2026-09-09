Build a complete, production-quality React web application UI for "UrbanSight AI" — a smart-city platform where AI cameras on public buses detect road defects, traffic conditions, and safety incidents, aggregated on GIS dashboards for both citizens and city authorities. UI ONLY — no real backend, use realistic hardcoded mock data throughout (Indian city context: Chennai/Tamil Nadu locations, Indian number plates, realistic timestamps).

======================================================
TECH STACK
======================================================
- React (functional components + hooks), React Router for navigation between pages
- react-leaflet + leaflet for ALL maps (OpenStreetMap tile layer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"). No Mapbox, no Google Maps.
- Recharts (or Chart.js) for all charts
- Plain CSS / CSS modules — no heavy UI kit, hand-built clean components
- jsPDF or similar for the report download/export feature (generate a downloadable PDF/CSV from the mock data on the client side)

======================================================
GLOBAL NAVIGATION
======================================================
- Two experiences sharing one brand system: PUBLIC (citizen) and ADMIN (authority). Add a simple toggle/switch at the top (e.g. "Citizen View" / "Admin View") to preview both from one running app.
- Admin side nav: a slim icon-only rail (56px) fixed left, always visible. On hover it expands (~220px) overlaying content (not pushing it) to reveal text labels. Collapses on mouse leave. Highlight the active page's icon even when collapsed.
- Public side: top navbar on desktop; bottom tab bar on mobile widths (Home, Map, Report, My Reports).
- Top bar (admin): page title, compact single-row filter (Date range, State, District, Category), search box.
- Keep every page visually clean — necessary components only, no filler widgets, no empty decorative cards.

======================================================
PART A — PUBLIC / CITIZEN EXPERIENCE
======================================================

1. LANDING
 - Hero: "Your city, seen smarter." + subtext + two CTAs: "Explore City Map", "Report an Issue"
 - Trust strip: "AI-powered monitoring", "Real-time city insights", "Location-based tracking"

2. CITY MAP (public)
 - Full-width Leaflet/OSM map, centered on Chennai (13.0827, 80.2707)
 - Markers by category (pothole, waterlogging, missing infrastructure, congestion, safety) with distinct colors/icons
 - Filter chips: All, Road, Infrastructure, Traffic, Safety
 - Side panel / bottom sheet: "Nearby issues" list — mock cards (title, area, distance, time detected, priority)
 - Clicking a marker or card opens Issue Detail

3. ISSUE DETAIL (public)
 - Evidence photo (placeholder), AI detection label (e.g. "POTHOLE DETECTED"), severity badge, AI confidence %, location, timestamp, status (Open/Assigned/In Progress/Resolved)
 - Short description, small map preview
 - Status timeline: Detected → Verified → Assigned → Work Started → Resolved
 - If resolved: before/after image placeholders
 - Actions: "Follow Updates", "Share Issue"

4. REPORT AN ISSUE (citizen submission flow)
 - Step 1: Upload photo (Take Photo / Upload from Gallery — non-functional UI)
 - Step 2: Category grid (Pothole, Damaged Road, Waterlogging, Broken Signboard, Missing Zebra Crossing, Other)
 - Step 3: Location — mini Leaflet map + "Use My Location" button + address field
 - Step 4: Optional description text area
 - Step 5: Review & submit
 - Success screen: "Report submitted successfully", mock report ID, "Track Report" button

5. MY REPORTS
 - Tabs: Active / Resolved
 - Cards: thumbnail, title, location, status badge, date, priority
 - Click → Issue Detail

6. CITY INSIGHTS (citizen-friendly analytics)
 - Simple cards: issues detected this month, issues resolved, resolution rate
 - One clean chart: issues by category

======================================================
PART B — ADMIN / AUTHORITY EXPERIENCE
======================================================

1. ADMIN DASHBOARD (overview/landing)
 - KPI row: Total reports, Open, Resolved, Avg response time, Active incidents
 - Two charts: reports by category (bar), monthly trend (line)
 - Recent activity feed (last 5-6 events, compact list)
 - Quick "Download Report" button in the top-right (see Reports & Export below)

2. GIS INTELLIGENCE MAP (admin)
 - Large Leaflet/OSM map with all event markers (color-coded by category/severity)
 - Toggle: Markers view / Heatmap view (density overlay using leaflet.heat or similar, purely visual/mock)
 - Filter chips + dropdown filters (category, severity, status, date range)
 - Click marker → side drawer with full report detail (photo, confidence, GPS, timestamp, description, status, assign/resolve actions)

3. REPORTS TABLE
 - Full data table: ID, Category, District, Date, Status (badge), AI Confidence, Priority
 - Sortable columns, basic pagination
 - Row click → detail drawer (photo, description, GPS, confidence, status update controls)
 - "Export" button on this page: download the currently filtered table as CSV and as PDF (client-side generation)

4. INCIDENT MANAGEMENT (hit-and-run / rash driving)
 - Table: incident type, vehicle image placeholder, detected number plate (mock Indian plates, e.g. "TN 07 AB 4821"), OCR confidence %, location, time, status
 - Detail view: large vehicle evidence image, plate highlighted, OCR confidence, horizontal status stepper (Detected → Verified → Assigned → Escalated → Closed)
 - Action buttons (UI-only, visual state change on click): Assign Investigation, Mark Verified, Escalate, Close Incident

5. TRAFFIC INTELLIGENCE
 - KPI cards: Avg vehicle density, Peak congestion zones, Most congested route, Avg traffic speed
 - Congestion heatmap on a Leaflet map
 - Charts: vehicle count by hour, vehicle classification split (car/bus/two-wheeler/truck/auto-rickshaw), density by zone

6. INFRASTRUCTURE INTELLIGENCE
 - Category cards: potholes, damaged roads, missing dividers, missing zebra crossings, damaged signboards, waterlogging — each with a count and small trend arrow
 - Map + "most affected zones" list, "repeated issue locations" list
 - One AI-insight callout card, e.g. "North Zone has shown a 23% increase in road surface defects in the last 30 days."

7. FLEET MONITORING
 - Table of buses: Bus ID, Route, Status, Last Location, Events Detected Today, Camera Status, Last Sync
 - Click a bus → profile with route map, recent detections list, camera health indicators

8. ANALYTICS
 - Date range selector
 - Charts/cards: detections over time, issues by category, issues by district, resolution time, AI confidence distribution, monthly comparison
 - Table/chart/map view toggle for the main dataset

9. REPORTS & EXPORT (this is the "report download" feature — make it real and central)
 - Report template list: Daily City Intelligence Report, Weekly Infrastructure Report, Traffic Congestion Report, Incident Report, Monthly Performance Report
 - User picks: date range, region, categories, format (PDF / CSV)
 - "Generate Report" button → produces and downloads an actual client-side generated PDF (via jsPDF) or CSV populated from the mock dataset, formatted cleanly with a header, summary stats, and a data table
 - Below: a history list of "previously generated" reports (mock entries) each with a re-download button

10. TEAM & DEPARTMENT ASSIGNMENT
 - Department cards: Road Maintenance, Traffic Police, Municipal Corporation, Water Management, Safety Department — each showing active task count
 - Simple assign-issue-to-department interaction (dropdown + confirm)

======================================================
VISUAL STYLE
======================================================
- Light theme. Background #F6F8FA, surface/cards #FFFFFF
- Primary brand blue #155EEF, secondary dark blue #0B3B8C, AI accent teal #14B8A6
- Status/severity colors: success #12B76A, warning #F79009, critical #F04438
- Text: primary #101828, secondary #475467, muted #98A2B3, borders #EAECF0
- Font: Inter (system sans fallback), clear hierarchy (hero 40px, page title 28px, section heading 20px, card metric 28-32px, body 14-16px, metadata 12px)
- 8px spacing system, 12px card radius, subtle shadows only, thin neutral borders
- Rounded pill badges for status/severity/priority
- Small "AI DETECTED" / "AI VERIFIED" / confidence % tags with subtle teal accent — used consistently wherever AI output is shown
- Clean hover, active, selected, loading (skeleton), empty, and error states throughout

======================================================
WHAT TO AVOID
======================================================
- No neon/cyberpunk styling, no heavy gradients or glassmorphism
- No excessive floating cards or visual clutter
- Sidebar rail must overlay on hover, never push/resize main content
- No real backend calls — all data from static mock JS files, but the PDF/CSV export must genuinely generate a downloadable file client-side from that mock data

======================================================
DELIVERABLE
======================================================
A complete, runnable React app (npm install && npm start) with React Router-based navigation across all Part A (citizen) and Part B (admin) screens listed above, a working Citizen/Admin view switch, real react-leaflet/OpenStreetMap maps throughout (including one heatmap view), and a genuinely functional report download feature (PDF and CSV export) driven by mock data — fully styled per the visual system above, consistent components and spacing across every screen.
