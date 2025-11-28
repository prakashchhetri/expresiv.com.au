import type { APIRoute } from 'astro';
import { config } from '../lib/api-config.ts';

export const GET: APIRoute = async () => {
  const site = 'https://expresiv.com.au';
  
  // Static pages
  const staticPages = [
    '',
    '/competitor-analysis',
    '/seo-audit',
    '/contact',
    '/services',
    '/work',
    '/testimonials',
    '/blog',
  ];

  // Fetch dynamic competitor analysis pages from Django API
  let dynamicPages: any[] = [];
  try {
    const response = await fetch(config.endpoints.competitorAnalysisPages);
    const data = await response.json();
    
    if (data.pages) {
      dynamicPages = data.pages.map((page: any) => ({
        url: `/competitor-analysis/${page.slug}/`,
        lastmod: page.created_at,
        changefreq: 'weekly',
        priority: 0.8
      }));
    }
  } catch (error) {
    console.error('Error fetching competitor analysis pages for sitemap:', error);
  }

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${site}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${dynamicPages.map(page => `
  <url>
    <loc>${site}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};
