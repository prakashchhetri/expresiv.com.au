import { load } from 'cheerio';

interface StudioPost {
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  _embedded?: { 'wp:featuredmedia'?: { source_url: string; alt_text?: string }[] };
}

export function plainText(html: string) {
  return load(html).text().trim();
}

export async function getBlogPosts(slug?: string): Promise<StudioPost[]> {
  const url = new URL('https://blog.expresiv.com.au/wp-json/wp/v2/posts');
  url.searchParams.set('_embed', '1');
  if (slug) url.searchParams.set('slug', slug);
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('The journal feed is unavailable.');
  return response.json();
}
