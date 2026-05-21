// ABOUTME: One-time script to regenerate the static OG social-card image.
// ABOUTME: Renders an inline SVG to a 1200x630 PNG using sharp; commit the PNG output.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'static', 'og-image.png');

// Hand-crafted 1200x630 SVG. Brand: blue (#2563eb / #1d4ed8) on light background.
// Layout: left column has copy + brand, right column has a stylized 3x3 bingo grid.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eff6ff"/>
      <stop offset="1" stop-color="#dbeafe"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="#1e3a8a" flood-opacity="0.18"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Brand mark + name -->
  <g transform="translate(80, 90)">
    <rect width="72" height="72" rx="16" fill="#2563eb"/>
    <g transform="translate(11, 11) scale(2.27)" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#ffffff"/>
      <polygon points="4,1.8 4.529,3.272 6.092,3.320 4.856,4.278 5.293,5.780 4,4.9 2.707,5.780 3.144,4.278 1.908,3.320 3.471,3.272" fill="#2563eb"/>
      <rect x="8" y="1" width="6" height="6" rx="1.5" stroke="#ffffff" stroke-width="1.5"/>
      <rect x="15" y="1" width="6" height="6" rx="1.5" stroke="#ffffff" stroke-width="1.5"/>
      <rect x="1" y="8" width="6" height="6" rx="1.5" stroke="#ffffff" stroke-width="1.5"/>
      <rect x="8" y="8" width="6" height="6" rx="1.5" fill="#ffffff"/>
      <polygon points="11,8.8 11.529,10.272 13.092,10.320 11.856,11.278 12.293,12.780 11,11.9 9.707,12.780 10.144,11.278 8.908,10.320 10.471,10.272" fill="#2563eb"/>
      <rect x="15" y="8" width="6" height="6" rx="1.5" stroke="#ffffff" stroke-width="1.5"/>
      <rect x="1" y="15" width="6" height="6" rx="1.5" stroke="#ffffff" stroke-width="1.5"/>
      <rect x="8" y="15" width="6" height="6" rx="1.5" stroke="#ffffff" stroke-width="1.5"/>
      <rect x="15" y="15" width="6" height="6" rx="1.5" fill="#ffffff"/>
      <polygon points="18,15.8 18.529,17.272 20.092,17.320 18.856,18.278 19.293,19.780 18,18.9 16.707,19.780 17.144,18.278 15.908,17.320 17.471,17.272" fill="#2563eb"/>
    </g>
    <text x="96" y="50" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-weight="800" font-size="42" fill="#0f172a" letter-spacing="2">BINGOALS</text>
  </g>

  <!-- Headline -->
  <g transform="translate(80, 260)" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" fill="#0f172a">
    <text x="0" y="0" font-size="58" font-weight="800">Turn your goals</text>
    <text x="0" y="72" font-size="58" font-weight="800">into a bingo board.</text>
    <text x="0" y="142" font-size="26" font-weight="500" fill="#475569">Track visually.</text>
    <text x="0" y="178" font-size="26" font-weight="500" fill="#475569">Share progress. Celebrate bingos.</text>
  </g>

  <!-- URL pill -->
  <g transform="translate(80, 510)">
    <rect width="260" height="52" rx="26" fill="#2563eb"/>
    <text x="130" y="34" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-weight="700" font-size="20" fill="#ffffff">gobingoals.app</text>
  </g>

  <!-- Decorative bingo card on the right -->
  <g transform="translate(830, 110)" filter="url(#cardShadow)">
    <rect width="320" height="410" rx="20" fill="#ffffff"/>
    <text x="160" y="46" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-weight="800" font-size="24" fill="#0f172a" letter-spacing="6">BINGO</text>

    <!-- 3x3 grid of cells, some checked -->
    <g transform="translate(25, 75)">
      ${gridSvg()}
    </g>
  </g>
</svg>`;

function gridSvg() {
  const cell = 84;
  const gap = 11;
  const cells = [
    ['Run 5k', true],
    ['Read 12 books', false],
    ['Visit 3 cities', true],
    ['Learn guitar', false],
    ['Side project', true],
    ['Cook weekly', false],
    ['Save 20%', true],
    ['Hike monthly', false],
    ['Write daily', true]
  ];

  let out = '';
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = col * (cell + gap);
    const y = row * (cell + gap);
    const [label, checked] = cells[i];
    const fill = checked ? '#2563eb' : '#f8fafc';
    const stroke = checked ? '#1d4ed8' : '#e2e8f0';
    const textColor = checked ? '#ffffff' : '#475569';
    out += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    if (checked) {
      const cx = x + cell / 2;
      const cy = y + cell / 2;
      out += `<path d="M ${cx - 18} ${cy} l 12 12 l 22 -22" fill="none" stroke="${textColor}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else {
      const cx = x + cell / 2;
      const cy = y + cell / 2 + 6;
      const truncated = label.length > 11 ? label.slice(0, 10) + '…' : label;
      out += `<text x="${cx}" y="${cy}" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-weight="600" font-size="14" fill="${textColor}">${truncated}</text>`;
    }
  }
  return out;
}

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log(`Wrote ${OUT}`);
