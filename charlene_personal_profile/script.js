/* Charlene Joy — one-page site */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Theme (remembered) ---------- */
function setTheme(t) {
  const dark = t === 'dark';
  document.body.classList.toggle('dark', dark);
  $('#themeIcon').textContent = dark ? '☀' : '☾';
  $('#themeLabel').textContent = dark ? 'Light mode' : 'Dark mode';
  $('#themeToggle').setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  try { localStorage.setItem('cj-theme', t); } catch (e) {}
}
let saved = 'light';
try { saved = localStorage.getItem('cj-theme') || 'light'; } catch (e) {}
setTheme(saved);
$('#themeToggle').addEventListener('click', () => setTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));

/* ---------- Mobile sidebar ---------- */
const sidebar = $('#sidebar'), scrim = $('#scrim'), menuBtn = $('#menuToggle');
function toggleMenu(open) {
  sidebar.classList.toggle('open', open);
  scrim.classList.toggle('show', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? '✕' : '☰';
}
menuBtn.addEventListener('click', () => toggleMenu(!sidebar.classList.contains('open')));
scrim.addEventListener('click', () => toggleMenu(false));
$$('#sideNav a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

/* ---------- Photo placeholders ---------- */
function markPlaceholder(img) {
  const p = img.parentElement;
  p.classList.add('is-ph');
  if (!p.querySelector('.ph-hint')) {
    const s = document.createElement('span');
    s.className = 'ph-hint';
    s.innerHTML = `${img.dataset.ph || 'ADD PHOTO'}<small>${img.getAttribute('src')}</small>`;
    p.appendChild(s);
  }
}
$$('img[data-ph]').forEach(img => {
  img.addEventListener('error', () => markPlaceholder(img));
  if (img.complete && img.naturalWidth === 0) markPlaceholder(img);
});

/* ---------- Typed roles ---------- */
const roles = ['an IT student.', 'a club governor.', 'a sports writer.', 'a K-pop page manager.', 'a dancer.', 'a sunset chaser.'];
const typed = $('#typed');
if (reduceMotion) { typed.textContent = roles[0]; }
else {
  let r = 0, c = 0, del = false;
  (function tick() {
    const word = roles[r];
    typed.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
    if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 35 : 75);
  })();
}

/* ---------- Count-up stats ---------- */
$$('[data-count]').forEach(el => {
  const end = +el.dataset.count;
  if (reduceMotion) { el.textContent = end; return; }
  let n = 0;
  const step = Math.max(1, Math.round(end / 30));
  const t = setInterval(() => { n = Math.min(end, n + step); el.textContent = n; if (n >= end) clearInterval(t); }, 45);
});

/* ---------- Age ---------- */
(function () {
  const b = new Date(2006, 2, 20), now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now < new Date(now.getFullYear(), 2, 20)) a--;
  $('#age').textContent = a + ' years old';
})();

/* ---------- Reveal + active nav + progress ---------- */
const reveals = $$('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
  reveals.forEach(r => io.observe(r));
} else reveals.forEach(r => r.classList.add('in'));

const sections = $$('main section[id]');
const navLinks = $$('#sideNav a');
function onScroll() {
  const h = document.documentElement;
  $('#progress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  let cur = sections[0].id;
  sections.forEach(s => { if (s.getBoundingClientRect().top < window.innerHeight * .4) cur = s.id; });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Tabs ---------- */
$$('.tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.tab').forEach(t => t.classList.toggle('active', t === tab));
  $$('.panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab.dataset.tab));
}));

/* ---------- K-drama mood filter ---------- */
$$('#dramaFilters .chip-btn').forEach(btn => btn.addEventListener('click', () => {
  $$('#dramaFilters .chip-btn').forEach(b => b.classList.toggle('active', b === btn));
  $$('#dramaGrid .drama').forEach(d => d.classList.toggle('hide', btn.dataset.f !== 'all' && d.dataset.m !== btn.dataset.f));
}));

