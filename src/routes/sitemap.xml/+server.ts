// ABOUTME: Dynamic sitemap.xml — lists static public routes for search engine crawlers.
// ABOUTME: Public share board pages are intentionally excluded (potentially personal/transient).

import { SITE_URL } from '$lib/seo';
import type { RequestHandler } from './$types';

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' }
];

export const GET: RequestHandler = async () => {
  const today = new Date().toISOString().slice(0, 10);

  const urls = STATIC_ROUTES.map(
    ({ path, priority, changefreq }) =>
      `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
};
