import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const siteOrigin = 'https://house-app.com';
const errors = [];

const fail = (message) => errors.push(message);
const read = (path) => readFileSync(path, 'utf8');

function walk(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path, extension) : extname(path) === extension ? [path] : [];
  });
}

function matchOne(html, expression, label, page) {
  const matches = [...html.matchAll(expression)];
  if (matches.length !== 1) fail(`${page}: expected one ${label}, found ${matches.length}`);
  return matches[0]?.[1];
}

function localTarget(rawValue) {
  if (!rawValue || rawValue.startsWith('#') || rawValue.startsWith('mailto:') || rawValue.startsWith('tel:')) return null;
  let url;
  try {
    url = new URL(rawValue, siteOrigin);
  } catch {
    return null;
  }
  if (url.origin !== siteOrigin) return null;
  const path = decodeURIComponent(url.pathname);
  if (path === '/') return join(dist, 'index.html');
  if (path.endsWith('/')) return join(dist, path, 'index.html');
  if (extname(path)) return join(dist, path);
  return existsSync(join(dist, path)) ? join(dist, path) : join(dist, `${path}/index.html`);
}

if (!existsSync(dist)) {
  console.error('dist/ does not exist. Run npm run build first.');
  process.exit(1);
}

const htmlFiles = walk(dist, '.html');
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
const indexableCanonicals = [];

for (const file of htmlFiles) {
  const page = `/${relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/')}`;
  const html = read(file);
  const isInvite = page.startsWith('/invite');
  const title = matchOne(html, /<title>([^<]+)<\/title>/g, 'title', page);
  const robots = matchOne(html, /<meta name="robots" content="([^"]+)">/g, 'robots meta tag', page);
  const canonical = matchOne(html, /<link rel="canonical" href="([^"]+)">/g, 'canonical link', page);

  if (!canonical?.startsWith(`${siteOrigin}/`)) fail(`${page}: canonical is not an absolute house-app.com URL`);

  if (isInvite) {
    if (robots !== 'noindex,follow') fail(`${page}: invite route must be noindex,follow`);
  } else {
    const description = matchOne(html, /<meta name="description" content="([^"]+)">/g, 'meta description', page);
    const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;
    if (h1Count !== 1) fail(`${page}: expected one H1, found ${h1Count}`);
    if (robots !== 'index,follow') fail(`${page}: public route must be index,follow`);

    for (const [value, map, label] of [
      [title, titles, 'title'],
      [description, descriptions, 'description'],
      [canonical, canonicals, 'canonical'],
    ]) {
      if (!value) continue;
      if (map.has(value)) fail(`${page}: duplicate ${label} also used by ${map.get(value)}`);
      map.set(value, page);
    }

    if (canonical) indexableCanonicals.push(canonical);
    const jsonScripts = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    if (jsonScripts.length === 0) fail(`${page}: missing JSON-LD`);
    for (const script of jsonScripts) {
      try {
        JSON.parse(script[1]);
      } catch (error) {
        fail(`${page}: malformed JSON-LD (${error.message})`);
      }
    }
  }

  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    const target = localTarget(reference);
    if (target && !existsSync(target)) fail(`${page}: missing local target ${reference}`);
  }
}

const sitemapFiles = readdirSync(dist).filter((file) => /^sitemap.*\.xml$/.test(file));
const sitemap = sitemapFiles.map((file) => read(join(dist, file))).join('\n');
for (const canonical of indexableCanonicals) {
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) fail(`sitemap: missing ${canonical}`);
}
if (sitemap.includes('/invite')) fail('sitemap: invite routes must not be included');

const robots = read(join(dist, 'robots.txt'));
function directivesFor(agent) {
  const marker = agent === '*' ? '\\*' : agent;
  return robots.match(new RegExp(`User-agent: ${marker}\\n([\\s\\S]*?)(?=\\nUser-agent:|\\nSitemap:)`))?.[1] ?? '';
}

for (const agent of ['*', 'Googlebot', 'Bingbot', 'OAI-SearchBot', 'PerplexityBot', 'Applebot', 'Google-Extended']) {
  const directives = directivesFor(agent);
  if (!directives.includes('Allow: /')) fail(`robots.txt: ${agent} must be allowed`);
  if (!directives.includes('Disallow: /invite')) fail(`robots.txt: ${agent} must exclude invite routes`);
}
for (const agent of ['GPTBot', 'ClaudeBot', 'CCBot', 'Applebot-Extended']) {
  if (!directivesFor(agent).includes('Disallow: /')) fail(`robots.txt: ${agent} must be blocked`);
}
if (!robots.includes('Sitemap: https://house-app.com/sitemap-index.xml')) fail('robots.txt: missing absolute sitemap reference');

const requiredFiles = [
  'CNAME',
  'ads.txt',
  'robots.txt',
  '.well-known/apple-app-site-association',
  '.well-known/app-lottery-verification.json',
  'assets/House_Manager_Press_Kit.zip',
  'assets/house-manager-social-card.png',
];
for (const file of requiredFiles) {
  const path = join(dist, file);
  if (!existsSync(path) || statSync(path).size === 0) fail(`missing required production file: ${file}`);
}

try {
  JSON.parse(read(join(dist, '.well-known/app-lottery-verification.json')));
  JSON.parse(read(join(dist, '.well-known/apple-app-site-association')));
} catch (error) {
  fail(`Apple verification JSON is invalid: ${error.message}`);
}

if (existsSync(join(dist, 'llms.txt'))) fail('llms.txt must not be generated');

if (errors.length > 0) {
  console.error(`SEO validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`SEO validation passed for ${htmlFiles.length} HTML routes and ${requiredFiles.length} preserved production files.`);
