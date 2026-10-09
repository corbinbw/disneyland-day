/* Line games: trivia, Heads Up, emoji guess, would you rather. Content lives in games-data.js. */
(function(){
  'use strict';
  var view = document.getElementById('view-games'), app = document.getElementById('app'), D = window.GAMES;
  window.DLGames = { leave: function(){} };
  if (!view || !D) return;

  var $ = function(s){ return view.querySelector(s); };
  var $$ = function(s){ return Array.prototype.slice.call(view.querySelectorAll(s)); };
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function shuffle(a){ a = a.slice(); for (var i=a.length-1;i>0;i--){ var j = Math.floor(Math.random()*(i+1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
  // Endless shuffled pile: nothing repeats until every item has come up once
  function deck(items){
    var pile = [], last = null;
    return {
      size: items.length,
      next: function(){
        if (!pile.length){ pile = shuffle(items); if (pile.length > 1 && pile[pile.length-1] === last) pile.unshift(pile.pop()); }
        return (last = pile.pop());
      },
      pos: function(){ return items.length - pile.length; }
    };
  }
  // Chrome logs an intervention warning if vibrate runs before the first tap
  function buzz(p){ try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(p); } catch(e){} }

  /* ---------- icons (same 24px line style as app.js) ---------- */
  var ICONS = {
    back:   '<path d="M15 5.5 8.5 12l6.5 6.5"/>',
    chev:   '<path d="m9 5.5 6.5 6.5L9 18.5"/>',
    check:  '<path d="M4.5 12.5l4.8 4.8L19.5 7"/>',
    x:      '<path d="M6 6l12 12M18 6 6 18"/>',
    again:  '<path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5"/><path d="M19.5 4v4.5H15"/>',
    next:   '<path d="M4.5 12h14M12.5 5.5 19 12l-6.5 6.5"/>',
    eye:    '<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    bulb:   '<path d="M9.5 17.5h5M10.5 20.5h3"/><path d="M12 3.5a5.8 5.8 0 0 0-3.4 10.5c.6.5.9 1.1.9 1.9v.1h5v-.1c0-.8.3-1.4.9-1.9A5.8 5.8 0 0 0 12 3.5z"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5v1.5A3.5 3.5 0 0 0 8 11M17 6h2.5v1.5A3.5 3.5 0 0 1 16 11M12 14v4M8 20.5h8"/>',
    play:   '<path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke-width="1.6"/>'
  };
  function ico(name, cls){
    return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }
  function burst(cx, cy, r1, r2, n){
    var d = '';
    for (var i=0;i<n;i++){
      var a = i / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      d += 'M' + (cx + c*r1).toFixed(1) + ' ' + (cy + s*r1).toFixed(1) + 'L' + (cx + c*r2).toFixed(1) + ' ' + (cy + s*r2).toFixed(1);
    }
    return d;
  }
  var FIREWORKS = '<svg class="fw" viewBox="0 0 160 120" width="156" height="117" aria-hidden="true">' +
    '<path stroke="#ffd06b" d="' + burst(108, 44, 9, 30, 16) + '"/>' +
    '<path stroke="#ff6fb0" d="' + burst(52, 26, 5, 17, 12) + '"/>' +
    '<path stroke="#b9a0ff" d="' + burst(140, 92, 4, 14, 10) + '"/></svg>';

  /* ---------- trivia high scores: own key, never touches plan or ride checks ---------- */
  var KEY = 'dlr-games-v1';
  var store = (function(){
    var d = { triviaBest:0, triviaPlays:0, triviaTop:[] };
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (v && typeof v === 'object'){
        if (typeof v.triviaBest === 'number') d.triviaBest = v.triviaBest;
        if (typeof v.triviaPlays === 'number') d.triviaPlays = v.triviaPlays;
        if (Array.isArray(v.triviaTop)) d.triviaTop = v.triviaTop.filter(function(e){ return e && typeof e.s === 'number' && typeof e.t === 'number'; })
          .map(function(e){ return { s:e.s, t:e.t, n: typeof e.n === 'string' ? e.n.slice(0, 16) : '' }; }).slice(0, 5);
      }
    } catch(e){}
    return d;
  })();
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(e){} }

  /* ---------- screens ---------- */
  var shownAt = 0;
  function show(html, cls){
    view.innerHTML = '<div class="g-screen' + (cls ? ' ' + cls : '') + '">' + html + '</div>';
    view.scrollTop = 0;
    shownAt = performance.now();
  }
  function bar(title, right){
    return '<div class="g-bar"><button type="button" class="g-back" data-g="home">' + ico('back') + '<span>Games</span></button>' +
             '<h2 class="g-title">' + esc(title) + '</h2>' + (right || '') + '</div>';
  }
  function setLive(on){ app.classList.toggle('g-live', !!on); }

  /* ---------- home ---------- */
  var HEADS_TOTAL = D.heads.characters.length + D.heads.movies.length + D.heads.rides.length;
  function renderHome(){
    var cards = [
      { k:'trivia', ico:'🧠', name:'Disney Trivia', desc:'10 questions a round, easy and hard mixed. Read them out loud!',
        meta: store.triviaPlays ? ico('trophy') + 'Best ' + store.triviaBest + '/10' : D.trivia.length + ' questions' },
      { k:'heads', ico:'🤳', name:'Heads Up!', desc:'Phone on your forehead while everyone gives clues. 60 seconds.', meta: HEADS_TOTAL + ' words' },
      { k:'emoji', ico:'🍿', name:'Emoji Movie Guess', desc:'Name the movie or ride from the emoji. First to shout it wins.', meta: D.emoji.length + ' puzzles' },
      { k:'wyr', ico:'🤔', name:'Would You Rather', desc:'Pick one, then defend your choice.', meta: D.wyr.length + ' questions' }
    ];
    show('<section class="g-hero starfield">' + FIREWORKS +
           '<span class="g-kicker">Line games</span>' +
           '<h2>Pass the phone while you wait</h2>' +
           '<p>4 games · works offline · no sign-up</p>' +
         '</section>' +
         '<div class="g-list">' + cards.map(function(c){
           return '<button type="button" class="g-card gk-' + c.k + '" data-g="open" data-k="' + c.k + '">' +
                    '<span class="g-ico" aria-hidden="true">' + c.ico + '</span>' +
                    '<span class="g-txt"><span class="g-name">' + esc(c.name) + '</span><span class="g-desc">' + esc(c.desc) + '</span>' +
                      '<span class="g-meta">' + c.meta + '</span></span>' +
                    ico('chev', 'chev') +
                  '</button>';
         }).join('') + '</div>' +
         '<p class="g-foot">Hand the phone to whoever is next in line.</p>');
  }
  function open(k){
    if (k === 'trivia') startTrivia();
    else if (k === 'heads') renderHeadsSetup();
    else if (k === 'emoji') nextEmoji();
    else if (k === 'wyr') nextWyr();
  }

  /* ---------- trivia ---------- */
  var tEasy = deck(D.trivia.filter(function(q){ return q.d === 'e'; }));
  var tHard = deck(D.trivia.filter(function(q){ return q.d !== 'e'; }));
  var YES = ['🎉 Correct!', '✨ Nailed it!', '🙌 You got it!', '🎯 Spot on!', '🏆 Yes!'];
  var T = null;
  function take(dk, n){
    var out = [], guard = 0;
    while (out.length < n && guard++ < 50){ var x = dk.next(); if (out.indexOf(x) < 0) out.push(x); }
    return out;
  }
  function startTrivia(){
    var qs = shuffle(take(tEasy, 5).concat(take(tHard, 5))).map(function(q){
      return { q:q.q, d:q.d, opts: shuffle(q.a.map(function(t, i){ return { t:t, ok:i === 0 }; })) };
    });
    T = { qs:qs, i:0, score:0, picked:null, done:false, entry:null, best:false };
    renderTrivia();
  }
  function renderTrivia(){
    if (T.done) return renderTriviaEnd();
    var q = T.qs[T.i], n = T.qs.length;
    show(bar('Trivia', '<span class="g-score">Score ' + T.score + '</span>') +
      '<div class="tq">' +
        '<div class="tq-meta"><span class="tq-num">Question ' + (T.i + 1) + ' of ' + n + '</span>' +
          '<span class="g-diff ' + (q.d === 'e' ? 'easy">Easy' : 'hard">Hard') + '</span></div>' +
        '<div class="bar"><i style="width:' + Math.round((T.i + 1) / n * 100) + '%"></i></div>' +
        '<h3 class="g-q">' + esc(q.q) + '</h3>' +
        '<div class="g-opts">' + q.opts.map(function(o, i){
          return '<button type="button" class="g-opt" data-g="answer" data-i="' + i + '"><span class="lt">' + 'ABCD'.charAt(i) + '</span><span class="ot">' + esc(o.t) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="tq-after" role="status"></div>' +
      '</div>');
  }
  function answer(i){
    if (!T || T.done || T.picked != null) return;
    var q = T.qs[T.i], ok = !!(q.opts[i] && q.opts[i].ok), right = '';
    T.picked = i;
    if (ok) T.score++;
    q.opts.forEach(function(o){ if (o.ok) right = o.t; });
    $$('.g-opt').forEach(function(b, j){
      var good = q.opts[j].ok;
      b.disabled = true;
      b.classList.add(good ? 'right' : (j === i ? 'wrong' : 'dim'));
      if (good || j === i) b.insertAdjacentHTML('beforeend', ico(good ? 'check' : 'x', 'mk'));
    });
    var last = T.i === T.qs.length - 1, after = $('.tq-after'), sc = $('.g-score');
    after.innerHTML = (ok ? '<div class="g-feedback ok">' + pick(YES) + '</div>' : '<div class="g-feedback no">Not quite. It\'s <b>' + esc(right) + '</b>.</div>') +
      '<button type="button" class="btn btn-done g-next" data-g="tnext">' + (last ? 'See your score' : 'Next question') + ico('next') + '</button>';
    if (sc) sc.textContent = 'Score ' + T.score;
    buzz(ok ? 30 : [40, 60, 40]);
    var nb = $('.g-next');
    if (nb) nb.scrollIntoView({ block:'nearest', behavior:'smooth' });
  }
  function nextQuestion(){
    if (!T || T.done || T.picked == null) return;
    if (T.i < T.qs.length - 1){ T.i++; T.picked = null; renderTrivia(); return; }
    T.done = true;
    store.triviaPlays++;
    var entry = { s:T.score, t:Date.now(), n:'' };
    store.triviaTop = store.triviaTop.concat([entry]).sort(function(a, b){ return b.s - a.s || a.t - b.t; }).slice(0, 5);
    T.entry = store.triviaTop.indexOf(entry) >= 0 ? entry : null;
    T.best = T.score > store.triviaBest;
    if (T.best) store.triviaBest = T.score;
    save();
    buzz(T.best ? [60, 40, 60, 40, 120] : 60);
    renderTrivia();
  }
  var VERDICTS = [
    [10, '🏆', 'Perfect score! Walt would be proud.'],
    [8, '🌟', 'Disney legend!'],
    [6, '🎉', 'Big fan energy!'],
    [4, '🎢', 'Not bad at all!'],
    [0, '😄', 'Every Imagineer starts somewhere.']
  ];
  var fmtTime = new Intl.DateTimeFormat('en-US', { timeZone:'America/Los_Angeles', hour:'numeric', minute:'2-digit' });
  var fmtDay = new Intl.DateTimeFormat('en-US', { timeZone:'America/Los_Angeles', month:'short', day:'numeric' });
  function when(t){ var d = new Date(t); return fmtDay.format(d) === fmtDay.format(new Date()) ? fmtTime.format(d) : fmtDay.format(d); }
  function topList(){
    if (!store.triviaTop.length) return '';
    return '<section class="g-top"><h3>' + ico('trophy') + 'Top scores on this phone</h3><ol>' + store.triviaTop.map(function(e, i){
      var me = !!(T && T.entry === e);
      return '<li' + (me ? ' class="me"' : '') + '><span class="rk">' + (i + 1) + '</span>' +
               '<span class="nm">' + (e.n ? esc(e.n) : (me ? 'You' : 'Mystery player')) + '</span>' +
               '<span class="tm">' + when(e.t) + '</span><b>' + e.s + '/10</b></li>';
    }).join('') + '</ol></section>';
  }
  function nameForm(){
    return '<form class="g-name-form" autocomplete="off">' +
             '<label for="gName">You made the top 5! Add your name</label>' +
             '<div class="g-name-row"><input id="gName" type="text" maxlength="16" autocapitalize="words" enterkeyhint="done" placeholder="Your name">' +
               '<button type="submit" class="g-save">Save</button></div>' +
           '</form>';
  }
  function renderTriviaEnd(){
    var v = VERDICTS.filter(function(x){ return T.score >= x[0]; })[0];
    show(bar('Trivia', '') +
      '<section class="g-result starfield">' +
        '<div class="g-res-emoji" aria-hidden="true">' + v[1] + '</div>' +
        '<div class="g-big">' + T.score + '<small>/' + T.qs.length + '</small></div>' +
        '<div class="g-msg">' + esc(v[2]) + '</div>' +
        (T.best ? '<div class="g-badge">' + ico('trophy') + 'New high score!</div>' : '<div class="g-line">Best on this phone: ' + store.triviaBest + '/10. Pass it on and try to beat it!</div>') +
      '</section>' +
      (T.entry && !T.entry.n ? nameForm() : '') +
      '<div class="g-actions">' +
        '<button type="button" class="btn btn-done" data-g="tagain">' + ico('again') + 'Play again</button>' +
      '</div>' +
      topList());
  }
  function saveName(form){
    var input = form.querySelector('input'), name = input.value.replace(/\s+/g, ' ').trim().slice(0, 16);
    if (!name || !T || !T.entry){ input.focus(); return; }
    T.entry.n = name;
    save();
    input.blur();
    form.outerHTML = '<div class="g-saved">' + ico('check') + '<span>Saved. Nice one, ' + esc(name) + '!</span></div>';
    var top = $('.g-top');
    if (top) top.outerHTML = topList();
  }

  /* ---------- heads up ---------- */
  function words(list, label){ return list.map(function(w){ return { w:w, c:label }; }); }
  var HW = { characters: words(D.heads.characters, 'Character'), movies: words(D.heads.movies, 'Movie'), rides: words(D.heads.rides, 'In the parks') };
  var CATS = [
    { k:'mix', name:'Mix it up', words: HW.characters.concat(HW.movies, HW.rides) },
    { k:'characters', name:'Characters', words: HW.characters },
    { k:'movies', name:'Movies', words: HW.movies },
    { k:'rides', name:'In the parks', words: HW.rides }
  ];
  var ROUND_MS = 60000, LOCK_MS = 600;
  var H = { cat:'mix', phase:'setup', score:0, list:[], cur:null, end:0, tick:null, cd:null, lastAct:0, early:false, decks:{}, endArm:0, endT:null };
  function cat(){ for (var i=0;i<CATS.length;i++) if (CATS[i].k === H.cat) return CATS[i]; return CATS[0]; }
  function nextWord(){ var c = cat(); return (H.decks[c.k] || (H.decks[c.k] = deck(c.words))).next(); }
  var lock = null;
  function keepAwake(on){
    try {
      if (on && !lock && navigator.wakeLock){
        navigator.wakeLock.request('screen').then(function(l){ if (H.phase === 'count' || H.phase === 'play') lock = l; else l.release(); }).catch(function(){});
      } else if (!on && lock){ lock.release().catch(function(){}); lock = null; }
    } catch(e){}
  }
  function stopTimers(){
    if (H.cd){ clearInterval(H.cd); H.cd = null; }
    if (H.tick){ clearInterval(H.tick); H.tick = null; }
    if (H.endT){ clearTimeout(H.endT); H.endT = null; }
  }

  /* Tilt: screen face down = got it, face up = skip, measured from where the phone sat when the round began */
  var TILT_GO = 40, TILT_BACK = 20;
  var tilt = { ok:null, asking:false, on:false, live:false, p:null, base:0, armed:false };
  function onTilt(e){
    if (e.beta == null || e.gamma == null) return;
    var r = Math.PI / 180, up = Math.cos(e.beta * r) * Math.cos(e.gamma * r);
    // Angle of the screen above (+) or below (-) the horizon; the same whether the phone is upright or sideways
    tilt.p = Math.asin(Math.max(-1, Math.min(1, up))) / r;
    if (H.phase !== 'play' || !tilt.live) return;
    var d = tilt.p - tilt.base;
    if (!tilt.armed){ tilt.armed = Math.abs(d) < TILT_BACK; return; }
    if (Math.abs(d) >= TILT_GO){ tilt.armed = false; headsAct(d < 0); }
  }
  // iOS only hands out motion data after requestPermission() runs inside a tap, so this is called from Start
  function tiltStart(then){
    var DOE = window.DeviceOrientationEvent;
    if (tilt.asking) return;
    if (!DOE || tilt.ok === false){ then(); return; }
    if (tilt.ok || typeof DOE.requestPermission !== 'function'){ tiltListen(); then(); return; }
    tilt.asking = true;
    var done = function(granted){ tilt.asking = false; tilt.ok = granted; if (granted) tiltListen(); then(); };
    try { DOE.requestPermission().then(function(s){ done(s === 'granted'); }, function(){ done(false); }); }
    catch(err){ done(false); }
  }
  function tiltListen(){ if (!tilt.on){ tilt.on = true; tilt.p = null; window.addEventListener('deviceorientation', onTilt); } }
  function tiltStop(){ if (tilt.on){ tilt.on = false; window.removeEventListener('deviceorientation', onTilt); } tilt.live = false; tilt.p = null; }
  function tiltCalibrate(){
    tilt.live = tilt.on && tilt.p != null;
    if (!tilt.live) return;
    // A phone still lying flat isn't on anyone's forehead yet: assume upright and wait for it to get there
    tilt.base = Math.abs(tilt.p) <= 45 ? tilt.p : 0;
    tilt.armed = Math.abs(tilt.p - tilt.base) < TILT_BACK;
  }
  function renderHeadsSetup(){
    stopTimers();
    H.phase = 'setup';
    show(bar('Heads Up!', '') +
      '<ol class="hu-how">' +
        '<li><span class="n">1</span><span>Hold the phone on your forehead, screen facing out.</span></li>' +
        '<li><span class="n">2</span><span>Everyone else gives clues: act it out, hum it, describe it. Just don\'t say the word!</span></li>' +
        '<li><span class="n">3</span><span><b>Got it:</b> tap the right half of the screen or tilt the phone down. <b>Skip:</b> tap the left half or tilt it up. 60 seconds a round.</span></li>' +
      '</ol>' +
      '<h3 class="g-sub">Pick a deck</h3>' +
      '<div class="hu-cats" role="radiogroup" aria-label="Deck">' + CATS.map(function(c){
        var on = c.k === H.cat;
        return '<button type="button" class="hu-cat' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" data-g="hcat" data-c="' + c.k + '"><b>' + esc(c.name) + '</b><span>' + c.words.length + ' words</span></button>';
      }).join('') + '</div>' +
      '<button type="button" class="btn btn-done hu-go" data-g="hstart">' + ico('play') + 'Start round</button>');
  }
  function pickCat(k){
    H.cat = k;
    $$('.hu-cat').forEach(function(b){ var on = b.dataset.c === k; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
  }
  function startHeads(){
    stopTimers();
    H.phase = 'count'; H.score = 0; H.list = []; H.early = false;
    setLive(true); keepAwake(true);
    var n = 3;
    show('<div class="hu-count starfield">' +
           '<button type="button" class="hu-end" data-g="hquit">' + ico('x') + '<span>Cancel</span></button>' +
           '<p class="hu-c1">Phone on your forehead!</p>' +
           '<b class="hu-n">' + n + '</b>' +
           '<p class="hu-c2">' + esc(cat().name) + ' · 60 seconds</p>' +
         '</div>', 'full');
    H.cd = setInterval(function(){
      n--;
      if (n > 0){ var el = $('.hu-n'); if (el) el.outerHTML = '<b class="hu-n">' + n + '</b>'; buzz(20); return; }
      clearInterval(H.cd); H.cd = null;
      beginRound();
    }, 1000);
  }
  function quitCountdown(){
    stopTimers(); setLive(false); keepAwake(false); tiltStop();
    renderHeadsSetup();
  }
  function beginRound(){
    H.phase = 'play'; H.end = Date.now() + ROUND_MS; H.cur = nextWord(); H.lastAct = 0; H.endArm = 0;
    tiltCalibrate();
    show('<div class="hu-play starfield">' +
           '<div class="hu-half skip"><span class="hu-hint">' + ico('x') + 'Skip</span></div>' +
           '<div class="hu-half got"><span class="hu-hint">' + ico('check') + 'Got it</span></div>' +
           '<div class="hu-hud">' +
             '<div class="hu-top">' +
               '<button type="button" class="hu-end" data-g="hend">' + ico('x') + '<span>End</span></button>' +
               '<span class="hu-time" role="timer" aria-label="Seconds left">60</span>' +
               '<span class="hu-pts"><b>0</b> got</span>' +
             '</div>' +
             '<div class="hu-tbar"><i></i></div>' +
           '</div>' +
           '<div class="hu-card"><span class="hu-lbl">' + esc(H.cur.c) + '</span><div class="hu-word">' + esc(H.cur.w) + '</div></div>' +
           (tilt.live ? '<span class="hu-tilt"><i></i>Tilt on</span>' : '') +
           '<div class="hu-flash" aria-hidden="true"></div>' +
         '</div>', 'full edge');
    fitWord();
    H.tick = setInterval(tick, 200);
    tick();
    buzz(80);
  }
  // Biggest type that keeps every word on one line inside the card, so the group can read it from a few feet away
  function fitWord(){
    var w = $('.hu-word'), card = $('.hu-card');
    if (!w || !card) return;
    var size = Math.min(80, Math.round(card.clientWidth / 4.6)), maxH = card.clientHeight - 76;
    w.style.fontSize = size + 'px';
    while (size > 24 && (w.scrollWidth > w.clientWidth + 1 || w.offsetHeight > maxH)){ size -= 2; w.style.fontSize = size + 'px'; }
  }
  window.addEventListener('resize', function(){ if (H.phase === 'play') fitWord(); });
  function tick(){
    if (H.phase !== 'play') return;
    var ms = Math.max(0, H.end - Date.now()), left = Math.ceil(ms / 1000);
    var t = $('.hu-time'), b = $('.hu-tbar i');
    if (t){ if (t.textContent !== String(left)) t.textContent = left; t.classList.toggle('low', left <= 10); }
    if (b){ b.style.width = (ms / ROUND_MS * 100).toFixed(1) + '%'; b.parentNode.classList.toggle('low', left <= 10); }
    if (ms <= 0) finishHeads();
  }
  function headsAct(ok){
    if (H.phase !== 'play') return;
    var now = performance.now();
    if (now - H.lastAct < LOCK_MS) return;
    H.lastAct = now;
    H.list.push({ w:H.cur.w, ok:ok });
    if (ok) H.score++;
    buzz(ok ? 60 : [30, 50, 30]);
    var f = $('.hu-flash');
    if (f){
      f.className = 'hu-flash';
      f.innerHTML = '<span>' + ico(ok ? 'check' : 'x') + (ok ? 'Got it!' : 'Skip') + '</span>';
      void f.offsetWidth;
      f.className = 'hu-flash ' + (ok ? 'got' : 'skip');
    }
    H.cur = nextWord();
    var w = $('.hu-word'), l = $('.hu-lbl'), p = $('.hu-pts b');
    if (w) w.outerHTML = '<div class="hu-word">' + esc(H.cur.w) + '</div>';
    if (l) l.textContent = H.cur.c;
    if (p) p.textContent = H.score;
    fitWord();
  }
  function finishHeads(){
    if (H.phase !== 'play') return;
    stopTimers();
    H.phase = 'done';
    setLive(false); keepAwake(false); tiltStop();
    buzz(H.early ? 40 : [90, 60, 200]);
    renderHeadsEnd();
  }
  function renderHeadsEnd(){
    var got = H.score, skipped = H.list.length - got;
    var cheer = got >= 10 ? 'On fire! 🔥' : got >= 5 ? 'Great clues, team!' : got >= 1 ? 'Nice start!' : 'Warm-up round!';
    show(bar('Heads Up!', '') +
      '<section class="g-result starfield">' +
        '<div class="g-kick">' + (H.early ? 'Round over' : 'Time\'s up!') + '</div>' +
        '<div class="g-big">' + got + '</div>' +
        '<div class="g-msg">' + (got === 1 ? 'word guessed' : 'words guessed') + '</div>' +
        '<div class="g-line">' + cheer + ' ' + skipped + ' skipped · ' + esc(cat().name) + '</div>' +
      '</section>' +
      (H.list.length ? '<ul class="hu-words">' + H.list.map(function(x){
        return '<li class="' + (x.ok ? 'ok' : 'no') + '">' + ico(x.ok ? 'check' : 'x') + '<span>' + esc(x.w) + '</span></li>';
      }).join('') + '</ul>' : '') +
      '<div class="g-actions">' +
        '<button type="button" class="btn btn-done" data-g="hstart">' + ico('play') + 'Next player</button>' +
        '<button type="button" class="btn btn-map" data-g="hsetup">Change deck</button>' +
      '</div>');
  }
  // The whole screen is two tap zones: right half = got it, left half = skip
  view.addEventListener('pointerdown', function(e){
    if (H.phase !== 'play') return;
    var play = e.target.closest('.hu-play');
    if (!play || e.target.closest('.hu-end') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    if (performance.now() - shownAt < 300) return;
    var r = play.getBoundingClientRect();
    headsAct(e.clientX >= r.left + r.width / 2);
  });
  // Every stray tap counts now, so End needs a second tap to confirm
  function endTap(){
    if (H.phase !== 'play') return;
    var dt = performance.now() - H.endArm;
    if (H.endArm && dt < 400) return;
    if (H.endArm){ H.early = true; finishHeads(); return; }
    H.endArm = performance.now();
    endLabel(true);
    H.endT = setTimeout(function(){ H.endArm = 0; H.endT = null; endLabel(false); }, 3000);
  }
  function endLabel(arm){
    var b = $('.hu-end');
    if (!b) return;
    b.classList.toggle('arm', arm);
    b.querySelector('span').textContent = arm ? 'Tap again to end' : 'End';
  }
  document.addEventListener('keydown', function(e){
    if (H.phase !== 'play' || view.hidden) return;
    if (e.key === 'ArrowRight'){ e.preventDefault(); headsAct(true); }
    else if (e.key === 'ArrowLeft'){ e.preventDefault(); headsAct(false); }
  });

  /* ---------- emoji ---------- */
  var eDeck = deck(D.emoji), E = null;
  // "The Lion King" -> "T _ _   L _ _ _   K _ _ _"; no-break spaces keep each word on one line
  function hintOf(a){
    return a.replace(/"/g, '').split(' ').map(function(w){
      var first = true;
      return w.replace(/[A-Za-z0-9À-ÿ]/g, function(ch){ if (first){ first = false; return ch; } return '_'; }).split('').join('\u00a0');
    }).join('   ');
  }
  function nextEmoji(){
    E = { cur:eDeck.next(), shown:false, hint:false, n:eDeck.pos() };
    show(bar('Emoji Guess', '<span class="g-count">' + E.n + ' / ' + eDeck.size + '</span>') +
      '<div class="em-wrap">' + emojiBody() + '</div>' +
      '<p class="g-foot">One person holds the phone up. First to shout the answer wins the round.</p>');
  }
  function emojiBody(){
    var c = E.cur, ride = c.t === 'Ride';
    return '<div class="em-card' + (E.shown ? ' shown' : '') + '"' + (E.shown ? '' : ' data-g="ereveal"') + '>' +
             '<span class="em-tag' + (ride ? ' ride' : '') + '">' + (ride ? 'Ride' : 'Movie') + '</span>' +
             '<div class="em-clue" role="img" aria-label="Emoji clue">' + esc(c.e) + '</div>' +
             (E.hint && !E.shown ? '<div class="em-hint">' + esc(hintOf(c.a)) + '</div>' : '') +
             (E.shown ? '<div class="em-answer">' + esc(c.a) + '</div>' : '<button type="button" class="em-reveal" data-g="ereveal">' + ico('eye') + '<span>Tap to reveal</span></button>') +
           '</div>' +
           '<div class="em-actions">' +
             (E.shown ? '' : '<button type="button" class="btn btn-map" data-g="ehint"' + (E.hint ? ' disabled' : '') + '>' + ico('bulb') + 'Hint</button>') +
             '<button type="button" class="btn btn-done" data-g="enext">' + (E.shown ? 'Next puzzle' : 'Skip') + ico('next') + '</button>' +
           '</div>';
  }
  function emojiUpdate(){ var w = $('.em-wrap'); if (w) w.innerHTML = emojiBody(); }

  /* ---------- would you rather ---------- */
  var wDeck = deck(D.wyr), W = null;
  function nextWyr(){
    W = { cur:wDeck.next(), pick:null, n:wDeck.pos() };
    var opt = function(k){ return '<button type="button" class="wyr-opt ' + k + '" data-g="wpick" data-p="' + k + '" aria-pressed="false"><span>' + esc(W.cur[k]) + '</span><span class="wk">' + ico('check') + '</span></button>'; };
    show(bar('Would You Rather', '<span class="g-count">' + W.n + ' / ' + wDeck.size + '</span>') +
      '<p class="wyr-ask">Would you rather…</p>' +
      '<div class="wyr-opts">' + opt('a') + '<span class="wyr-or" aria-hidden="true">or</span>' + opt('b') + '</div>' +
      '<button type="button" class="btn btn-done wyr-next" data-g="wnext">Next question' + ico('next') + '</button>' +
      '<p class="g-foot">Everyone picks, then explain why. Tap a side to mark the winner.</p>');
  }
  function pickWyr(p){
    W.pick = W.pick === p ? null : p;
    $$('.wyr-opt').forEach(function(o){
      var on = o.dataset.p === W.pick;
      o.classList.toggle('on', on); o.classList.toggle('off', !!W.pick && !on); o.setAttribute('aria-pressed', on);
    });
    buzz(15);
  }

  /* ---------- events ---------- */
  view.addEventListener('click', function(e){
    var b = e.target.closest('[data-g]');
    if (!b || !view.contains(b)) return;
    var g = b.dataset.g;
    // A quick double tap shouldn't land on the next screen's buttons
    if (g !== 'home' && performance.now() - shownAt < 300) return;
    switch (g){
      case 'home': stopTimers(); setLive(false); keepAwake(false); tiltStop(); H.phase = 'setup'; renderHome(); break;
      case 'open': open(b.dataset.k); break;
      case 'answer': answer(+b.dataset.i); break;
      case 'tnext': nextQuestion(); break;
      case 'tagain': startTrivia(); break;
      case 'hcat': pickCat(b.dataset.c); break;
      case 'hstart': tiltStart(startHeads); break;
      case 'hsetup': renderHeadsSetup(); break;
      case 'hquit': quitCountdown(); break;
      case 'hend': endTap(); break;
      case 'ereveal': if (!E.shown){ E.shown = true; emojiUpdate(); buzz(20); } break;
      case 'ehint': if (!E.hint){ E.hint = true; emojiUpdate(); } break;
      case 'enext': nextEmoji(); break;
      case 'wpick': pickWyr(b.dataset.p); break;
      case 'wnext': nextWyr(); break;
    }
  });
  view.addEventListener('submit', function(e){
    if (!e.target.classList.contains('g-name-form')) return;
    e.preventDefault();
    saveName(e.target);
  });

  // Called by app.js when another tab opens: stop a live round instead of letting it run in the background
  function leave(){
    if (H.phase === 'count') quitCountdown();
    else if (H.phase === 'play'){ H.early = true; finishHeads(); }
  }

  renderHome();
  window.DLGames = { leave: leave };
})();
