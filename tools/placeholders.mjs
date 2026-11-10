// Visuels provisoires (SVG) générés tant qu'un projet, un client ou un avis n'a pas ses vraies images.
// Dès qu'un champ image est renseigné dans src/data/*.json, le visuel provisoire n'est plus utilisé.

export const ACCENTS = ['#0071e3', '#12a37f', '#e3a008', '#8b5cf6', '#e5484d', '#0ea5b7'];

export const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const initials = (name) => {
  const parts = name.trim().split(/\s+/);
  const word = parts[0];
  return (parts.length > 1 ? word[0] + parts[parts.length - 1][0] : word[0] + word[word.length - 1]).toUpperCase();
};
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const SANS = '-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif';

const defs = (accent, id) => `<defs>
<pattern id="d${id}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="1.5" height="1.5" fill="#fff" fill-opacity=".1"/></pattern>
<radialGradient id="g${id}" cx="28%" cy="12%" r="85%"><stop offset="0" stop-color="${accent}" stop-opacity=".42"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
<linearGradient id="f${id}" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#0e0f11" stop-opacity="0"/><stop offset="1" stop-color="#0e0f11" stop-opacity=".85"/></linearGradient>
</defs>`;

const bg = (w, h, id) =>
  `<rect width="${w}" height="${h}" fill="#0e0f11"/><rect width="${w}" height="${h}" fill="url(#g${id})"/><rect width="${w}" height="${h}" fill="url(#d${id})"/>`;

/** Fenêtre de navigateur schématique (wireframe d'une page d'accueil). */
function windowFrame(w, h, accent) {
  const bar = 34;
  return `<rect width="${w}" height="${h}" rx="16" fill="#15171b" stroke="#fff" stroke-opacity=".14"/>
<circle cx="22" cy="17" r="4" fill="#fff" fill-opacity=".22"/><circle cx="36" cy="17" r="4" fill="#fff" fill-opacity=".22"/><circle cx="50" cy="17" r="4" fill="#fff" fill-opacity=".22"/>
<rect x="${w / 2 - 90}" y="9" width="180" height="16" rx="8" fill="#fff" fill-opacity=".07"/>
<line x1="0" y1="${bar}" x2="${w}" y2="${bar}" stroke="#fff" stroke-opacity=".1"/>
<rect x="28" y="${bar + 22}" width="54" height="10" rx="5" fill="#fff" fill-opacity=".8"/>
<rect x="${w - 118}" y="${bar + 18}" width="90" height="18" rx="9" fill="${accent}"/>
<rect x="${w * 0.14}" y="${bar + 86}" width="${w * 0.72}" height="26" rx="6" fill="#fff" fill-opacity=".92"/>
<rect x="${w * 0.24}" y="${bar + 124}" width="${w * 0.52}" height="26" rx="6" fill="#fff" fill-opacity=".92"/>
<rect x="${w * 0.27}" y="${bar + 172}" width="${w * 0.46}" height="8" rx="4" fill="#fff" fill-opacity=".3"/>
<rect x="${w * 0.33}" y="${bar + 188}" width="${w * 0.34}" height="8" rx="4" fill="#fff" fill-opacity=".3"/>
<rect x="${w / 2 - 104}" y="${bar + 220}" width="100" height="30" rx="15" fill="${accent}"/>
<rect x="${w / 2 + 4}" y="${bar + 220}" width="100" height="30" rx="15" fill="#fff" fill-opacity=".1"/>
<rect x="28" y="${bar + 286}" width="${(w - 80) / 3}" height="${Math.max(60, h - bar - 310)}" rx="12" fill="#fff" fill-opacity=".05" stroke="#fff" stroke-opacity=".08"/>
<rect x="${40 + (w - 80) / 3}" y="${bar + 286}" width="${(w - 80) / 3}" height="${Math.max(60, h - bar - 310)}" rx="12" fill="#fff" fill-opacity=".05" stroke="#fff" stroke-opacity=".08"/>
<rect x="${52 + (2 * (w - 80)) / 3}" y="${bar + 286}" width="${(w - 80) / 3}" height="${Math.max(60, h - bar - 310)}" rx="12" fill="#fff" fill-opacity=".05" stroke="#fff" stroke-opacity=".08"/>`;
}

