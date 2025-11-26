// server.js
import 'zone.js/node';
import express from 'express';
import compression from 'compression';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { APP_BASE_HREF } from '@angular/common';
import { renderApplication } from '@angular/platform-server';
import * as https from 'node:https';
import * as http from 'node:http';
import { URL } from 'node:url';

import bootstrap from './main.server';

const distFolder = join(process.cwd(), 'dist/pledge-website/browser');
const indexFile = existsSync(join(distFolder, 'index.original.html'))
  ? 'index.original.html'
  : 'index.html';
const indexHtml = readFileSync(join(distFolder, indexFile), 'utf8');

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper function to generate sitemap XML
function generateSitemap(products: any[], baseUrl: string): string {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/shop', priority: '0.9', changefreq: 'daily' },
    { url: '/packages', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
  ];
  
  staticPages.forEach(page => {
    const pageUrl = `${baseUrl}${page.url}`;
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(pageUrl)}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Add product pages
  products.forEach(product => {
    if (product._id && product.name) {
      // Use product.name.en if available, otherwise use the first available name
      const productName = product.name.en || product.name.ar || (typeof product.name === 'string' ? product.name : '');
      if (productName) {
        // Use encodeURIComponent to match the URL format: /shop/{id}/{encoded-name}
        // This handles spaces and special characters: "Ajran Group" -> "Ajran%20Group"
        const slug = encodeURIComponent(productName);
        const productUrl = `${baseUrl}/shop/${product._id}/${slug}`;
        
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(productUrl)}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      }
    }
  });
  
  xml += '</urlset>';
  return xml;
}

function run(): void {
  const port = Number(process.env['PORT'] || 4000);
  const app = express();

  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(distFolder, { index: false, maxAge: '1y' }));

  // Sitemap route - must be before the catch-all route
  app.get('/sitemap.xml', async (req, res) => {
    try {
      // Get API URL from environment or use default
      const apiUrl = process.env['API_URL'] || process.env['NX_API_URL'] || 'https://api.pledgestores.com/api/v1';
      // Get base URL from request or environment
      const baseUrl = process.env['BASE_URL'] || process.env['NX_BASE_URL'] || 
        `${req.protocol}://${req.get('host')}`;
      
      // Helper function to make HTTP request with timeout
      const makeRequest = (url: string, timeout: number = 10000): Promise<any> => {
        return new Promise((resolve, reject) => {
          try {
            const urlObj = new URL(url);
            const protocol = urlObj.protocol === 'https:' ? https : http;
            
            const options = {
              hostname: urlObj.hostname,
              port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
              path: urlObj.pathname + urlObj.search,
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Pledge-Website-Sitemap-Generator/1.0',
              },
              timeout: timeout,
            };
            
            const httpRequest = protocol.request(options, (httpResponse) => {
              let data = '';
              
              // Handle non-2xx status codes
              if (httpResponse.statusCode && (httpResponse.statusCode < 200 || httpResponse.statusCode >= 300)) {
                reject(new Error(`HTTP ${httpResponse.statusCode}: ${httpResponse.statusMessage || 'Unknown error'}`));
                return;
              }
              
              httpResponse.on('data', (chunk) => {
                data += chunk;
              });
              
              httpResponse.on('end', () => {
                try {
                  if (!data) {
                    reject(new Error('Empty response from API'));
                    return;
                  }
                  const jsonData = JSON.parse(data);
                  resolve(jsonData);
                } catch (parseError: any) {
                  reject(new Error(`Failed to parse response: ${parseError.message}`));
                }
              });
            });
            
            httpRequest.on('error', (error) => {
              reject(error);
            });
            
            httpRequest.on('timeout', () => {
              httpRequest.destroy();
              reject(new Error(`Request timeout after ${timeout}ms`));
            });
            
            httpRequest.end();
          } catch (urlError: any) {
            reject(new Error(`Invalid URL: ${urlError.message}`));
          }
        });
      };
      
      // Fetch all products from API
      let allProducts: any[] = [];
      let page = 1;
      let hasMore = true;
      const limit = 100; // Fetch 100 products per page
      let fetchErrors: string[] = [];
      
      while (hasMore) {
        try {
          const productsUrl = `${apiUrl}/products?page=${page}&limit=${limit}`;
          console.log(`Sitemap: Fetching page ${page} from ${productsUrl}`);
          
          const data = await makeRequest(productsUrl, 15000); // 15 second timeout
          
          if (data && data.success && data.data && data.data.products && Array.isArray(data.data.products)) {
            // Filter only active products for sitemap
            const activeProducts = data.data.products.filter((product: any) => 
              product && product._id && product.name && 
              (product.status === 'active' || product.status === 'ACTIVE')
            );
            allProducts = allProducts.concat(activeProducts);
            
            // Check if there are more pages
            const pagination = data.data.pagination || {};
            const totalPages = pagination.pages || 1;
            const currentPage = pagination.page || page;
            
            hasMore = currentPage < totalPages && activeProducts.length > 0;
            page++;
            
            // Safety check to prevent infinite loop
            if (page > 1000) {
              console.warn('Sitemap generation: Too many pages, stopping to prevent infinite loop');
              hasMore = false;
            }
          } else {
            console.log(`Sitemap: No more products or invalid response structure`);
            hasMore = false;
          }
        } catch (error: any) {
          const errorMsg = error.message || String(error);
          console.error(`Sitemap: Error fetching page ${page}:`, errorMsg);
          fetchErrors.push(`Page ${page}: ${errorMsg}`);
          
          // If it's the first page and it fails, we should still return a sitemap with static pages
          if (page === 1) {
            console.warn('Sitemap: Failed to fetch products from API, generating sitemap with static pages only');
          }
          
          hasMore = false;
        }
      }
      
      console.log(`Sitemap: Fetched ${allProducts.length} products${fetchErrors.length > 0 ? ` (with ${fetchErrors.length} errors)` : ''}`);
      
      // Generate sitemap XML (even if products fetch failed, return static pages)
      const sitemapXml = generateSitemap(allProducts, baseUrl);
      
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.send(sitemapXml);
    } catch (error: any) {
      console.error('Sitemap generation error:', error);
      // Return minimal sitemap even on error
      try {
        const baseUrl = process.env['BASE_URL'] || process.env['NX_BASE_URL'] || 
          (req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:4000');
        const minimalSitemap = generateSitemap([], baseUrl);
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.send(minimalSitemap);
      } catch (fallbackError: any) {
        console.error('Sitemap fallback error:', fallbackError);
        res.status(500).setHeader('Content-Type', 'application/xml; charset=utf-8').send(
          `<?xml version="1.0" encoding="UTF-8"?><error>${escapeXml(String(error))}</error>`
        );
      }
    }
  });

  app.get('*', async (req, res) => {
    try {
      const html = await renderApplication(bootstrap, {
        url: req.originalUrl,
        document: indexHtml,
        platformProviders: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }]
      });

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('SSR render error:', error);
      res.status(500).send('Internal server error');
    }
  });

  app.listen(port, () => {
    console.log(`Angular SSR server listening on http://localhost:${port}`);
  });
}

run();

export default run;
