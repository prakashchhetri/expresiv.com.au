// Motion layer. Every effect is progressive: the page reads fully with none of it.
import Lenis from 'lenis';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ---------- Preloader: counts up, then lifts like a curtain ----------
function preload() {
 const loader = document.querySelector<HTMLElement>('.loader');
 if (!loader) return Promise.resolve();
 if (reduced || sessionStorage.getItem('expresiv:loaded')) { loader.remove(); document.body.classList.remove('loading'); return Promise.resolve(); }
 const count = loader.querySelector<HTMLElement>('.loader-count');
 const bar = loader.querySelector<HTMLElement>('.loader-bar');
 const start = performance.now();
 const duration = 1500;
 return new Promise<void>(resolve => {
  const tick = (now: number) => {
   const t = Math.min(1, (now - start) / duration);
   const eased = 1 - Math.pow(1 - t, 3);
   const n = Math.round(eased * 100);
   if (count) count.textContent = String(n).padStart(3, '0');
   bar?.style.setProperty('--p', String(eased));
   if (t < 1) requestAnimationFrame(tick);
   else {
    loader.classList.add('done');
    document.body.classList.remove('loading');
    sessionStorage.setItem('expresiv:loaded', '1');
    setTimeout(() => loader.remove(), 1200);
    resolve();
   }
  };
  requestAnimationFrame(tick);
 });
}

// ---------- Smooth scroll ----------
let lenis: Lenis | undefined;
function smooth() {
 if (reduced || !fine) return;
 lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true });
 const raf = (time: number) => { lenis?.raf(time); requestAnimationFrame(raf); };
 requestAnimationFrame(raf);
 document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const target = document.querySelector<HTMLElement>(a.getAttribute('href') || '');
  if (!target) return;
  e.preventDefault(); lenis?.scrollTo(target, { offset: -80 });
 }));
}

// ---------- Split text into masked words ----------
function split() {
 document.querySelectorAll<HTMLElement>('[data-split]').forEach(el => {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = '1';
  const walk = (node: Node) => {
   if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    if (!text.trim()) return;
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach(part => {
     if (!part) return;
     if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
     const w = document.createElement('span'); w.className = 'w';
     const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = part;
     w.appendChild(wi); frag.appendChild(w);
    });
    node.parentNode?.replaceChild(frag, node);
   } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).dataset.word !== undefined) {
    // Keep a marked element together as a single masked word.
    const w = document.createElement('span'); w.className = 'w';
    const wi = document.createElement('span'); wi.className = 'wi';
    node.parentNode?.replaceChild(w, node); wi.appendChild(node); w.appendChild(wi);
   } else if (node.nodeType === Node.ELEMENT_NODE && !(node as Element).classList.contains('w')) {
    [...node.childNodes].forEach(walk);
   }
  };
  [...el.childNodes].forEach(walk);
  el.querySelectorAll<HTMLElement>('.wi').forEach((wi, i) => { wi.style.transitionDelay = `${Math.min(i * 40, 900)}ms`; });
 });
}

// ---------- Reveal on view ----------
function reveal() {
 const targets = document.querySelectorAll<HTMLElement>('[data-split],[data-reveal],[data-line]');
 if (reduced || !('IntersectionObserver' in window)) { targets.forEach(t => t.classList.add('in')); return; }
 const io = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
 }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
 targets.forEach(t => io.observe(t));
 document.querySelectorAll<HTMLElement>('.stagger').forEach(group => [...group.children].forEach((child, i) => (child as HTMLElement).style.setProperty('--i', String(i))));
}

// ---------- Cursor ----------
function cursor() {
 const el = document.querySelector<HTMLElement>('.cursor');
 if (!el || !fine || reduced) return;
 const label = el.querySelector<HTMLElement>('.cursor-label');
 let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
 addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
 const loop = () => { x += (tx - x) * 0.18; y += (ty - y) * 0.18; el.style.transform = `translate(${x}px,${y}px)`; requestAnimationFrame(loop); };
 requestAnimationFrame(loop);
 document.addEventListener('mouseover', e => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('a,button,[data-cursor]');
  const text = t?.dataset.cursor;
  el.classList.toggle('is-label', !!text);
  el.classList.toggle('is-link', !!t && !text);
  if (label && text) label.textContent = text;
 });
}

// ---------- Magnetic buttons & ripple origin ----------
function magnets() {
 if (!fine || reduced) return;
 document.querySelectorAll<HTMLElement>('.pill,.header-cta,[data-magnet]').forEach(el => {
  const strength = 0.35;
  el.addEventListener('mousemove', e => {
   const r = el.getBoundingClientRect();
   const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
   el.style.transform = `translate(${dx * strength}px,${dy * strength}px)`;
   el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
   el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
  el.addEventListener('mouseleave', () => { el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; setTimeout(() => (el.style.transition = ''), 600); });
 });
}

// ---------- Parallax on plates ----------
function parallax() {
 if (reduced) return;
 const items = document.querySelectorAll<HTMLElement>('[data-parallax]');
 if (!items.length) return;
 const update = () => {
  const vh = innerHeight;
  items.forEach(el => {
   const r = el.getBoundingClientRect();
   const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 across the viewport
   const amt = parseFloat(el.dataset.parallax || '40');
   el.style.transform = `translateY(${(-p * amt).toFixed(1)}px)`;
  });
 };
 addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
}

// ---------- Local time in the header ----------
function clock() {
 const els = document.querySelectorAll<HTMLElement>('[data-clock]');
 if (!els.length) return;
 const fmt = new Intl.DateTimeFormat('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Australia/Sydney' });
 const tick = () => els.forEach(el => (el.textContent = fmt.format(new Date())));
 tick(); setInterval(tick, 15000);
}

// ---------- Menu, filters ----------
function menu() {
 const m = document.querySelector<HTMLDetailsElement>('.mobile-nav');
 m?.addEventListener('keydown', e => { if (e.key === 'Escape') { m.open = false; m.querySelector('summary')?.focus(); } });
 m?.addEventListener('toggle', () => { document.body.classList.toggle('menu-open', m.open); if (m.open) lenis?.stop(); else lenis?.start(); });
 document.addEventListener('click', e => { if (m?.open && !m.contains(e.target as Node)) m.open = false; });
}
function filters() {
 const buttons = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
 const cards = document.querySelectorAll<HTMLElement>('[data-category]');
 buttons.forEach(button => button.addEventListener('click', () => {
  buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  let count = 0;
  cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden) count++; });
  const status = document.querySelector('[data-filter-status]');
  if (status) status.textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown`;
 }));
 document.querySelector<HTMLElement>('.work-filters')?.removeAttribute('hidden');
}

split();
preload().then(() => { reveal(); });
smooth(); cursor(); magnets(); parallax(); clock(); menu(); filters();
