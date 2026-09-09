# UrbanSight AI — Frontend

Smart-city road intelligence platform. AI cameras mounted on public buses detect road
defects, traffic conditions and safety incidents; everything is aggregated onto GIS
dashboards for two audiences — **citizens** and **city authorities**.

UI only. No backend. All data comes from a seeded mock dataset in
[src/data/mock.js](src/data/mock.js), but the report export genuinely generates and
downloads PDF and CSV files in the browser.

## Run it

```bash
npm install
npm start          # http://localhost:3000
```

`npm run dev`, `npm run build` and `npm run preview` also work (Vite 5, React 18).

## The two logins

The app has two separate sign-in routes, each guarding its own half of the product.

| Route          | Who        | Email                     | Password    |
| -------------- | ---------- | ------------------------- | ----------- |
| `/login`       | Citizen    | `citizen@chennai.gov.in`  | `demo1234`  |
| `/admin/login` | Authority  | `admin@chennai.gov.in`    | `admin1234` |

Both login cards show these credentials with a **Fill** button, so no typing is needed
during a demo.

- `/app/*` requires a citizen session, `/admin/*` requires an admin session.
- A signed-out visitor is sent to the login belonging to the area they tried to reach,
  and is returned to that page after signing in.
- A signed-in user hitting the *other* side's routes is redirected to their own home
  rather than to a dead end.
- The session lives in `localStorage` (`urbansight.session`).

There is also a **Citizen / Admin switch** in both headers. It is a demo convenience: it
signs you into the matching demo account and jumps across, so you can show both
experiences without signing out. The real login routes are unaffected.

## Screens

**Citizen** — Landing (`/`) · Home · City Map · Issue Detail · Report an Issue (5-step
wizard) · My Reports · City Insights

**Authority** — Dashboard · GIS Intelligence Map (markers ⇄ heatmap) · Reports table ·
Incident Management + case detail · Traffic Intelligence · Infrastructure Intelligence ·
Fleet Monitoring + bus profile · Analytics · Reports & Export · Team & Departments

## Report export

The headline feature is real. [src/lib/export.js](src/lib/export.js) builds files
client-side from the mock dataset:

- **PDF** via jsPDF + jspdf-autotable — branded header band, meta line, summary stat
  tiles, an optional breakdown table, the full data table, and page numbers on every
  page. Switches to landscape automatically for wide column sets.
- **CSV** — RFC-4180 escaping (quoted fields, doubled inner quotes), CRLF line endings
  and a UTF-8 BOM so Excel opens it correctly.

Export buttons appear on the Dashboard, the Reports table, Incidents, and the dedicated
**Reports & Export** page, which lets you pick a template, date range, region, categories
and format, previews the summary before generating, and keeps a re-downloadable history.

> Note: `jspdf-autotable`'s default export does not survive CJS/ESM interop reliably, so
> the plugin is bound explicitly with `applyPlugin(jsPDF)` and called as `doc.autoTable(…)`.

## Maps

react-leaflet with OpenStreetMap tiles throughout — no Mapbox, no Google Maps. Markers
are `divIcon` pins coloured per category, which avoids the usual bundler breakage with
Leaflet's default marker images.

The heatmap uses `leaflet.heat`, a global-`L` plugin, so it is loaded lazily after `L` is
exposed on `window`. If that ever fails, `HeatLayer` falls back to a stacked-circle
density overlay rather than rendering nothing.

## Structure

```
src/
  auth/         AuthContext (mock sign-in) + RequireAuth route guard
  components/
    layout/     PublicLayout, AdminLayout (56px hover-expand rail), ViewSwitch
    ui.jsx      the whole component kit — badges, KPI cards, drawer, table, toast…
    maps.jsx    Leaflet building blocks: MapCanvas, IssueMarkers, HeatLayer, pickers
    charts.jsx  shared Recharts styling so every chart matches
  data/
    mock.js         seeded dataset — issues, incidents, buses, departments, analytics
    localReports.jsx reports filed during the session (so a new report really appears)
    overrides.jsx    session-level status/assignment changes from admin actions
  lib/          export.js (PDF/CSV), format.js, icons.jsx
  pages/        auth/, public/, admin/
  styles/       tokens.css, global.css, layout.css
```

### A note on the mock data

`mock.js` generates its 86 reports, 22 incidents and 12 buses from a fixed PRNG seed, so
the dataset — IDs, charts, map pins — is **identical on every reload**, while timestamps
stay relative to today. Admin actions (assign, verify, resolve) are UI-only but are held
in `overrides.jsx` for the session, so a change made on the map is still visible in the
table, the department workloads and the exported report.

## Design system

Light theme only. Tokens in [src/styles/tokens.css](src/styles/tokens.css): background
`#F6F8FA`, surfaces `#FFFFFF`, brand `#155EEF`, secondary `#0B3B8C`, AI accent `#14B8A6`,
success `#12B76A`, warning `#F79009`, critical `#F04438`. Inter, an 8px spacing system,
12px card radius, thin neutral borders and subtle shadows only. Model output is always
marked with the same teal `AI DETECTED` / confidence tag. Hover, active, selected,
loading (skeleton), empty and error states are covered across the app.
