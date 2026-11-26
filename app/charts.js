// charts.js — hand-rolled SVG charts: a donut for category shares, a ring for
// budget health, and grouped bars for the six-month report. No chart library;
// each function returns an SVG string the views drop into the page.

import { money, moneyShort, clamp } from './format.js';

function polar(cx, cy, radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
}

function arcPath(cx, cy, radius, startAngle, endAngle) {
  const [sx, sy] = polar(cx, cy, radius, startAngle);
  const [ex, ey] = polar(cx, cy, radius, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}

// Donut of { label, amount, color } slices with a centred total.
export function donutChart(slices, { size = 220, thickness = 30, centerLabel = '', centerValue = '' } = {}) {
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - thickness / 2 - 2;
  let angle = 0;
  let paths = '';
  if (total <= 0) {
    paths = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#e7ded2" stroke-width="${thickness}"/>`;
  } else if (slices.length === 1) {
    paths = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${slices[0].color}" stroke-width="${thickness}"/>`;
  } else {
    for (const slice of slices) {
      const sweep = (slice.amount / total) * 360;
      const end = angle + Math.max(0, sweep - 1.2);
      if (end > angle) {
        paths += `<path d="${arcPath(cx, cy, radius, angle, end)}" fill="none" stroke="${slice.color}" stroke-width="${thickness}"><title>${slice.label}: ${money(slice.amount)}</title></path>`;
      }
      angle += sweep;
    }
  }
  return `<svg class="chart" viewBox="0 0 ${size} ${size}" role="img" aria-label="Spending by category">
    ${paths}
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="chart-center-value">${centerValue}</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="chart-center-label">${centerLabel}</text>
  </svg>`;
}

// A single-value progress ring (0..1), coloured by how healthy the value is.
export function healthRing(ratio, { size = 150, thickness = 14 } = {}) {
  const clamped = clamp(ratio, 0, 1);
  const radius = size / 2 - thickness / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const color = ratio > 1 ? '#c0392b' : ratio >= 0.9 ? '#d98e4a' : '#2e7d52';
  return `<svg class="chart" viewBox="0 0 ${size} ${size}" role="img" aria-label="Budget used">
    <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="#e7ded2" stroke-width="${thickness}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${thickness}"
      stroke-linecap="round" stroke-dasharray="${(clamped * circumference).toFixed(1)} ${circumference.toFixed(1)}"
      transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="${size / 2}" y="${size / 2 + 2}" text-anchor="middle" class="chart-center-value">${Math.round(ratio * 100)}%</text>
    <text x="${size / 2}" y="${size / 2 + 22}" text-anchor="middle" class="chart-center-label">of budget used</text>
  </svg>`;
}

// Grouped bars: for each row an income bar and a spending bar, side by side.
export function groupedBars(rows, { width = 640, height = 260 } = {}) {
  const max = Math.max(...rows.flatMap((row) => [row.income, row.spent]), 1);
  const padLeft = 8;
  const padBottom = 26;
  const padTop = 18;
  const plotHeight = height - padBottom - padTop;
  const groupWidth = (width - padLeft * 2) / rows.length;
  const barWidth = Math.min(26, groupWidth / 3.4);
  let bars = '';
  rows.forEach((row, index) => {
    const groupX = padLeft + index * groupWidth + groupWidth / 2;
    const incomeHeight = (row.income / max) * plotHeight;
    const spentHeight = (row.spent / max) * plotHeight;
    const base = height - padBottom;
    bars += `<rect x="${(groupX - barWidth - 3).toFixed(1)}" y="${(base - incomeHeight).toFixed(1)}" width="${barWidth}" height="${incomeHeight.toFixed(1)}" rx="4" fill="#2e7d52"><title>Income ${money(row.income)}</title></rect>`;
    bars += `<rect x="${(groupX + 3).toFixed(1)}" y="${(base - spentHeight).toFixed(1)}" width="${barWidth}" height="${spentHeight.toFixed(1)}" rx="4" fill="#d98e4a"><title>Spent ${money(row.spent)}</title></rect>`;
    bars += `<text x="${groupX}" y="${base - incomeHeight - 6}" text-anchor="middle" class="chart-bar-value">${moneyShort(row.income)}</text>`;
    bars += `<text x="${groupX}" y="${height - 8}" text-anchor="middle" class="chart-axis-label">${row.label}</text>`;
  });
  bars += `<line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padLeft}" y2="${height - padBottom}" stroke="#e7ded2" stroke-width="1.5"/>`;
  return `<svg class="chart chart-wide" viewBox="0 0 ${width} ${height}" role="img" aria-label="Income versus spending by month" preserveAspectRatio="xMidYMid meet">${bars}</svg>`;
}

// A thin horizontal meter used in breakdown tables.
export function meterBar(ratio, color) {
  const width = clamp(ratio, 0, 1) * 100;
  return `<span class="meter"><span class="meter-fill" style="width:${width.toFixed(1)}%;background:${color}"></span></span>`;
}
