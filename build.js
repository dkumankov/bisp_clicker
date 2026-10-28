#!/usr/bin/env node
// Cache-busting without a bundler: stamps every local CSS/JS/image reference
// with ?v=<first 8 chars of md5 of the file's content>.
//
//   node build.js          rewrite files in place
//   node build.js --check  change nothing, exit 1 if any stamp is stale (CI / hooks)
//
// Idempotent: old ?v=... stamps are stripped before hashing. A JS module's hash
// covers its *rewritten* source (including the stamps of its own imports), so
// changing data.js also changes the hash of every module that imports it, and
// finally the URL in index.html. Nothing can end up as a stale/fresh mix.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const ENTRY = 'index.html';
const CHECK = process.argv.includes('--check');

const md5 = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const isLocal = (u) => u && !/^([a-z][a-z0-9+.-]*:|\/\/|#|data:)/i.test(u);
const norm = (from, spec) => path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));

// import 'x' | import ... from 'x' | export ... from 'x' | import('x'), local specifiers only
const JS_REF = /(\b(?:from|import)\s*\(?\s*)(['"])(\.{1,2}\/[^'"?#]+)(\?v=[0-9a-f]*)?\2/g;
// src= / href= in html (local files only)
const HTML_REF = /(\b(?:src|href)=)(["'])([^"'?#]+)(\?v=[0-9a-f]*)?\2/g;
// url(...) in css (local files only)
const CSS_REF = /(\burl\(\s*)(['"]?)([^'")?#]+)(\?v=[0-9a-f]*)?\2(?=\s*\))/g;

const pending = new Map();   // rel path -> new text, to write at the end
const hashes = new Map();    // rel path -> hash
const stack = [];

// Returns the hash of a file, rewriting its references to dependencies first.
function hashOf(rel) {
  if (hashes.has(rel)) return hashes.get(rel);
  if (stack.includes(rel)) throw new Error(`Import cycle: ${[...stack, rel].join(' -> ')}`);
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) throw new Error(`Missing file: ${rel}`);
  stack.push(rel);
  let hash;
  const ext = path.extname(rel);
  if (ext === '.js' || ext === '.css') {
    const re = ext === '.js' ? JS_REF : CSS_REF;
    const src = read(rel);
    const out = src.replace(re, (m, pre, q, spec) => {
      if (ext === '.css' && !isLocal(spec)) return m;
      return `${pre}${q}${spec}?v=${hashOf(norm(rel, spec))}${q}`;
    });
    if (out !== src) pending.set(rel, out);
    hash = md5(out);
  } else {
    hash = md5(fs.readFileSync(abs));   // images etc.: raw bytes
  }
  stack.pop();
  hashes.set(rel, hash);
  return hash;
}

const html = read(ENTRY);
const htmlOut = html.replace(HTML_REF, (m, pre, q, spec) =>
  isLocal(spec) && /\.(js|css|webp|png|jpe?g|svg|gif|ico)$/i.test(spec)
    ? `${pre}${q}${spec}?v=${hashOf(norm(ENTRY, spec))}${q}`
    : m);
if (htmlOut !== html) pending.set(ENTRY, htmlOut);

// Leftovers of the old manual scheme / unsupported patterns
const warnings = [];
for (const rel of hashes.keys()) {
  if (path.extname(rel) === '.js' && /\bimport\s*\(\s*[^'"\s]/.test(read(rel))) {
    warnings.push(`${rel}: dynamic import() with a non-literal specifier can't be stamped`);
  }
}
warnings.forEach((w) => console.warn('warning:', w));

if (CHECK) {
  if (pending.size) {
    console.error('Stale cache-busting stamps in: ' + [...pending.keys()].join(', '));
    console.error('Run: node build.js');
    process.exit(1);
  }
  console.log(`OK: ${hashes.size} assets, all stamps up to date`);
} else {
  for (const [rel, text] of pending) fs.writeFileSync(path.join(ROOT, rel), text);
  console.log(`Stamped ${hashes.size} assets, ${pending.size} file(s) updated`);
  for (const [rel, h] of hashes) console.log(`  ${h}  ${rel}`);
}
