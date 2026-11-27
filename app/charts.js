// charts.js — the site's two charts, drawn as inline SVG.
//
// No chart library: a donut for the month's spending by category and a
// grouped bar chart for the six-month trend. Both are built as strings
// from plain numbers, so any view can drop them into its HTML.

import { esc, yen } from './format.js';

// Donut of expense shares. segments: [{ name, value, color }].
// The centre carries the month's total spending.
export function donutChart(segments, total) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const gap = 2.5; // breathing room between slices, in path units
  let offset = 0;
  const slices = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const length = (s.value / total) * circumference;
      const dash = Math.max(0, length - gap);
      const el =
        `<circle cx="110" cy="110" r="${radius}" fill="none" stroke="${s.color}" ` +
        `stroke-width="30" stroke-dasharray="${dash} ${circumference - dash}" ` +
        `stroke-dashoffset="${-offset}" transform="rotate(-90 110 110)">` +
        `<title>${esc(s.name)}: ${esc(yen(s.value))}</title></circle>`;
      offset += length;
      return el;
    })
    .join('');
  return (
    `<svg class="donut" viewBox="0 0 220 220" role="img" aria-label="カテゴリ別支出の割合">` +
    slices +
    `<text x="110" y="103" class="donut-label">生活支出</text>` +
    `<text x="110" y="130" class="donut-value">${esc(yen(total))}</text></svg>`
  );
}

// Grouped bars: one income bar and one expense bar per month.
// months: [{ month: '2026-06', income, expense }]
export function trendChart(months) {
  const width = 660;
  const height = 250;
  const base = 205; // y of the axis
  const top = 25;
  const max = Math.max(...months.map((m) => Math.max(m.income, m.expense))) * 1.08;
  const slot = (width - 50) / months.length;
  const barWidth = 22;
  const scale = (value) => (value / max) * (base - top);
  const parts = [
    `<line x1="40" y1="${base}" x2="${width - 10}" y2="${base}" class="axis-line"/>`,
  ];
  months.forEach((m, i) => {
    const centre = 50 + slot * i + slot / 2;
    const incomeH = scale(m.income);
    const expenseH = scale(m.expense);
    const monthName = `${Number(m.month.split('-')[1])}月`;
    parts.push(
      `<rect x="${centre - barWidth - 2}" y="${base - incomeH}" width="${barWidth}" height="${incomeH}" rx="3" class="bar-income"><title>収入 ${esc(yen(m.income))}</title></rect>`,
      `<rect x="${centre + 2}" y="${base - expenseH}" width="${barWidth}" height="${expenseH}" rx="3" class="bar-expense"><title>支出 ${esc(yen(m.expense))}</title></rect>`,
      `<text x="${centre}" y="${base + 20}" class="axis-label">${monthName}</text>`,
      `<text x="${centre}" y="${base - expenseH - 6}" class="bar-value">${esc(Math.round(m.expense / 1000))}k</text>`,
    );
  });
  return (
    `<svg class="trend" viewBox="0 0 ${width} ${height}" role="img" aria-label="6か月の収支の推移">` +
    parts.join('') +
    `</svg>` +
    `<p class="chart-legend"><span class="legend-swatch legend-income"></span>収入` +
    `<span class="legend-swatch legend-expense"></span>支出（数字は支出額・千円）</p>`
  );
}
