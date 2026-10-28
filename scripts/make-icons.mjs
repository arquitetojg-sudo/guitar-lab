// Gera os ícones PNG do PWA a partir de um SVG desenhado aqui.
// Uso: npm run icons
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'node:fs';

const icon = (pad) => {
  // Trecho de braço: 4 cordas, 3 trastes, uma nota fundamental em destaque.
  const s = 512;
  const inner = s - pad * 2;
  const x0 = pad + inner * 0.16;
  const x1 = pad + inner * 0.84;
  const y0 = pad + inner * 0.2;
  const y1 = pad + inner * 0.8;
  const strings = [0, 1, 2, 3].map((i) => y0 + ((y1 - y0) / 3) * i);
  const frets = [0, 1, 2].map((i) => x0 + ((x1 - x0) / 2) * i);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="#1a1f24"/>
  <rect x="${x0}" y="${y0 - 18}" width="${x1 - x0}" height="${y1 - y0 + 36}" rx="10" fill="#3d2a20"/>
  ${frets.map((x) => `<rect x="${x - 5}" y="${y0 - 18}" width="10" height="${y1 - y0 + 36}" fill="#c9ced4"/>`).join('')}
  ${strings.map((y, i) => `<rect x="${x0 - 30}" y="${y - (3 + i)}" width="${x1 - x0 + 60}" height="${6 + i * 2}" fill="#e6e1d6"/>`).join('')}
  <circle cx="${(frets[0] + frets[1]) / 2}" cy="${strings[2]}" r="${inner * 0.085}" fill="#e0393f" stroke="#1a1f24" stroke-width="8"/>
  <circle cx="${(frets[1] + frets[2]) / 2}" cy="${strings[0]}" r="${inner * 0.06}" fill="#f2f4f6" stroke="#1a1f24" stroke-width="6"/>
</svg>`;
};

mkdirSync('public/icons', { recursive: true });
const out = [
  ['icon-192.png', 192, 40],
  ['icon-512.png', 512, 40],
  ['icon-maskable-512.png', 512, 96],
  ['apple-touch-icon.png', 180, 40],
];
for (const [name, size, pad] of out) {
  const png = new Resvg(icon(pad), { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(`public/icons/${name}`, png);
}
writeFileSync('public/icons/icon.svg', icon(40));
console.log('Ícones gerados em public/icons/');
