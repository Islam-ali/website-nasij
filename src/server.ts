// server.js
import 'zone.js/node';
import express from 'express';
import compression from 'compression';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { APP_BASE_HREF } from '@angular/common';
import { renderApplication } from '@angular/platform-server';

import bootstrap from './main.server';

const distFolder = join(process.cwd(), 'dist/pledge-website/browser');
const indexFile = existsSync(join(distFolder, 'index.original.html'))
  ? 'index.original.html'
  : 'index.html';
const indexHtml = readFileSync(join(distFolder, indexFile), 'utf8');

function run(): void {
  const port = Number(process.env['PORT'] || 4000);
  const app = express();

  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(distFolder, { index: false, maxAge: '1y' }));

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