/* ---------- Quiz ---------- */
const quiz = [
  { q: "What's my go-to coffee order?", o: ['Iced americano', 'Spanish latte', 'Caramel macchiato'], a: 1 },
  { q: 'Which K-pop Facebook page did I manage?', o: ['Stayology', 'K-Pop Daily', 'Hallyu Hub'], a: 0 },
  { q: 'Which country is first on my travel wishlist?', o: ['Italy', 'Thailand', 'South Korea'], a: 2 }
];
let qi = 0, score = 0;
const box = $('#quiz-box');
function celebrate() {
  if (reduceMotion) return;
  const colors = ['#FF7A59', '#CDEB6E', '#8EDCF0', '#BBA4FF', '#FFD86B', '#FF9EBB'];
  for (let i = 0; i < 44; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
    piece.style.animationDelay = `${Math.random() * .35}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2300);
  }
}
function renderQ() {
  if (qi >= quiz.length) {
    const msg = score === 3 ? "Perfect! You really know me. 🎉" : score === 2 ? 'So close! Nice job. ✨' : 'Now you know me a little better! ♡';
    box.innerHTML = `<div class="q-result"><div class="score">${score}/${quiz.length}</div><h3>${msg}</h3><button class="btn btn-primary" id="qAgain">Play again</button></div>`;
    if (score === 3) celebrate();
    $('#qAgain').onclick = () => { qi = 0; score = 0; renderQ(); };
    return;
  }
  const item = quiz[qi];
  box.innerHTML = `<div class="q-top"><span>QUESTION ${qi + 1} OF ${quiz.length}</span><span>SCORE ${score}</span></div>
    <div class="q-bar"><i style="width:${qi / quiz.length * 100}%"></i></div>
    <h3>${item.q}</h3><div class="opts">${item.o.map((t, i) => `<button class="opt" data-i="${i}">${t}</button>`).join('')}</div><div class="q-fb" aria-live="polite"></div>`;
  $$('.opt', box).forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.i;
    $$('.opt', box).forEach(x => x.disabled = true);
    $$('.opt', box)[item.a].classList.add('right');
    if (i === item.a) { score++; $('.q-fb', box).textContent = 'Correct! ✓'; }
    else { b.classList.add('wrong'); $('.q-fb', box).textContent = 'Not quite, but good try!'; }
    setTimeout(() => { qi++; renderQ(); }, 1100);
  }));
}
renderQ();

/* ---------- Lightbox ---------- */
const lb = $('#lightbox');
$$('.g').forEach(g => g.addEventListener('click', () => {
  if (g.classList.contains('is-ph') || g.classList.contains('memory-card')) return;
  const img = $('img', g);
  $('#lbImg').src = img.src; $('#lbImg').alt = img.alt;
  $('#lbCap').textContent = $('figcaption', g)?.textContent || '';
  lb.hidden = false;
}));
const closeLb = () => lb.hidden = true;
$('#lbClose').addEventListener('click', closeLb);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

const latteEgg = $('#latteEgg');
if (latteEgg) latteEgg.addEventListener('click', () => {
  const message = $('#latteMessage');
  message.hidden = !message.hidden;
  latteEgg.setAttribute('aria-expanded', String(!message.hidden));
});


/* ---------- Pick a Mood, Find My World ---------- */
const moodContent = {
  peace: { icon: '🌿', tag: 'MY RESET BUTTON', title: 'A little peace', text: 'Mountains, the sea, and sunsets help me slow down and notice the little things. Sometimes a quiet view is all the reset I need.', link: '#tab-nature', linkText: 'Explore my nature corner ↗' },
  comfort: { icon: '☕', tag: 'COMFORT CORNER', title: 'Coffee + a comfort story', text: 'A Spanish latte and a good K-drama make an ordinary day feel softer. My current watch is Doctor X.', link: '#tab-coffee', linkText: 'Visit my coffee corner ↗' },
  energy: { icon: '🎧', tag: 'TURN THE ENERGY UP', title: 'Music that moves me', text: 'K-pop and dance bring out my energetic side. Music can be a fun escape and a reason to get up and move.', link: '#tab-kpop', linkText: 'Explore my K-pop corner ↗' },
  inspiration: { icon: '🌅', tag: 'STILL BECOMING', title: 'A view, then a dream', text: 'Sunsets remind me that there is always something beautiful ahead. I want to keep learning Python and building useful projects.', link: '#tab-nature', linkText: 'Find my little peace ↗' }
};
$$('.mood-choice').forEach(btn => btn.addEventListener('click', () => {
  $$('.mood-choice').forEach(b => { const active = b === btn; b.classList.toggle('selected', active); b.setAttribute('aria-pressed', String(active)); });
  const item = moodContent[btn.dataset.mood];
  $('#moodResultIcon').textContent = item.icon; $('#moodResultTag').textContent = item.tag;
  $('#moodResultTitle').textContent = item.title; $('#moodResultText').textContent = item.text;
  $('#moodResultLink').href = item.link; $('#moodResultLink').textContent = item.linkText;
  $('#moodResult').hidden = false;
}));
$('#moodResultLink').addEventListener('click', event => {
  const href = event.currentTarget.getAttribute('href');
  const tabMap = { '#tab-kpop': 'kpop', '#tab-coffee': 'coffee', '#tab-nature': 'nature' };
  if (tabMap[href]) {
    event.preventDefault();
    const tab = document.querySelector(`.tab[data-tab="${tabMap[href]}"]`);
    if (tab) tab.click();
    const target = document.querySelector(href);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
  } else if (href) {
    event.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* ---------- Simulated charlene.exe command console ---------- */
const commandContent = {
  about: 'about → Quick snapshot: an IT student from Alegria, Cebu, with a soft spot for stories, music, and quiet views.',
  projects: 'projects → This website, Grab N Kaon, an accounting ledger, and beginner coding exercises. Each one teaches me something different.',
  dreams: 'dreams → I want to go deeper into Python, build useful projects, and keep exploring places beyond my comfort zone.',
  funfact: 'funfact → Give me a Spanish latte, a sunset view, or a K-pop performance and I’m probably happy.'
};
$$('.command-btn').forEach(btn => btn.addEventListener('click', () => {
  $$('.command-btn').forEach(b => { const active = b === btn; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
  $('#commandOutput').textContent = commandContent[btn.dataset.command] || 'Command not found.';
}));

/* ---------- Behind the Build: expand project details ---------- */
$$('.detail-toggle').forEach(btn => btn.addEventListener('click', () => {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  const opening = panel.hidden;
  panel.hidden = !opening; btn.setAttribute('aria-expanded', String(opening));
  btn.textContent = opening ? 'Close details −' : 'Behind the build +';
}));

/* ---------- Tap a Memory: short stories in an accessible modal ---------- */
const memoryStories = {
  people: { title: 'My people, my heart', what: 'A moment with the people who make life feel grounded.', why: 'This was the first family portrait we took in a studio. It holds a special place in my heart because the people in this photo are an important part of my story, even when life gets busy.', meaning: 'Success feels better when I can share the journey with people who matter to me.' },
  little: { title: 'The little moments', what: 'A small moment worth saving instead of letting it pass unnoticed.', why: 'A family trip to Cebu Safari with the Divinagracia family. It reminds me that not every meaningful memory has to come from a big event.', meaning: 'Ordinary days can hold the details I will be happy to remember.' },
  grateful: { title: 'Always grateful', what: 'A reminder to pause and appreciate where I am and the people around me.', why: 'This photo captures a moment with my college friends. Having them as part of my college journey gives me more reasons to appreciate the experiences and memories we share.', meaning: 'Growth and gratitude can exist together.' },
  coffee: { title: 'K-drama & coffee nights', what: 'A cozy combination: a show to follow and a Spanish latte to enjoy.', why: 'It gives me a small way to unwind and enjoy my own company.', meaning: 'Rest can be simple; sometimes a familiar comfort is enough.' },
  fanmeet: { title: 'AHOF fanmeet day', what: 'A memory connected to music and the excitement of being a fan.', why: 'This was my first time attending a fan meet and seeing my K-pop idols in person. It was a special experience that made my love for music and K-pop even more memorable.', meaning: 'The things we love can connect us to memorable experiences.' },
  nature: { title: 'Embracing nature', what: 'A moment to enjoy being outdoors and take in the view.', why: 'Mountains, the sea, and sunsets help me slow down and feel present.', meaning: 'Sometimes the best reset is stepping back and noticing the world around me.' }
};
const memoryModal = $('#memoryModal');
function openMemory(card) {
  const item = memoryStories[card.dataset.memory]; if (!item) return;
  $('#memoryTitle').textContent = item.title; $('#memoryWhat').textContent = item.what;
  $('#memoryWhy').textContent = item.why; $('#memoryMeaning').textContent = item.meaning;
  memoryModal.hidden = false; $('#memoryClose').focus();
}
$$('.memory-card').forEach(card => {
  card.addEventListener('click', () => { if (!card.classList.contains('is-ph')) openMemory(card); });
  card.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !card.classList.contains('is-ph')) { e.preventDefault(); openMemory(card); } });
});
function closeMemory() { memoryModal.hidden = true; }
$('#memoryClose').addEventListener('click', closeMemory); $('#memoryDone').addEventListener('click', closeMemory);
memoryModal.addEventListener('click', e => { if (e.target === memoryModal) closeMemory(); });

/* ---------- Leave a Little Note: temporary local interaction only ---------- */
$$('.note-choice').forEach(btn => btn.addEventListener('click', () => {
  $$('.note-choice').forEach(b => { const active = b === btn; b.classList.toggle('selected', active); b.setAttribute('aria-pressed', String(active)); });
  const response = $('#noteResponse'); response.textContent = btn.dataset.note; response.hidden = false;
}));

$('#year').textContent = new Date().getFullYear();
