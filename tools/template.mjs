// Mini moteur de gabarits (sous-ensemble de la syntaxe Handlebars), sans dépendance.
//   {{chemin.vers.valeur}}   valeur échappée        {{{html}}}            valeur brute
//   {{#each liste}}…{{/each}} ({{this}}, {{@first}}, {{@index}})
//   {{#if x}}…{{else}}…{{/if}}   {{#unless x}}…{{/unless}}   {{> partiel}}
//   {{@root.x}} remonte au contexte global ; un nom introuvable localement y est aussi cherché.

const TAG = /\{\{(\{)?\s*([^}]+?)\s*\}?\}\}/g;
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escape = (v) => String(v).replace(/[&<>"]/g, (c) => ESC[c]);

function parse(src, name) {
  const root = { type: 'root', body: [] };
  const open = [root]; // blocs ouverts
  const outs = [root.body]; // tableau en cours d'écriture pour chacun (corps ou branche else)
  const out = () => outs[outs.length - 1];
  let last = 0;
  for (const m of src.matchAll(TAG)) {
    if (m.index > last) out().push(src.slice(last, m.index));
    last = m.index + m[0].length;
    const [, raw, expr] = m;
    if (expr[0] === '#') {
      const [kind, arg] = expr.slice(1).split(/\s+/);
      const node = { type: kind, arg, body: [], alt: [] };
      out().push(node);
      open.push(node);
      outs.push(node.body);
    } else if (expr === 'else') {
      outs[outs.length - 1] = open[open.length - 1].alt;
    } else if (expr[0] === '/') {
      const node = open.pop();
      outs.pop();
      if (open.length === 0 || node.type !== expr.slice(1)) {
        throw new Error(`${name}: {{${expr}}} ne ferme pas le bloc {{#${node.type}}}`);
      }
    } else if (expr[0] === '>') {
      out().push({ type: 'partial', arg: expr.slice(1).trim() });
    } else {
      out().push({ type: 'var', arg: expr, raw: Boolean(raw) });
    }
  }
  if (last < src.length) out().push(src.slice(last));
  if (open.length > 1) throw new Error(`${name}: bloc {{#${open[open.length - 1].type}}} non fermé`);
  return root.body;
}

function lookup(expr, frames, root) {
  const frame = frames[frames.length - 1];
  if (expr === 'this') return frame.ctx;
  if (expr === '@first') return frame.index === 0;
  if (expr === '@index') return frame.index;
  let path = expr.split('.');
  let base = frame.ctx;
  if (path[0] === '@root') {
    base = root;
    path = path.slice(1);
  } else if (base == null || typeof base !== 'object' || !(path[0] in base)) {
    base = root;
  }
  return path.reduce((v, k) => (v == null ? undefined : v[k]), base);
}

const truthy = (v) => (Array.isArray(v) ? v.length > 0 : Boolean(v));

function run(nodes, frames, root, partials) {
  let out = '';
  for (const n of nodes) {
    if (typeof n === 'string') out += n;
    else if (n.type === 'var') {
      const v = lookup(n.arg, frames, root);
      out += v == null ? '' : n.raw ? v : escape(v);
    } else if (n.type === 'partial') {
      if (!partials[n.arg]) throw new Error(`partiel inconnu : ${n.arg}`);
      out += run(partials[n.arg], frames, root, partials);
    } else if (n.type === 'each') {
      const list = lookup(n.arg, frames, root) || [];
      list.forEach((ctx, index) => {
        out += run(n.body, [...frames, { ctx, index }], root, partials);
      });
    } else if (n.type === 'if' || n.type === 'unless') {
      const ok = truthy(lookup(n.arg, frames, root)) === (n.type === 'if');
      out += run(ok ? n.body : n.alt, frames, root, partials);
    } else throw new Error(`bloc inconnu : {{#${n.type}}}`);
  }
  return out;
}

export function createEngine() {
  const partials = {};
  return {
    partial(name, src) {
      partials[name] = parse(src, name);
    },
    compile(src, name = 'gabarit') {
      const ast = parse(src, name);
      return (data) => run(ast, [{ ctx: data, index: 0 }], data, partials);
    },
  };
}
