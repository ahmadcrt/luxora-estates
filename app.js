'use strict';
/* Pure logic (also testable in Node) */
function filterProps(list, f) {
  const q = (f.q || '').trim().toLowerCase();
  let r = list.filter(p => p.mode === f.mode
    && (!f.type || p.type === f.type)
    && (!f.loc || p.loc === f.loc)
    && p.beds >= (f.beds || 0)
    && (f.maxPrice == null || p.price <= f.maxPrice)
    && (!q || [p.name, p.loc, p.type, p.desc, ...p.perks].join(' ').toLowerCase().includes(q)));
  const s = { pa: (a, b) => a.price - b.price, pd: (a, b) => b.price - a.price, size: (a, b) => b.size - a.size,
              feat: (a, b) => (b.feat - a.feat) || (a.id - b.id) }[f.sort || 'feat'];
  return r.sort(s);
}
if (typeof module !== 'undefined') module.exports = { filterProps };

if (typeof document !== 'undefined') (() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const money = (p, mode) => '$' + p.toLocaleString('en-US') + (mode === 'rent' ? '<small> / month</small>' : '');
  const img = (id, alt) => `<img src="${U(id)}" alt="${alt}" loading="lazy" onerror="this.style.opacity=0">`;
  const wa = txt => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(txt)}`;
  const favs = new Set(JSON.parse(localStorage.getItem('luxora-favs') || '[]'));
  const state = { mode: 'sale', sort: 'feat' };
  const ranges = { sale: [500000, 7000000, 250000], rent: [2000, 20000, 1000] };

  // Nav
  const nav = $('#nav'), menu = $('#menu'), burger = $('#burger');
  document.documentElement.style.setProperty('--navh', nav.offsetHeight + 'px');
  addEventListener('scroll', () => nav.classList.toggle('stuck', scrollY > 10), { passive: true });
  burger.onclick = () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
  $$('a', menu).forEach(a => a.onclick = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); });

  // Cards
  function card(p, i) {
    const el = document.createElement('article');
    el.className = 'card'; el.tabIndex = 0; el.style.animationDelay = (i % 6) * 60 + 'ms';
    el.innerHTML = `<div class="ph">${img(p.img[0], p.name + ', ' + p.loc)}<span class="tag">${p.mode === 'rent' ? 'For rent' : 'For sale'}</span>
      <button class="fav ${favs.has(p.id) ? 'on' : ''}" aria-label="Save ${p.name}" aria-pressed="${favs.has(p.id)}">&#9829;</button></div>
      <div class="in"><div class="price">${money(p.price, p.mode)}</div><h3>${p.name}</h3><div class="loc">${p.type} in ${p.loc}</div>
      <div class="facts"><span>${p.beds} beds</span><span>${p.baths} baths</span><span>${p.size} m&sup2;</span></div></div>`;
    el.onclick = e => { if (e.target.closest('.fav')) toggleFav(p.id); else openModal(p); };
    el.onkeydown = e => { if (e.key === 'Enter' && e.target === el) openModal(p); };
    return el;
  }
  function toggleFav(id) {
    favs.has(id) ? favs.delete(id) : favs.add(id);
    try { localStorage.setItem('luxora-favs', JSON.stringify([...favs])); } catch (e) {}
    $$('.card').forEach(c => { const b = $('.fav', c), name = $('h3', c).textContent, p = PROPERTIES.find(x => x.name === name);
      if (p) { b.classList.toggle('on', favs.has(p.id)); b.setAttribute('aria-pressed', favs.has(p.id)); } });
  }
  $('#featGrid').append(...PROPERTIES.filter(p => p.feat).map(card));

  // Search
  [...new Set(PROPERTIES.map(p => p.loc))].sort().forEach(l => $('#loc').add(new Option(l, l)));
  function setRange() { const [mn, mx, st] = ranges[state.mode], r = $('#price'); r.min = mn; r.max = mx; r.step = st; r.value = mx; }
  function render() {
    const r = $('#price'), atMax = +r.value >= +r.max;
    $('#priceOut').textContent = atMax ? 'Any' : '$' + (+r.value).toLocaleString('en-US');
    const list = filterProps(PROPERTIES, { mode: state.mode, q: $('#q').value, type: $('#type').value, loc: $('#loc').value,
      beds: +$('#beds').value, maxPrice: atMax ? null : +r.value, sort: $('#sort').value });
    $('#grid').replaceChildren(...list.map(card));
    $('#count').textContent = `${list.length} ${list.length === 1 ? 'residence' : 'residences'} ${state.mode === 'rent' ? 'to rent' : 'for sale'}`;
    $('#empty').hidden = list.length > 0;
  }
  $$('.tab').forEach(t => t.onclick = () => { $$('.tab').forEach(x => x.classList.toggle('on', x === t)); state.mode = t.dataset.mode; setRange(); render(); $('#listings').scrollIntoView({ behavior: 'smooth' }); });
  $('#search').addEventListener('input', render); $('#sort').onchange = render;
  $('#search').onsubmit = e => { e.preventDefault(); $('#listings').scrollIntoView({ behavior: 'smooth' }); };
  $('#reset').onclick = () => { $('#search').reset(); $('#sort').value = 'feat'; setRange(); render(); };

  // Modal
  const modal = $('#modal');
  function openModal(p) {
    const msg = `Hello Luxora, I would like to know more about ${p.name} (${p.loc}).`;
    modal.innerHTML = `<button class="x" aria-label="Close">&times;</button><div class="m"><div class="pics"><div id="mainPic">${img(p.img[0], p.name)}</div>
      <div class="thumbs">${p.img.map((id, i) => `<button class="${i ? '' : 'on'}" data-i="${i}" aria-label="Photo ${i + 1}">${img(id, '')}</button>`).join('')}</div></div>
      <div class="txt"><div class="price">${money(p.price, p.mode)}</div><h3>${p.name}</h3><div class="loc">${p.type} in ${p.loc} &middot; ${p.beds} beds &middot; ${p.baths} baths &middot; ${p.size} m&sup2;</div>
      <p>${p.desc}</p><ul>${p.perks.map(x => `<li>${x}</li>`).join('')}</ul>
      <div class="btns"><a class="btn wa" target="_blank" rel="noopener" href="${wa(msg)}">Ask on WhatsApp</a><a class="btn" href="#contact" data-close>Request viewing</a></div>
      <p style="font-size:.8rem">Demo listing. Not a real property.</p></div></div>`;
    $('.x', modal).onclick = () => modal.close();
    $$('.thumbs button', modal).forEach(b => b.onclick = () => { $$('.thumbs button', modal).forEach(x => x.classList.toggle('on', x === b)); $('#mainPic', modal).innerHTML = img(p.img[b.dataset.i], p.name); });
    $('[data-close]', modal).onclick = () => { modal.close(); $('textarea[name=msg]').value = `I would like to arrange a viewing of ${p.name}.`; };
    modal.showModal();
  }
  modal.onclick = e => { if (e.target === modal) modal.close(); };

  // Gallery + lightbox
  const lb = $('#lightbox');
  $('#gal').append(...GALLERY.map((id, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Enlarge image ' + (i + 1)); b.innerHTML = img(id, 'Portfolio image ' + (i + 1));
    b.onclick = () => { $('img', lb).src = U(id).replace('w=1200', 'w=1800'); lb.showModal(); }; return b; }));
  lb.onclick = () => lb.close();

  // Form validation
  const form = $('#form'), rules = {
    name: v => v.trim().length >= 2 || 'Enter your full name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter a valid email, like name@example.com.',
    phone: v => !v.trim() || /^\+?[\d\s()-]{7,18}$/.test(v) || 'Use digits only, 7 to 15 numbers.',
    msg: v => v.trim().length >= 10 || 'Write at least 10 characters so we can help.' };
  const check = f => { const r = rules[f.name](f.value), ok = r === true; f.classList.toggle('bad', !ok); f.nextElementSibling.textContent = ok ? '' : r; return ok; };
  $$('input,textarea', form).forEach(f => f.addEventListener('blur', () => check(f)));
  form.onsubmit = e => { e.preventDefault(); const fields = $$('input,textarea', form), ok = fields.map(check).every(Boolean);
    if (!ok) return fields.find(f => f.classList.contains('bad')).focus();
    form.reset(); $('#ok').hidden = false; setTimeout(() => $('#ok').hidden = true, 7000); };

  // WhatsApp links, year, stat counters
  const hi = wa('Hello Luxora, I am interested in your residences.');
  ['waFab', 'waContact', 'waFoot'].forEach(id => $('#' + id).href = hi);
  $('#yr').textContent = new Date().getFullYear();
  const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target);
    const n = +e.target.dataset.n; let t0; const step = t => { t0 ??= t; const k = Math.min((t - t0) / 1200, 1); e.target.textContent = Math.round(n * k); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }));
  $$('[data-n]').forEach(n => io.observe(n));

  setRange(); render();
})();