const caption = (x, y, name, size = 13) =>
  `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" letter-spacing="1.2" fill="#fff" fill-opacity=".55">${esc(name.toUpperCase())} — VISUEL À VENIR</text>`;

/** Couverture 60:36 (cartes projet, slider d'accueil, archives). */
export const cover = (name, accent) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 504">${defs(accent, 'c')}${bg(840, 504, 'c')}
<g transform="translate(150 118) rotate(-7) skewX(-12)">${windowFrame(640, 460, accent)}</g>
<rect width="840" height="504" fill="url(#fc)"/>${caption(32, 474, name)}</svg>`;

/** Visuel haut des cartes « showcase » (cadré en haut à gauche). */
export const tall = (name, accent) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1146 1188">${defs(accent, 't')}${bg(1146, 1188, 't')}
<g transform="translate(0 0) scale(1.5)">${windowFrame(900, 900, accent)}</g></svg>`;

/** Capture de page (galerie de la page projet). */
export const page = (name, accent, n) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1270 794">${defs(accent, 'p')}${bg(1270, 794, 'p')}
<g transform="translate(135 ${n % 2 ? 70 : 110})">${windowFrame(1000, 760, accent)}</g>
<rect width="1270" height="794" fill="url(#fp)"/>${caption(40, 756, `${name} · écran ${n}`, 15)}</svg>`;

/** Aperçu mobile (onglet « mobile » de la page projet). */
export const mobile = (name, accent) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1270 794">${defs(accent, 'm')}${bg(1270, 794, 'm')}
<g transform="translate(470 52)"><rect width="330" height="690" rx="44" fill="#15171b" stroke="#fff" stroke-opacity=".16"/>
<rect x="115" y="16" width="100" height="22" rx="11" fill="#000" fill-opacity=".6"/>
<rect x="34" y="96" width="262" height="22" rx="6" fill="#fff" fill-opacity=".92"/><rect x="62" y="128" width="206" height="22" rx="6" fill="#fff" fill-opacity=".92"/>
<rect x="56" y="172" width="218" height="8" rx="4" fill="#fff" fill-opacity=".3"/><rect x="86" y="188" width="158" height="8" rx="4" fill="#fff" fill-opacity=".3"/>
<rect x="90" y="222" width="150" height="38" rx="19" fill="${accent}"/>
<rect x="24" y="298" width="282" height="150" rx="16" fill="#fff" fill-opacity=".05" stroke="#fff" stroke-opacity=".08"/>
<rect x="24" y="462" width="282" height="150" rx="16" fill="#fff" fill-opacity=".05" stroke="#fff" stroke-opacity=".08"/>
<rect x="115" y="664" width="100" height="5" rx="2.5" fill="#fff" fill-opacity=".4"/></g>
${caption(40, 756, `${name} · mobile`, 15)}</svg>`;

/** Pastille logo carrée d'un projet. */
export const logo = (name, accent) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"><rect width="88" height="88" fill="#0171e3"/>
<text x="44" y="55" text-anchor="middle" font-family="${SANS}" font-weight="600" font-size="30" letter-spacing="-1" fill="#fff">${esc(initials(name))}</text></svg>`;

/** Avatar (avis clients, équipe). */
export const avatar = (name, radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 132"><rect width="132" height="132" fill="#1c1c1c"/>
<text x="66" y="80" text-anchor="middle" font-family="${SANS}" font-weight="600" font-size="42" letter-spacing="-1" fill="#fff" fill-opacity=".9">${esc(initials(name))}</text></svg>`;

const GLYPHS = [
  '<circle cx="20" cy="40" r="12"/>',
  '<rect x="8" y="28" width="24" height="24" rx="6"/>',
  '<path d="M20 26l14 24H6z"/>',
  '<path d="M8 40a12 12 0 0 1 24 0v12H8z"/>',
  '<rect x="8" y="28" width="10" height="24" rx="3"/><rect x="22" y="28" width="10" height="24" rx="3"/>',
  '<path d="M20 26l12 14-12 14L8 40z"/>',
];

/** Logo client provisoire (mur de logos). */
export const client = (name, i) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 80"><g fill="#1c1c1c" fill-opacity=".55">${GLYPHS[i % GLYPHS.length]}
<text x="44" y="48" font-family="${SANS}" font-weight="600" font-size="${name.length > 12 ? 20 : 24}" letter-spacing="-.6">${esc(name)}</text></g></svg>`;
