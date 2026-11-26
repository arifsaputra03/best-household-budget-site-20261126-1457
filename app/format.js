// format.js — small display helpers shared by every view: money, dates and percents.
// Everything is plain functions over plain values; no state lives here.

export function money(amount, { cents = true } = {}) {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const text = abs.toLocaleString('en-US', {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
  return `${sign}$${text}`;
}

export function moneyShort(amount) {
  if (Math.abs(amount) >= 1000) return '$' + (amount / 1000).toFixed(2).replace(/\.?0+$/, '') + 'k';
  return money(amount, { cents: false });
}

export function percent(part, whole, digits = 0) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100 * 10 ** digits) / 10 ** digits;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = MONTH_NAMES.map((name) => name.slice(0, 3));
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function monthName(monthIndex) {
  return MONTH_NAMES[monthIndex];
}

export function monthShort(monthIndex) {
  return MONTH_SHORT[monthIndex];
}

// A month key is "YYYY-MM"; it is how transactions, budgets and bills are grouped.
export function monthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

export function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function shiftMonthKey(key, delta) {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return monthKey(date.getFullYear(), date.getMonth());
}

export function daysInMonth(key) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

// "2026-11-04" -> "Tue 4 Nov"
export function prettyDate(iso) {
  const date = new Date(iso + 'T12:00:00');
  return `${DAY_NAMES[date.getDay()].slice(0, 3)} ${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

// "2026-11-04" -> "4 Nov" (calendar cells and other tight spots)
export function dayMonth(iso) {
  const date = new Date(iso + 'T12:00:00');
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

export function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
