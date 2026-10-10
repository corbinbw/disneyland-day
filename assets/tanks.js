/* Tank Battle: two players face to face over one phone lying flat. games.js mounts it into the Games tab. */
(function(){
  'use strict';

  var AW = 300, AH = 420;                             // arena in game units; the canvas scales it to fit
  var TANK_R = 11, SPEED = 85, TURN = 3.8;            // units, units/s, radians/s
  var BULLET_R = 3.2, BULLET_SPEED = 185, BOUNCES = 2, MAX_BULLETS = 3, COOLDOWN = 0.45, BULLET_LIFE = 6;
  var WIN = 5, COUNT = 1.8, BOOM = 1.7, STEP = 1 / 120;
  var DEAD = 0.15, AIM = 0.4;                         // stick: dead zone, and how far to push before the tank drives (less just turns it)
  var P = {
    1: { name:'Blue', main:'#3d8bff', dark:'#1c4fbf', light:'#a9cdff' },
    2: { name:'Orange', main:'#ff8a1f', dark:'#b4500b', light:'#ffcf96' }
  };
  // Point-symmetric, so both ends of the table get the same arena
  var WALLS = [
    { x:135, y:195, w:30, h:30 },
    { x:30, y:150, w:76, h:16 }, { x:194, y:254, w:76, h:16 },
    { x:194, y:150, w:76, h:16 }, { x:30, y:254, w:76, h:16 },
    { x:62, y:318, w:16, h:44 }, { x:222, y:58, w:16, h:44 }
  ];
  var SPAWN = { 1: { x:120, y:392, h:-Math.PI / 2 }, 2: { x:180, y:28, h:Math.PI / 2 } };

  var root = null, opts = {}, cv = null, ctx = null, floor = null, raf = 0, last = 0, acc = 0, scale = 1, dpr = 1, frames = 0;
  var G = null, lock = null, ui = null, sticks = null, fires = null, tapping = null, menuAt = 0;

  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
  function wrap(a){ while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  function $(s){ return root.querySelector(s); }
  function buzz(p){ try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(p); } catch(e){} }

  /* ---------- screen ---------- */
  var PAUSE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8.5 5.5v13M15.5 5.5v13" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>';
  function pad(p){
    var pips = '';
    for (var i = 0; i < WIN; i++) pips += '<i></i>';
    return '<div class="tk-pad p' + p + '">' +
             '<div class="tk-hud">' +
               '<span class="tk-tag"><i></i>' + P[p].name + '</span>' +
               '<span class="tk-pips" role="img" aria-label="0 points">' + pips + '</span>' +
               '<button type="button" class="tk-pause" data-t="pause" data-p="' + p + '">' + PAUSE_ICON + '<span>Pause</span></button>' +
             '</div>' +
             '<div class="tk-ctrl">' +
               '<div class="tk-stick" data-p="' + p + '" aria-label="' + P[p].name + ' joystick"><div class="tk-base"><div class="tk-knob"></div></div></div>' +
               '<button type="button" class="tk-fire" data-p="' + p + '" aria-label="' + P[p].name + ' fire"><b>Fire</b><span class="tk-ammo"><i></i><i></i><i></i></span></button>' +
             '</div>' +
           '</div>';
  }
  function mount(el, o){
    unmount();
    root = el; opts = o || {};
    root.innerHTML = pad(2) +
      '<div class="tk-arena"><canvas class="tk-cv"></canvas>' +
        '<div class="tk-msg m2" aria-hidden="true"><b></b><span></span></div>' +
        '<div class="tk-msg m1" role="status"><b></b><span></span></div>' +
      '</div>' + pad(1) +
      '<div class="tk-over" hidden></div>' +
      '<div class="tk-turn"><b>Turn the phone upright</b><span>Tank Battle plays in portrait, lying flat between two players.</span></div>';
    cv = $('.tk-cv'); ctx = cv.getContext('2d');
    ui = { msg:{}, fire:{}, ammo:{}, pips:{} };
    [1, 2].forEach(function(p){
      var pd = $('.tk-pad.p' + p);
      ui.msg[p] = $('.tk-msg.m' + p);
      ui.fire[p] = pd.querySelector('.tk-fire');
      ui.ammo[p] = Array.prototype.slice.call(pd.querySelectorAll('.tk-ammo i'));
      ui.pips[p] = pd.querySelector('.tk-pips');
    });
    sticks = { 1: { id:null }, 2: { id:null } };
    fires = { 1: null, 2: null };
    tapping = null;
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    root.addEventListener('lostpointercapture', onUp);
    root.addEventListener('click', onClick);
    ['contextmenu', 'selectstart', 'gesturestart', 'dblclick'].forEach(function(t){ root.addEventListener(t, prevent); });
    window.addEventListener('resize', fit);
    document.addEventListener('visibilitychange', onVis);
    newMatch();
    fit();
    awake(true);
    last = performance.now(); acc = 0;
    raf = requestAnimationFrame(frame);
  }
  function unmount(){
    if (!root) return;
    cancelAnimationFrame(raf); raf = 0;
    window.removeEventListener('resize', fit);
    document.removeEventListener('visibilitychange', onVis);
    disarm();
    awake(false);
    root = null; G = null; cv = ctx = floor = null; ui = null;
  }
  function prevent(e){ e.preventDefault(); }
  function awake(on){
    try {
      if (on && !lock && navigator.wakeLock) navigator.wakeLock.request('screen').then(function(l){ if (root) lock = l; else l.release(); }).catch(function(){});
      else if (!on && lock){ lock.release().catch(function(){}); lock = null; }
    } catch(e){}
  }
  function onVis(){
    if (document.hidden){ if (G && !G.paused && G.phase !== 'over') pause(); lock = null; }
    else if (root) awake(true);
  }
  function landscape(){ return innerWidth > innerHeight && innerHeight < 560; }
  function fit(){
    if (!root) return;
    root.classList.toggle('turn', landscape());
    if (landscape() && G && !G.paused && G.phase !== 'over') pause();
    var box = $('.tk-arena');
    scale = Math.max(0.2, Math.min((box.clientWidth - 14) / AW, (box.clientHeight - 14) / AH));
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var w = Math.round(AW * scale), h = Math.round(AH * scale);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    paintFloor();
    draw();
  }

  /* ---------- input: every pointer is tracked by id, so four thumbs can play at once ---------- */
  // Player 2's pad is turned 180°, so its local axes run opposite to the screen's
  function local(p, r, x, y){ return p === 2 ? { x:r.right - x, y:r.bottom - y } : { x:x - r.left, y:y - r.top }; }
  function onDown(e){
    if (!G) return;
    var btn = e.target.closest('[data-t]');
    if (btn){ tapping = { id:e.pointerId, el:btn }; return; }
    if (G.paused || G.phase === 'over') return;
    var st = e.target.closest('.tk-stick'), fb = e.target.closest('.tk-fire');
    if (st){ e.preventDefault(); grab(+st.dataset.p, st, e); }
    else if (fb){ e.preventDefault(); press(+fb.dataset.p, fb, e); }
  }
  function grab(p, zone, e){
    var s = sticks[p];
    if (s.id != null) return;
    try { zone.setPointerCapture(e.pointerId); } catch(err){}
    var base = zone.firstChild, r = zone.getBoundingClientRect(), half = base.offsetWidth / 2, at = local(p, r, e.clientX, e.clientY);
    // The base jumps under the thumb, so wherever it lands is "standing still"
    sticks[p] = s = { id:e.pointerId, zone:zone, base:base, knob:base.firstChild, r:r, travel:half * 0.62, m:0, ax:0, ay:0,
      bx:clamp(at.x, half, r.width - half), by:clamp(at.y, half, r.height - half) };
    base.style.left = s.bx + 'px'; base.style.top = s.by + 'px';
    zone.classList.add('on');
    steer(p, e);
  }
  function steer(p, e){
    var s = sticks[p], at = local(p, s.r, e.clientX, e.clientY);
    var dx = at.x - s.bx, dy = at.y - s.by, d = Math.sqrt(dx * dx + dy * dy);
    if (d > s.travel){ dx *= s.travel / d; dy *= s.travel / d; d = s.travel; }
    s.knob.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
    var f = p === 2 ? -1 : 1;
    s.m = d / s.travel; s.ax = f * dx / s.travel; s.ay = f * dy / s.travel;
  }
  function release(p){
    var s = sticks[p];
    if (s.id == null) return;
    s.base.style.left = s.base.style.top = ''; s.knob.style.transform = '';
    s.zone.classList.remove('on');
    sticks[p] = { id:null };
  }
  function press(p, btn, e){
    if (fires[p] != null) return;
    fires[p] = e.pointerId;
    try { btn.setPointerCapture(e.pointerId); } catch(err){}
    btn.classList.add('on');
    // Fires now, or the moment the gun is ready if the press came a hair early
    if (G.phase === 'play') G.tanks[p].want = 0.18;
  }
  function unpress(p){
    if (fires[p] == null) return;
    fires[p] = null;
    ui.fire[p].classList.remove('on');
  }
  function onMove(e){
    if (!G) return;
    if (sticks[1].id === e.pointerId) steer(1, e);
    else if (sticks[2].id === e.pointerId) steer(2, e);
  }
  function onUp(e){
    if (!G) return;
    if (tapping && tapping.id === e.pointerId){
      var b = tapping.el, at = e.type === 'pointerup' && document.elementFromPoint(e.clientX, e.clientY);
      tapping = null;
      if (at && b.contains(at)) act(b);
    }
    [1, 2].forEach(function(p){
      if (sticks[p].id === e.pointerId) release(p);
      if (fires[p] === e.pointerId) unpress(p);
    });
  }
  function letGo(){ [1, 2].forEach(function(p){ release(p); unpress(p); }); }
  // Buttons act on pointerup because browsers drop the click while another thumb is down; this click path is for keyboards
  function onClick(e){
    var b = e.target.closest('[data-t]');
    if (b && e.detail === 0) act(b);
  }
  function act(b){
    if (!G) return;
    if (b.dataset.t !== 'pause' && performance.now() - menuAt < 600) return;   // a tap aimed at FIRE shouldn't land on a menu that just opened
    switch (b.dataset.t){
      case 'pause': pauseTap(+b.dataset.p); break;
      case 'resume': resume(); break;
      case 'rematch': newMatch(); break;
      case 'exit': if (opts.onExit) opts.onExit(); break;
    }
  }

  /* ---------- match flow ---------- */
  function tank(p){ var s = SPAWN[p]; return { p:p, x:s.x, y:s.y, h:s.h, alive:true, cd:0, want:0, kick:0, tread:0 }; }
  function newMatch(){
    disarm();
    G = { phase:'count', t:0, round:0, score:{ 1:0, 2:0 }, tanks:null, bullets:[], parts:[], rings:[], paused:false, winner:0, arm:null, say:null, msgKey:'' };
    acc = 0;
    if (root){ $('.tk-over').hidden = true; letGo(); }
    nextRound();
    pips();
  }
  function nextRound(){
    G.round++;
    G.tanks = { 1: tank(1), 2: tank(2) };
    G.bullets = [];
    G.phase = 'count'; G.t = 0;
  }
  function pips(){
    if (!ui) return;
    [1, 2].forEach(function(p){
      var n = G.score[p];
      Array.prototype.forEach.call(ui.pips[p].children, function(d, i){ d.classList.toggle('on', i < n); });
      ui.pips[p].setAttribute('aria-label', n + (n === 1 ? ' point' : ' points'));
    });
  }
  function boom(dead){
    var lost = {};
    dead.forEach(function(d){
      if (!d.t.alive) return;
      d.t.alive = false; lost[d.t.p] = d.by;
      explode(d.t);
    });
    G.phase = 'boom'; G.t = 0;
    if (lost[1] && lost[2]){
      G.last = { k:0 };
      G.say = { 1:['Draw!', 'Both tanks down. No point'], 2:['Draw!', 'Both tanks down. No point'] };
    } else {
      var v = lost[1] ? 1 : 2, k = 3 - v, self = lost[v] === v;
      G.score[k]++;
      G.last = { k:k };
      G.say = {};
      G.say[k] = self ? ['Free point!', P[v].name + ' hit their own tank'] : ['Hit!', 'Point to you'];
      G.say[v] = self ? ['Oops!', 'Your own shot. Point to ' + P[k].name] : ['Boom!', 'Point to ' + P[k].name];
      pips();
    }
    buzz([70, 40, 140]);
  }
  function over(k){
    G.phase = 'over'; G.winner = k;
    disarm();
    letGo();
    overlay('over');
    buzz([90, 60, 90, 60, 220]);
  }
  function pauseTap(p){
    if (G.paused || G.phase === 'over') return;
    var now = performance.now(), a = G.arm;
    if (a && a.p === p){
      if (now - a.t < 400) return;            // a quick double tap only arms it
      clearTimeout(a.timer); G.arm = null; armLabel(p, false);
      pause();
      return;
    }
    if (a){ clearTimeout(a.timer); armLabel(a.p, false); }
    G.arm = { p:p, t:now, timer:setTimeout(function(){ if (G && G.arm && G.arm.p === p){ G.arm = null; armLabel(p, false); } }, 3000) };
    armLabel(p, true);
  }
  function armLabel(p, on){
    var b = root && $('.tk-pad.p' + p + ' .tk-pause');
    if (!b) return;
    b.classList.toggle('arm', on);
    b.querySelector('span').textContent = on ? 'Tap again to pause' : 'Pause';
  }
  function disarm(){
    if (!G || !G.arm) return;
    clearTimeout(G.arm.timer); armLabel(G.arm.p, false); G.arm = null;
  }
  function pause(){
    disarm();
    G.paused = true;
    letGo();
    overlay('pause');
  }
  function resume(){
    if (landscape()) return;
    G.paused = false;
    $('.tk-over').hidden = true;
    last = performance.now(); acc = 0;
  }
  // One panel per player, each turned to face its owner
  function overlay(kind){
    var o = $('.tk-over');
    o.innerHTML = [2, 1].map(function(p){
      var q = 3 - p, score = '<b style="color:' + P[p].light + '">' + G.score[p] + '</b><i>–</i><b style="color:' + P[q].light + '">' + G.score[q] + '</b>', head, btns;
      if (kind === 'pause'){
        head = 'Paused';
        btns = '<button type="button" class="go" data-t="resume">Resume</button><button type="button" data-t="exit">Exit</button>';
      } else {
        head = G.winner === p ? 'You win!' : P[G.winner].name + ' wins';
        btns = '<button type="button" class="go" data-t="rematch">Rematch</button><button type="button" data-t="exit">Exit</button>';
      }
      return '<div class="tk-panel p' + p + (kind === 'over' && G.winner === p ? ' won' : '') + '">' +
               '<h2>' + head + '</h2><p class="tk-score">' + score + '</p><div class="tk-btns">' + btns + '</div></div>';
    }).join('');
    o.hidden = false;
    menuAt = performance.now();
  }

  /* ---------- simulation ---------- */
  function solid(x, y, r){
    if (x < r || y < r || x > AW - r || y > AH - r) return true;
    for (var i = 0; i < WALLS.length; i++){
      var w = WALLS[i], dx = x - clamp(x, w.x, w.x + w.w), dy = y - clamp(y, w.y, w.y + w.h);
      if (dx * dx + dy * dy < r * r) return true;
    }
    return false;
  }
  function blocked(t, x, y){
    if (solid(x, y, TANK_R)) return true;
    var o = G.tanks[3 - t.p], dx = x - o.x, dy = y - o.y;
    return o.alive && dx * dx + dy * dy < 4 * TANK_R * TANK_R;
  }
  // Point the stick where you want to go: the tank turns that way, and drives once it's facing roughly right
  function drive(t, dt){
    var s = sticks[t.p];
    if (!t.alive || s.id == null || s.m <= DEAD) return;
    var diff = wrap(Math.atan2(s.ay, s.ax) - t.h), turn = TURN * dt;
    t.h = wrap(t.h + clamp(diff, -turn, turn));
    var push = clamp((s.m - AIM) / (1 - AIM), 0, 1) * Math.max(0, Math.cos(diff));
    if (push <= 0) return;
    var v = SPEED * push * dt, nx = t.x + Math.cos(t.h) * v, ny = t.y + Math.sin(t.h) * v;
    if (!blocked(t, nx, t.y)) t.x = nx;
    if (!blocked(t, t.x, ny)) t.y = ny;
    t.tread += v;
  }
  function ammo(p){ var n = MAX_BULLETS; for (var i = 0; i < G.bullets.length; i++) if (G.bullets[i].p === p) n--; return n; }
  function trigger(t, dt){
    if (t.cd > 0) t.cd -= dt;
    if (t.kick > 0) t.kick = Math.max(0, t.kick - dt * 6);
    if (t.want <= 0) return;
    t.want -= dt;
    if (t.alive && t.cd <= 0 && ammo(t.p) > 0){ t.want = 0; shoot(t); }
  }
  function shoot(t){
    var c = Math.cos(t.h), s = Math.sin(t.h), d = TANK_R + BULLET_R + 4, x = t.x + c * d, y = t.y + s * d;
    t.cd = COOLDOWN; t.kick = 1;
    if (solid(x, y, BULLET_R)){ burst(x, y, P[t.p].light, 6, 50, 0.3, 1.6); return; }   // muzzle against a wall: the shot fizzles
    G.bullets.push({ p:t.p, x:x, y:y, vx:c * BULLET_SPEED, vy:s * BULLET_SPEED, b:0, life:BULLET_LIFE });
  }
  function moveBullets(dt){
    for (var i = G.bullets.length - 1; i >= 0; i--){
      var b = G.bullets[i], hit = false, nx = b.x + b.vx * dt, ny;
      if (solid(nx, b.y, BULLET_R)){ b.vx = -b.vx; hit = true; } else b.x = nx;
      ny = b.y + b.vy * dt;
      if (solid(b.x, ny, BULLET_R)){ b.vy = -b.vy; hit = true; } else b.y = ny;
      b.life -= dt;
      if (hit && ++b.b > BOUNCES){ burst(b.x, b.y, P[b.p].light, 7, 60, 0.35, 1.5); G.bullets.splice(i, 1); continue; }
      if (hit) burst(b.x, b.y, P[b.p].light, 3, 40, 0.25, 1.2);
      if (b.life <= 0) G.bullets.splice(i, 1);
    }
  }
  function hits(){
    var dead = [], i, j, b;
    for (i = G.bullets.length - 1; i >= 0; i--){
      b = G.bullets[i];
      for (var p = 1; p <= 2; p++){
        var t = G.tanks[p], dx = b.x - t.x, dy = b.y - t.y, reach = TANK_R + BULLET_R;
        if (!t.alive || (b.p === p && b.b === 0)) continue;   // your own shot can't hit you until it has bounced
        if (dx * dx + dy * dy < reach * reach){ dead.push({ t:t, by:b.p }); G.bullets.splice(i, 1); break; }
      }
    }
    // Shots that meet cancel each other out
    for (i = G.bullets.length - 1; i > 0; i--){
      for (j = i - 1; j >= 0; j--){
        var a = G.bullets[i], c = G.bullets[j], ex = a.x - c.x, ey = a.y - c.y;
        if (ex * ex + ey * ey < 4 * BULLET_R * BULLET_R){
          burst((a.x + c.x) / 2, (a.y + c.y) / 2, '#fff', 8, 55, 0.35, 1.5);
          G.bullets.splice(i, 1); G.bullets.splice(j, 1); i--;
          break;
        }
      }
    }
    if (dead.length) boom(dead);
  }
  function burst(x, y, color, n, speed, life, size){
    for (var i = 0; i < n; i++){
      var a = Math.random() * Math.PI * 2, v = speed * (0.35 + Math.random() * 0.65);
      G.parts.push({ x:x, y:y, vx:Math.cos(a) * v, vy:Math.sin(a) * v, life:life * (0.6 + Math.random() * 0.4), max:life, size:size, color:color });
    }
  }
  function explode(t){
    burst(t.x, t.y, P[t.p].main, 24, 110, 0.8, 3);
    burst(t.x, t.y, '#ffd27a', 14, 70, 0.55, 2.4);
    burst(t.x, t.y, '#ffffff', 6, 40, 0.35, 2);
    G.rings.push({ x:t.x, y:t.y, life:0.5, color:P[t.p].light });
  }
  function update(dt){
    G.t += dt;
    var k = Math.pow(0.05, dt), i;
    for (i = G.parts.length - 1; i >= 0; i--){
      var q = G.parts[i];
      q.life -= dt;
      if (q.life <= 0){ G.parts.splice(i, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= k; q.vy *= k;
    }
    for (i = G.rings.length - 1; i >= 0; i--){ G.rings[i].life -= dt; if (G.rings[i].life <= 0) G.rings.splice(i, 1); }
    if (G.phase === 'count'){
      if (G.t >= COUNT){ G.phase = 'play'; G.t = 0; }
    } else if (G.phase === 'play'){
      drive(G.tanks[1], dt); drive(G.tanks[2], dt);
      trigger(G.tanks[1], dt); trigger(G.tanks[2], dt);
      moveBullets(dt);
      hits();
    } else if (G.phase === 'boom'){
      moveBullets(dt);
      if (G.t >= BOOM){
        if (G.last.k && G.score[G.last.k] >= WIN) over(G.last.k);
        else nextRound();
      }
    }
  }

  /* ---------- drawing ---------- */
  function rr(c, x, y, w, h, r){
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  // Floor, grid and walls never change, so they're painted once per resize
  function paintFloor(){
    var f = document.createElement('canvas');
    f.width = cv.width; f.height = cv.height;
    var c = f.getContext('2d'), g, x, y;
    c.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    g = c.createLinearGradient(0, 0, 0, AH);
    g.addColorStop(0, '#2a2378'); g.addColorStop(0.5, '#1b1758'); g.addColorStop(1, '#22307a');
    c.fillStyle = g; c.fillRect(0, 0, AW, AH);
    g = c.createLinearGradient(0, 0, 0, AH * 0.42);
    g.addColorStop(0, 'rgba(255,138,31,.2)'); g.addColorStop(1, 'rgba(255,138,31,0)');
    c.fillStyle = g; c.fillRect(0, 0, AW, AH * 0.42);
    g = c.createLinearGradient(0, AH, 0, AH * 0.58);
    g.addColorStop(0, 'rgba(61,139,255,.22)'); g.addColorStop(1, 'rgba(61,139,255,0)');
    c.fillStyle = g; c.fillRect(0, AH * 0.58, AW, AH * 0.42);
    c.strokeStyle = 'rgba(255,255,255,.055)'; c.lineWidth = 0.7;
    c.beginPath();
    for (x = 20; x < AW; x += 20){ c.moveTo(x, 0); c.lineTo(x, AH); }
    for (y = 20; y < AH; y += 20){ c.moveTo(0, y); c.lineTo(AW, y); }
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1.2;
    if (c.setLineDash) c.setLineDash([6, 6]);
    c.beginPath(); c.moveTo(0, AH / 2); c.lineTo(AW, AH / 2); c.stroke();
    if (c.setLineDash) c.setLineDash([]);
    WALLS.forEach(function(w){
      c.fillStyle = 'rgba(5,4,24,.55)'; rr(c, w.x + 1.5, w.y + 3, w.w, w.h, 3.5); c.fill();
      g = c.createLinearGradient(0, w.y, 0, w.y + w.h);
      g.addColorStop(0, '#7a70e6'); g.addColorStop(1, '#4c43b6');
      c.fillStyle = g; rr(c, w.x, w.y, w.w, w.h, 3.5); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; rr(c, w.x + 2, w.y + 1.5, w.w - 4, 2.4, 1.2); c.fill();
    });
    c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 2;
    rr(c, 1, 1, AW - 2, AH - 2, 10); c.stroke();
    floor = f;
  }
  function circle(x, y, r){ ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function drawTank(t){
    var c = P[t.p], off = t.tread % 4, x;
    ctx.save();
    ctx.translate(t.x, t.y);
    if (G.phase === 'count'){
      ctx.strokeStyle = c.main; ctx.globalAlpha = 0.65; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 18 + Math.sin(G.t * 9) * 2.5, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(4,3,20,.45)';
    ctx.beginPath(); ctx.ellipse(1.5, 3, 13.5, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(t.h);
    ctx.fillStyle = c.dark;
    rr(ctx, -12.5, -11.5, 25, 6.5, 2.5); ctx.fill();
    rr(ctx, -12.5, 5, 25, 6.5, 2.5); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (x = -12 + off; x < 12; x += 4){ ctx.moveTo(x, -11); ctx.lineTo(x, -5.5); ctx.moveTo(x, 5.5); ctx.lineTo(x, 11); }
    ctx.stroke();
    ctx.fillStyle = c.main; rr(ctx, -10, -7.5, 20, 15, 4); ctx.fill();
    ctx.fillStyle = c.dark; rr(ctx, 1 - t.kick * 3, -2.3, 15, 4.6, 2); ctx.fill();
    ctx.fillStyle = c.light; circle(0, 0, 5.8);
    ctx.fillStyle = 'rgba(255,255,255,.6)'; circle(-1.5, -1.7, 1.8);
    ctx.restore();
  }
  function draw(){
    if (!ctx || !G) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (floor) ctx.drawImage(floor, 0, 0);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    if (G.tanks[1].alive) drawTank(G.tanks[1]);
    if (G.tanks[2].alive) drawTank(G.tanks[2]);
    ctx.lineCap = 'round';
    G.bullets.forEach(function(b){
      var c = P[b.p];
      ctx.globalAlpha = 0.5; ctx.strokeStyle = c.main; ctx.lineWidth = 3.4;
      ctx.beginPath(); ctx.moveTo(b.x - b.vx * 0.035, b.y - b.vy * 0.035); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.globalAlpha = 0.28; ctx.fillStyle = c.main; circle(b.x, b.y, 6.5);
      ctx.globalAlpha = 1; ctx.fillStyle = c.light; circle(b.x, b.y, BULLET_R);
      ctx.fillStyle = '#fff'; circle(b.x, b.y, 1.4);
    });
    G.rings.forEach(function(r){
      var k = 1 - r.life / 0.5;
      ctx.globalAlpha = 1 - k; ctx.strokeStyle = r.color; ctx.lineWidth = 3 * (1 - k) + 0.5;
      ctx.beginPath(); ctx.arc(r.x, r.y, 8 + k * 30, 0, Math.PI * 2); ctx.stroke();
    });
    G.parts.forEach(function(q){
      var k = q.life / q.max;
      ctx.globalAlpha = Math.max(0, k); ctx.fillStyle = q.color;
      circle(q.x, q.y, q.size * (0.45 + 0.55 * k));
    });
    ctx.globalAlpha = 1;
  }
  function messages(){
    var key = 'none', say = null;
    if (G.phase === 'count'){
      var n = Math.max(1, 3 - Math.floor(G.t / (COUNT / 3)));
      key = 'c' + G.round + n; say = { 1:[String(n), 'Round ' + G.round], 2:[String(n), 'Round ' + G.round] };
    } else if (G.phase === 'play' && G.t < 0.6){ key = 'go' + G.round; say = { 1:['Go!', ''], 2:['Go!', ''] }; }
    else if (G.phase === 'boom'){ key = 'b' + G.round; say = G.say; }
    if (key === G.msgKey) return;
    G.msgKey = key;
    [1, 2].forEach(function(p){
      var el = ui.msg[p], m = say && say[p];
      el.classList.toggle('on', !!m);
      el.classList.toggle('big', key.charAt(0) === 'c');
      if (m){ el.firstChild.textContent = m[0]; el.lastChild.textContent = m[1]; }
    });
  }
  function hud(){
    [1, 2].forEach(function(p){
      var n = ammo(p), t = G.tanks[p], ready = G.phase === 'play' && t.alive && n > 0 && t.cd <= 0, key = n + (ready ? 'r' : 'w');
      if (ui.fire[p].dataset.k === key) return;
      ui.fire[p].dataset.k = key;
      ui.fire[p].classList.toggle('cool', !ready);
      ui.ammo[p].forEach(function(d, i){ d.classList.toggle('on', i < n); });
    });
  }
  function frame(now){
    if (!root) return;
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (G.paused || G.phase === 'over') return;   // nothing moves behind the menus
    acc += dt;
    while (acc >= STEP && G.phase !== 'over'){ update(STEP); acc -= STEP; }
    frames++;
    draw();
    messages();
    hud();
  }

  window.DLTanks = {
    mount: mount,
    unmount: unmount,
    // Read-only snapshot and tank placement for automated tests, like app.js's window.__dl
    test: {
      state: function(){
        if (!G) return null;
        var t = function(x){ return { x:x.x, y:x.y, h:x.h, alive:x.alive, cd:x.cd }; }, s = function(x){ return { held:x.id != null, m:x.m || 0, ax:x.ax || 0, ay:x.ay || 0 }; };
        return { phase:G.phase, t:G.t, round:G.round, paused:G.paused, winner:G.winner, score:{ 1:G.score[1], 2:G.score[2] },
          tanks:{ 1:t(G.tanks[1]), 2:t(G.tanks[2]) }, sticks:{ 1:s(sticks[1]), 2:s(sticks[2]) }, fire:{ 1:fires[1] != null, 2:fires[2] != null },
          bullets:G.bullets.map(function(b){ return { p:b.p, x:b.x, y:b.y, vx:b.vx, vy:b.vy, b:b.b }; }), frames:frames, scale:scale };
      },
      place: function(p, x, y, h){ var t = G && G.tanks[p]; if (t){ t.x = x; t.y = y; if (h != null) t.h = h; } },
      arena: { w:AW, h:AH, walls:WALLS, tankR:TANK_R, bulletR:BULLET_R, maxBullets:MAX_BULLETS, cooldown:COOLDOWN, bounces:BOUNCES, win:WIN }
    }
  };
})();
