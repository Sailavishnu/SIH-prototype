/* Formatting helpers — Indian locale conventions throughout. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

export function formatDateTime(ts) {
  if (!ts) return '—';
  return `${formatDate(ts)}, ${formatTime(ts)}`;
}

/** "12 min ago", "3 h ago", "5 d ago" */
export function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} d ago`;
  const months = Math.floor(days / 30);
  return `${months} mo ago`;
}

/** ISO yyyy-mm-dd for <input type="date"> */
export function toInputDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Indian digit grouping: 1,23,456 */
export function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-IN').format(n);
}

export function formatGps(lat, lng) {
  return `${Number(lat).toFixed(5)}° N, ${Number(lng).toFixed(5)}° E`;
}

export function formatPct(n, digits = 1) {
  return `${Number(n).toFixed(digits)}%`;
}

/** Haversine-free rough distance in km — good enough for mock "nearby" sorting. */
export function distanceKm(a, b) {
  const dx = (a[1] - b[1]) * 108;
  const dy = (a[0] - b[0]) * 111;
  return Math.sqrt(dx * dx + dy * dy);
}

export const cx = (...parts) => parts.filter(Boolean).join(' ');
