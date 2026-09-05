// Progressive motion: content is visible by default, with no scroll hijacking.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reduced.matches && 'IntersectionObserver' in window) {
 const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
   entry.target.classList.add('in-view');
   observer.unobserve(entry.target);
  }
 }, {threshold:0.08});
 document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}
const menu = document.querySelector<HTMLDetailsElement>('.mobile-nav');
menu?.addEventListener('keydown', event => {
 if (event.key === 'Escape') {menu.open = false; menu.querySelector('summary')?.focus();}
});
document.addEventListener('click', event => {
 if (menu?.open && !menu.contains(event.target as Node)) menu.open = false;
});
const filterButtons = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
const cards = document.querySelectorAll<HTMLElement>('[data-category]');
filterButtons.forEach(button => button.addEventListener('click', () => {
 filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
 const grid = document.querySelector<HTMLElement>('.projects');
 if (grid) grid.dataset.filtered = String(button.dataset.filter !== 'all');
 let count = 0;
 cards.forEach(card => {
  card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
  if (!card.hidden) count++;
 });
 const status = document.querySelector('[data-filter-status]');
 if (status) status.textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown`;
}));
// Filters are enhanced only after their handlers exist; the portfolio works without JS.
document.querySelector<HTMLElement>('.work-filters')?.removeAttribute('hidden');
