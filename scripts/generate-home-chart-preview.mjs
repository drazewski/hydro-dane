import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../client/package.json', import.meta.url));
const { line: createLine, curveMonotoneX } = require('victory-vendor/d3-shape');

const source = new URL('../client/public/data/monthly/149200160.json', import.meta.url);
const { d: records } = JSON.parse(await readFile(source, 'utf8'));
const yearFrom = 2004;
const yearTo = 2009;
const data = records.filter(([year]) => year >= yearFrom && year <= yearTo);
const palettes = {
  light: { min: '#536575', avg: '#217fc2', max: '#d95d39' },
  dark: { min: '#b8c5d0', avg: '#63b3ed', max: '#ff9b7a' },
};

const plot = { left: 56, right: 896, top: 32, bottom: 466 };
const x = (index) => plot.left + index * (plot.right - plot.left) / (data.length - 1);
const y = (value) => plot.bottom - value / 20 * (plot.bottom - plot.top);
const coordinate = (value) => value.toFixed(2);
const line = (column) => createLine()
  .defined((record) => record[column] != null)
  .x((record, index) => x(index))
  .y((record) => y(record[column]))
  .curve(curveMonotoneX)(data)
  .replace(/\d+\.\d+/g, (value) => String(Number(Number(value).toFixed(2))));

const grid = [0, 5, 10, 15, 20].map((value) => `
    <path d="M${plot.left},${y(value)}H${plot.right}" />
    <text x="40" y="${y(value) + 4}" text-anchor="end">${value}°C</text>`).join('');
const years = Array.from({ length: yearTo - yearFrom + 1 }, (_, index) => yearFrom + index).map((year) => {
  const index = data.findIndex((record) => record[0] === year);
  return `
    <path d="M${coordinate(x(index))},${plot.top}V${plot.bottom}" />
    <text x="${coordinate(x(index + 5.5))}" y="494" text-anchor="middle">${year}</text>`;
}).join('');

for (const [theme, colors] of Object.entries(palettes)) {
  const filename = theme === 'dark' ? 'home-chart-preview-dark.svg' : 'home-chart-preview.svg';
  const destination = new URL(`../client/public/images/${filename}`, import.meta.url);
  await writeFile(destination, `<svg xmlns="http://www.w3.org/2000/svg" width="940" height="510" viewBox="0 0 940 510" fill="none">
  <title>Temperatura wody — Dunajec, Krościenko</title>
  <desc>Rzeczywiste miesięczne wartości minimalne, średnie i maksymalne z lat ${yearFrom}–${yearTo}. Źródło: IMGW-PIB, stacja 149200160.</desc>
  <g font-family="Montserrat, Arial, sans-serif">
    <g stroke="#8c9eaf" stroke-opacity=".2" stroke-dasharray="3 5" fill="#7f8e9c" font-size="12">
${grid}
${years}
    </g>
    <g stroke-linejoin="round" stroke-linecap="round">
      <path d="${line(8)}" stroke="${colors.min}" stroke-width="1" />
      <path d="${line(10)}" stroke="${colors.max}" stroke-width="1" />
      <path d="${line(9)}" stroke="${colors.avg}" stroke-width="3" />
    </g>
  </g>
</svg>
`);
}

console.log(`Generated light and dark homepage chart previews from ${data.length} monthly records.`);
