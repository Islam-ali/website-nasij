/**
 * Generate sitemap.xml for SSR deployment.
 * Usage: node tools/sitemap-builder.js
 */
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.SITEMAP_BASE_URL || 'https://pledgestores.com';
const OUTPUT_DIR = path.resolve('dist/browser');
const STATIC_ROUTES = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/about', changefreq: 'monthly', priority: 0.8 },
  { loc: '/shop', changefreq: 'weekly', priority: 0.9 },
  { loc: '/packages', changefreq: 'weekly', priority: 0.9 },
  { loc: '/track-order', changefreq: 'weekly', priority: 0.9 },
  { loc: '/privacy-policy', changefreq: 'weekly', priority: 0.9 },
  { loc: '/terms-of-service', changefreq: 'weekly', priority: 0.9 },
  { loc: '/faq', changefreq: 'weekly', priority: 0.9 },
];

const dynamicRoutesPath = path.resolve('dist/browser/seo-routes.json');

function normalizeUrl(loc) {
  return loc.startsWith('http') ? loc : `${BASE_URL}${loc}`;
}

function formatUrlTag({ loc, lastmod, changefreq, priority }) {
  return `  <url>
    <loc>${normalizeUrl(loc)}</loc>
    <lastmod>${lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${changefreq || 'weekly'}</changefreq>
    <priority>${priority ?? 0.7}</priority>
  </url>`;
}

function loadDynamicRoutes() {
  if (!fs.existsSync(dynamicRoutesPath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(dynamicRoutesPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[sitemap] Failed to parse dynamic routes:', error);
    return [];
  }
}

function buildSitemap() {
  const dynamicRoutes = loadDynamicRoutes();
  const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allRoutes.map(formatUrlTag),
    '</urlset>'
  ].join('\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(OUTPUT_DIR, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml);
console.log(`[sitemap] Generated sitemap with ${allRoutes.length} URLs at ${outputPath}`);
}

buildSitemap();

