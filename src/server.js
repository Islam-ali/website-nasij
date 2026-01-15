// generate-sitemap.js
import { writeFileSync } from 'node:fs';
import * as https from 'node:https';
import * as http from 'node:http';
import { URL } from 'node:url';

// إعدادات الموقع
const BASE_URL = 'https://pledgestores.com';
const API_URL = 'https://api.pledgestores.com/api/v1/products?page=1&limit=100';
const API_URL_PACKAGES = 'https://api.pledgestores.com/api/v1/packages/active';
// دالة للهروب من الأحرف الخاصة في XML
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// دالة لجلب JSON من API
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const req = protocol.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
  });
}

// دالة لتوليد XML
function generateSitemap(products, packages) {
  const currentDate = new Date().toISOString().split('T')[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // الصفحات الثابتة
  const staticPages = ['', '/shop', '/packages', '/about', '/track-order', '/privacy-policy', '/terms-of-service', '/faq'];
  staticPages.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(BASE_URL + url)}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
  });

  // صفحات المنتجات
  products.forEach(p => {
    if (p._id && p.name) {
      const name = p.name.en || p.name.ar || p.name;
      const slug = encodeURIComponent(name);
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(`${BASE_URL}/shop/${p._id}/${slug}`)}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }
  });

  // صفحات الحزم
  packages.forEach(p => {
    if (p._id && p.name) {
      const name = p.name.en || p.name.ar || p.name;
      const slug = encodeURIComponent(name);
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(`${BASE_URL}/packages/${p._id}`)}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }
  });

  xml += '</urlset>';
  return xml;
}

// تنفيذ العملية
(async () => {
  try {
    const response = await fetchJson(API_URL);
    const responsePackages = await fetchJson(API_URL_PACKAGES);
    const products = response.data?.products || [];
    const packages = responsePackages.data || [];
    const sitemapXml = generateSitemap(products, packages);
    writeFileSync('sitemap.xml', sitemapXml, 'utf-8');
  } catch (error) {
  }
})();
