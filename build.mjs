// Générateur statique du site ULYCOM.
//   node build.mjs      -> écrit le site dans ./dist
// Contenu : src/data/*.json · Gabarits : src/pages/*.hbs · Fichiers statiques : public/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEngine } from './tools/template.mjs';
import * as ph from './tools/placeholders.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const PUB = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');

const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');
const json = (p) => JSON.parse(read(`data/${p}.json`));
const exists = (p) => fs.existsSync(path.join(PUB, p));

function write(rel, content) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

/** Écrit un visuel provisoire dans dist/ et renvoie son URL. */
function gen(name, svg) {
  write(`assets/img/gen/${name}.svg`, svg);
  return `/assets/img/gen/${name}.svg`;
}

const monthLabel = (ym) =>
  new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long' }).format(new Date(`${ym}-01T12:00:00`));

function loadData() {
  const site = json('site');
  const digits = (site.whatsapp || '').replace(/\D/g, '');
  site.whatsappUrl = digits ? `https://wa.me/${digits}` : '/rendez-vous';
  site.whatsappExternal = Boolean(digits);
  // Réglages du module de réservation, lus par initBooking (main.js)
  site.bookingJson = JSON.stringify({
    ...(site.booking || {}),
    name: site.name,
    email: site.email || '',
    whatsapp: digits,
  }).replace(/</g, '\\u003c');

  const projects = json('projects').map((p, i) => {
    const accent = ph.ACCENTS[i % ph.ACCENTS.length];
    const cover = p.cover || gen(`${p.slug}-cover`, ph.cover(p.name, accent));
    const media = p.media || [
      { device: 'desktop', image: cover },
      ...(p.cover ? [] : [{ device: 'mobile', image: gen(`${p.slug}-mobile`, ph.mobile(p.name, accent)) }]),
    ];
    return {
      ...p,
      cover,
      coverTall: p.coverTall || (p.cover ? cover : gen(`${p.slug}-tall`, ph.tall(p.name, accent))),
      logo: p.logo || gen(`${p.slug}-logo`, ph.logo(p.name, accent)),
      dateLabel: p.period || (p.date ? monthLabel(p.date) : ''),
      media,
      hasMobile: media.length > 1,
      gallery: p.gallery || (p.cover ? [] : [1, 2].map((n) => gen(`${p.slug}-page-${n}`, ph.page(p.name, accent, n)))),
      team: (p.team || []).map((m) => ({ ...m, avatar: m.avatar || gen(`team-${ph.slug(m.name)}`, ph.avatar(m.name, 24)) })),
    };
  });

  const reviews = json('reviews').map((r, i) => ({
    ...r,
    avatar: r.avatar || gen(`avatar-${i + 1}`, ph.avatar(r.name, 999)),
  }));
  const clients = json('clients').map((c, i) => ({
    ...c,
    logo: c.logo || gen(`client-${i + 1}`, ph.client(c.name, i)),
  }));

  return {
    site,
    offer: json('offer'),
    projects,
    showcase: projects.filter((p) => p.showcase),
    categories: [...new Set(projects.map((p) => p.category))],
    reviews,
    clients,
    year: new Date().getFullYear(),
    hasDisplayFont: exists('assets/fonts/PPMori.woff2'),
  };
}

export function build() {
  const t0 = Date.now();
  fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(PUB, DIST);

  const hbs = createEngine();
  for (const f of fs.readdirSync(path.join(SRC, 'partials'))) {
    hbs.partial(path.basename(f, '.hbs'), read(`partials/${f}`).trim());
  }
  const layout = hbs.compile(read('layout.hbs'), 'layout');
  const page = (name) => hbs.compile(read(`pages/${name}.hbs`), name);
  const data = loadData();
  const { site } = data;

  const render = (route, tpl, extra = {}) => {
    const ctx = { ...data, ...extra, route };
    ctx.title = extra.title ? `${extra.title} — ${site.name}` : site.title;
    ctx.description = extra.description || site.description;
    ctx.canonical = site.url ? site.url.replace(/\/$/, '') + route : '';
    const html = layout({ ...ctx, main: tpl(ctx) });
    write(route === '/404' ? '404.html' : path.join(route, 'index.html'), html);
  };

  render('/', page('home'));
  render('/realisations', page('realisations'), { title: 'Réalisations' });
  render('/offre', page('offre'), { title: 'Offre' });
  render('/rendez-vous', page('rendez-vous'), { title: 'Réserver un appel' });
  render('/merci', page('merci'), { title: 'Merci' });
  render('/legal/mentions-legales', page('legal'), { title: 'Mentions légales' });
  render('/404', page('404'), { title: 'Page introuvable' });
  const project = page('project');
  for (const p of data.projects) {
    render(`/projects/${p.slug}`, project, { project: p, title: `Projet ${p.name}`, description: p.description });
  }

  if (site.url) {
    const routes = ['/', '/realisations', '/offre', '/rendez-vous', ...data.projects.map((p) => `/projects/${p.slug}`)];
    const base = site.url.replace(/\/$/, '');
    write(
      'sitemap.xml',
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
        .map((r) => `  <url><loc>${base}${r}</loc></url>`)
        .join('\n')}\n</urlset>\n`,
    );
  }
  return Date.now() - t0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`Site généré dans dist/ en ${build()} ms`);
}
