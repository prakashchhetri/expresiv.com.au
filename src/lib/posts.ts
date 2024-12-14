import { getCollection } from 'astro:content';

export async function getBlogPosts() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://blog.expresiv.com.au/wp-json/wp/v2/posts', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    return posts;
  } catch (error) {
    console.warn('Failed to fetch blog posts:', error);
    return [];
  }
} 