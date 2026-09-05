import assert from 'node:assert/strict';
import {readFileSync, existsSync, statSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';
import {load} from 'cheerio';
const root = 'dist/client';
const routes = ['/', '/work', '/services', '/studio', '/contact', '/services/websites', '/services/mobile-apps', '/services/custom-software', '/works/web-networks', '/works/osgx', '/works/beauty-and-nails', '/404'];
const titles = new Set();
let links = 0, images = 0;
const fullSizeAssets = new Set();
const measurements = [];
for (const route of routes) {
 const file = route === '/404' ? join(root,'404.html') : join(root,route,'index.html');
 const html = readFileSync(file,'utf8');
 const $ = load(html);
 assert.equal($('main').length,1,`${route}: one main landmark`);
 assert.equal($('h1').length,1,`${route}: one h1`);
 assert.equal($('html').attr('lang'),'en-AU');
 assert($('title').text().length > 10);
 assert(!titles.has($('title').text()),`${route}: unique title`);
 titles.add($('title').text());
 assert($('meta[name="description"]').attr('content')?.length > 40);
 assert($('link[rel="canonical"]').attr('href')?.startsWith('https://expresiv.com.au/'));
 const ids = new Set();
 $('[id]').each((_,el) => {const id=$(el).attr('id'); assert(!ids.has(id),`${route}: duplicate ${id}`); ids.add(id);});
 $('a[href]').each((_,el) => {
  const href = $(el).attr('href');
  assert($(el).text().trim() || $(el).attr('aria-label') || $(el).find('img[alt]').length, `${route}: link needs a name`);
  if (href.startsWith('#')) assert(ids.has(href.slice(1)),`${route}: missing anchor ${href}`);
  else if (href.startsWith('/')) {
   const path = href.split(/[?#]/)[0];
   assert(existsSync(join(root,path,'index.html')) || existsSync(join(root,path)),`${route}: unresolved local link ${href}`);
  }
  links++;
 });
 $('img').each((_,el) => {
  assert($(el).attr('alt')?.length > 5,`${route}: descriptive alt`);
  assert($(el).attr('width') && $(el).attr('height'),`${route}: reserved image size`);
  assert(existsSync(join(root,$(el).attr('src'))),`${route}: image exists`);
  fullSizeAssets.add($(el).attr('src'));
  images++;
 });
 $('input:not([type="hidden"]),textarea,select').each((_,el) => {
  const id = $(el).attr('id');
  assert($(`label[for="${id}"]`).length,`${route}: field has a label`);
 });
 const styles = $('link[rel="stylesheet"]').map((_,el)=>$(el).attr('href')).get();
 assert(styles.every(src=>src.startsWith('/')),`${route}: no external render-blocking styles`);
 const scripts = $('script[src]').map((_,el)=>$(el).attr('src')).get().filter(src=>src.startsWith('/'));
 const cssGzip = styles.reduce((total,src)=>total+gzipSync(readFileSync(join(root,src))).length,0);
 const jsGzip = scripts.reduce((total,src)=>total+gzipSync(readFileSync(join(root,src))).length,0);
 const inlineJS = $('script:not([src])').map((_,el)=>$(el).text()).get().join('\n');
 assert(!scripts.some(src=>src.includes('ClientRouter') || src.includes('client.C')),`${route}: no React or client router runtime`);
 measurements.push({route,htmlBytes:Buffer.byteLength(html),cssGzipBytes:cssGzip,localJavaScriptGzipBytes:jsGzip+gzipSync(inlineJS).length});
 console.log(`PASS ${route}`);
}
const $contact = load(readFileSync(join(root,'contact/index.html'),'utf8'));
assert.equal($contact('#contact-form').attr('action'),'/api/contact');
assert.equal($contact('#contact-form').attr('method'),'post');
assert.equal($contact('#email').attr('type'),'email');
assert($contact('#form-status[role="status"]').length);
const before=['webnetwork','work2','work3','appnet'].reduce((sum,name)=>sum+statSync(`public/images/${name}.png`).size,0);
const after=[...fullSizeAssets].reduce((sum,path)=>sum+statSync(join(root,path)).size,0);
console.log(`${routes.length} routes, ${links} links and ${images} image references checked.`);
console.log(`Project assets: ${before} → ${after} bytes (${Math.round((1-after/before)*100)}% smaller).`);
console.table(measurements);
writeFileSync('/private/tmp/expresiv-agency-checks.json',JSON.stringify({routes:routes.length,links,images,assetReductionPercent:Math.round((1-after/before)*100),measurements},null,2));
