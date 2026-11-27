// format.js — small display helpers: yen amounts, dates and percentages.
//
// Every page formats money through yen() so amounts look the same
// everywhere on the site, and month arithmetic lives here too so the
// views never parse dates by hand.

// 1234567 -> '¥1,234,567' (minus sign before the yen mark when negative)
export function yen(amount) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}¥${Math.abs(Math.round(amount)).toLocaleString('ja-JP')}`;
}

// Signed amounts for the balance line: '+¥188,223' / '-¥12,300'
export function signedYen(amount) {
  if (amount === 0) return '¥0';
  return (amount > 0 ? '+' : '-') + '¥' + Math.abs(Math.round(amount)).toLocaleString('ja-JP');
}

// '2026-11' -> '2026年11月'
export function monthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return `${year}年${month}月`;
}

// '2026-11-27' -> '11月27日（木）'
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
export function dayLabel(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAYS[date.getDay()]}）`;
}

// Shift a 'YYYY-MM' key by a number of months, e.g. shiftMonth('2026-11', -1)
export function shiftMonth(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// 0.83 -> '83%' (rounded, clamped for progress bars)
export function percent(ratio) {
  return `${Math.round(ratio * 100)}%`;
}

// 0.263 -> '26.3%' (one decimal, used for the savings rate)
export function percent1(ratio) {
  return `${(Math.round(ratio * 1000) / 10).toFixed(1)}%`;
}

// Escape text before putting it into an HTML string.
export function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
