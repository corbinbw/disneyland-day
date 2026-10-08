(function(){
  'use strict';
  var P = window.PLAN;
  var TZ = 'America/Los_Angeles';
  var LS_KEY = 'dlr-plan-done-v3';           // v3: 20 stops in timeline order
  // Older saves are migrated once so nothing is lost when stops were renumbered
  var MIGRATE = [
    { key:'dlr-plan-done-v2', map:{1:[1],2:[2],3:[3],4:[4],5:[5],6:[6],7:[7],8:[8],9:[9],10:[10],11:[11],12:[12],13:[13],14:[14],15:[19],16:[20]} },
    { key:'dlr-plan-done-v1', map:{1:[1],2:[2],3:[3,4],4:[5],5:[6],6:[7],7:[8],8:[9],9:[10],10:[11],11:[12],12:[13,14],13:[19],14:[20]} }
  ];
  (function migrate(){
    try {
      if (localStorage.getItem(LS_KEY) != null) return;
      for (var i=0;i<MIGRATE.length;i++){
        var old = JSON.parse(localStorage.getItem(MIGRATE[i].key) || 'null');
        if (!old) continue;
        var nu = {}, m = MIGRATE[i].map;
        Object.keys(old).forEach(function(k){ if (old[k]) (m[k] || []).forEach(function(n){ nu[n] = true; }); });
        localStorage.setItem(LS_KEY, JSON.stringify(nu));
        return;
      }
    } catch(e){}
  })();
  var MAIN = P.stops.filter(function(s){ return !s.optional; });
  var TOTAL = P.stops.length;

  var $ = function(s, el){ return (el||document).querySelector(s); };
  var $$ = function(s, el){ return Array.prototype.slice.call((el||document).querySelectorAll(s)); };
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function byId(id){ for (var i=0;i<P.stops.length;i++) if (P.stops[i].id===id) return P.stops[i]; return null; }

  /* ---------- state ---------- */
  function loadDone(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch(e){ return {}; } }
  function saveDone(){ try { localStorage.setItem(LS_KEY, JSON.stringify(done)); } catch(e){} }
  var done = loadDone();
  function doneCount(){ return P.stops.filter(function(s){ return !!done[s.id]; }).length; }
  function setDone(id, val){ if (val) done[id] = true; else delete done[id]; saveDone(); renderAll(); }

  /* ---------- Pacific time ---------- */
  var fmtParts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23' });
  var fmtClock = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour:'numeric', minute:'2-digit' });
  function pacific(){
    var now = new Date(), o = {};
    fmtParts.formatToParts(now).forEach(function(p){ o[p.type] = p.value; });
    var h = parseInt(o.hour,10) % 24, m = parseInt(o.minute,10);
    return { date: o.year + '-' + o.month + '-' + o.day, mins: h*60 + m, label: fmtClock.format(now) + ' PT' };
  }

  /* Next/current stop */
  function computeNext(){
    var t = pacific(), isDay = t.date === P.date, idx = -1;
    if (!isDay){
      for (var i=0;i<MAIN.length;i++){ if (!done[MAIN[i].id]) { idx = i; break; } }
    } else {
      var cur = 0;
      MAIN.forEach(function(s,i){ if (t.mins >= s.minutes) cur = i; });
      for (var j=cur;j<MAIN.length;j++){ if (!done[MAIN[j].id]) { idx = j; break; } }
      if (idx < 0) { for (var k=0;k<cur;k++){ if (!done[MAIN[k].id]) { idx = k; break; } } }
    }
    var stop = idx >= 0 ? MAIN[idx] : null;
    var after = [];
    if (idx >= 0){
      for (var a=idx+1; a<MAIN.length && after.length<2; a++){ if (!done[MAIN[a].id]) after.push(MAIN[a]); }
    }
    return { t:t, isDay:isDay, stop:stop, after:after, isNow: !!(isDay && stop && t.mins >= stop.minutes) };
  }

  function parkOf(s){ return s.park === 'dca' ? 'dca' : (s.park === 'dl' ? 'dl' : (s.y > P.map.h*0.49 ? 'dca' : 'dl')); }
  var PARK_LABEL = { dl:'Disneyland', dca:'California Adventure', show:'Show', meal:'Walk / hop' };

  function chipsHtml(s){
    var h = '<div class="chips">';
    h += '<span class="chip park-' + esc(s.park) + '">' + esc(PARK_LABEL[s.park] || s.park) + '</span>';
    if (s.height && s.height !== 'any') h += '<span class="chip">📏 <b>' + esc(s.height) + '</b></span>';
    if (s.ll && s.ll !== 'n/a') h += '<span class="chip ll">⚡ ' + esc(s.ll) + '</span>';
    if (s.motion) h += '<span class="chip warn">⚠️ Motion warning</span>';
    h += '</div>';
    return h + brandonHtml(s);
  }
  // Rider Switch + Brandon notes (Brandon gets motion sick and holds Crew)
  function brandonHtml(s){
    var lines = [];
    if (s.rs === 'brandon') lines.push('👶 <b>Brandon + Crew wait here</b> (Rider Switch)');
    else if (s.rs === 'other') lines.push('👶 Rider Switch: another adult takes Crew');
    else if (s.rs === 'call') lines.push('🤔 <b>Brandon\'s call.</b> If he sits out, he takes Crew (Rider Switch).');
    if (s.motion) lines.push('Skip for motion-sick riders.');
    if (s.bnote) lines.push(esc(s.bnote));
    if (!lines.length) return '';
    return '<div class="bnote">' + lines.join('<br>') + '</div>';
  }
  function isThrill(s){ return !!(s && (s.rs === 'brandon' || s.rs === 'call' || s.motion)); }
  function progressHtml(){
    var n = doneCount(), pct = Math.round(n / TOTAL * 100);
    return '<div class="progress"><div class="bar"><i style="width:' + pct + '%"></i></div><div class="lbl">' + n + ' of ' + TOTAL + ' done</div></div>';
  }

  /* ---------- NOW ---------- */
  function renderNow(){
    var r = computeNext(), el = $('#view-now'), h = '';
    if (!r.isDay) h += '<div class="banner">📅 Plan for Fri Oct 9. Showing the first stop not yet done.</div>';
    if (!r.stop){
      h += '<div class="next-card all-done"><div class="next-kicker">All done</div>' +
           '<div class="next-title"><h2>🎉 Every stop is checked off!</h2></div>' +
           '<div class="next-tip">Enjoy the fireworks. Reset in the Plan tab if needed.</div></div>';
    } else {
      var s = r.stop;
      h += '<div class="next-card">' +
             '<div class="next-kicker">' + (r.isNow ? 'Now' : 'Next up') + '</div>' +
             '<div class="next-time">' + esc(s.time) + '</div>' +
             '<div class="next-title"><span class="ico">' + (s.icon||'') + '</span><h2>' + esc(s.title) + '</h2></div>' +
             chipsHtml(s) +
             '<div class="next-tip">' + esc(s.tip) + '</div>' +
             (isThrill(s) && P.brandon ? '<button type="button" class="gentle-hint" data-act="gentle">🌿 Gentle options for Brandon ›</button>' : '') +
             '<div class="btn-row">' +
               '<button type="button" class="btn btn-done" data-act="done" data-id="' + s.id + '">✓ Done</button>' +
               '<button type="button" class="btn btn-map" data-act="map" data-id="' + s.id + '">🗺️ Map</button>' +
             '</div>' +
           '</div>';
    }
    if (r.after.length){
      h += '<div class="h2">After that</div><div class="after">';
      r.after.forEach(function(s){
        h += '<button type="button" class="mini" data-act="map" data-id="' + s.id + '">' +
               '<span class="num">' + s.id + '</span>' +
               '<span><span class="mt">' + esc(s.time) + '</span><br><span class="mn">' + esc(s.title) + '</span></span>' +
               '<span class="chev">›</span></button>';
      });
      h += '</div>';
    }
    h += '<div class="now-progress">' + progressHtml() + '</div>';
    h += '<div class="info-strip">' + esc(P.group) + ' · Indy closed</div>';
    el.innerHTML = h;
  }

  /* ---------- PLAN ---------- */
  var openRowId = null;
  function renderPlan(){
    var cur = computeNext().stop;
    $('#planHead').innerHTML = '<div class="ttl">The plan · ' + esc(P.dateLabel) + '</div>' + progressHtml();
    var h = '';
    P.stops.forEach(function(s){
      var cls = ['prow'];
      if (done[s.id]) cls.push('done');
      if (s.optional) cls.push('opt');
      if (cur && cur.id === s.id) cls.push('current');
      if (openRowId === s.id) cls.push('open');
      h += '<li class="' + cls.join(' ') + '" data-id="' + s.id + '">' +
             '<div class="prow-main">' +
               '<button type="button" class="prow-hit" data-act="toggle" data-id="' + s.id + '" aria-expanded="' + (openRowId===s.id) + '">' +
                 '<span class="num">' + s.id + '</span>' +
                 '<span class="txt"><span class="t">' + esc(s.time) + '</span><br><span class="n">' + esc(s.title) + '</span></span>' +
               '</button>' +
               '<button type="button" class="ck" data-act="check" data-id="' + s.id + '" aria-label="Mark ' + esc(s.title) + ' done" aria-pressed="' + !!done[s.id] + '"><span>✓</span></button>' +
             '</div>' +
             '<div class="prow-detail">' + chipsHtml(s) + '<div class="tip">' + esc(s.tip) + '</div>' +
               '<button type="button" class="btn btn-map" data-act="map" data-id="' + s.id + '">🗺️ Show on map</button>' +
             '</div>' +
           '</li>';
    });
    $('#planList').innerHTML = h;
  }

  /* ---------- SHOWS ---------- */
  function renderShows(){
    var h = '<div class="note red">🚫 Indiana Jones Adventure is closed. Skip it.</div>';
    h += '<div class="group-card">👨‍👩‍👧‍👦 ' + esc(P.group) + '</div>';
    if (P.brandon){
      var B = P.brandon, li = function(x){ return '<li><b>' + esc(x.name) + '</b><br><span>' + esc(x.note) + '</span></li>'; };
      h += '<div class="gentle" id="gentle"><h3>🌿 ' + esc(B.title) + '</h3><p>' + esc(B.intro) + '</p>' +
           '<div class="gsub">Best picks</div><ul>' + B.picks.map(li).join('') + '</ul>' +
           '<div class="gsub">Extras</div><ul>' + B.extras.map(li).join('') + '</ul>' +
           '<div class="gsub">Tips</div><ul class="gtips">' + B.tips.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>';
    }
    h += '<div class="h2" style="margin-top:6px">Shows tonight</div>';
    P.shows.forEach(function(sh){
      h += '<div class="show"><h3>' + esc(sh.name) + '</h3><div class="when">' + esc(sh.times) + '</div>' +
           '<div class="where">📍 ' + esc(sh.where) + '</div>' + (sh.tip ? '<div class="tip">' + esc(sh.tip) + '</div>' : '') + '</div>';
    });
    h += '<div class="h2">Park hours</div>';
    P.hours.forEach(function(x){
      h += '<div class="hours"><h3>' + esc(x.park) + '</h3><div class="when">' + esc(x.hours) + '</div><div class="tip">' + esc(x.tip) + '</div></div>';
    });
    h += '<div class="note">📱 Verify all times in the Disneyland app the morning of. Times shown are Pacific.</div>';
    $('#view-shows').innerHTML = h;
  }

  /* ---------- MAP ---------- */
  var map = null, markers = {}, selId = null, pendingFocus = null;
  function ll(x, y){ return [P.map.h - y, x]; }
  function badgeIcon(s, curId){
    var c = ['badge'];
    if (s.optional) c.push('opt');
    if (done[s.id]) c.push('done');
    else if (curId === s.id) c.push('cur');
    if (selId === s.id) c.push('sel');
    return L.divIcon({ className:'badge-icon', html:'<div class="' + c.join(' ') + '">' + (done[s.id] ? '✓' : s.id) + '</div>', iconSize:[46,46], iconAnchor:[23,23] });
  }
  function initMap(){
    var W = P.map.w, H = P.map.h, bounds = [[0,0],[H,W]];
    map = L.map('map', {
      crs: L.CRS.Simple, zoomControl:false, attributionControl:false,
      minZoom:-3.25, maxZoom:0.5, zoomSnap:0.25, zoomDelta:0.5, wheelPxPerZoomLevel:120,
      maxBounds: L.latLngBounds(bounds).pad(0.06), maxBoundsViscosity:0.9,
      bounceAtZoomLimits:false, tapTolerance:15, inertia:true
    });
    var ov = L.imageOverlay(P.map.file, bounds).addTo(map);
    if (P.map.fallback) ov.on('error', function(){ if (ov._url !== P.map.fallback) ov.setUrl(P.map.fallback); });
    var line = MAIN.map(function(s){ return ll(s.x, s.y); });
    L.polyline(line, { color:'#ffffff', weight:7, opacity:.85, dashArray:'1 12', lineCap:'round', interactive:false }).addTo(map);
    L.polyline(line, { color:'#c4306a', weight:3.5, opacity:.95, dashArray:'1 12', lineCap:'round', interactive:false }).addTo(map);
    P.stops.forEach(function(s){
      var m = L.marker(ll(s.x, s.y), { icon: badgeIcon(s, null), keyboard:false, riseOnHover:true });
      m.on('click', function(e){ if (e.originalEvent) L.DomEvent.stop(e.originalEvent); openSheet(s.id, true); });
      m.addTo(map);
      markers[s.id] = m;
    });
    map.on('click', closeSheet);
    var sheet = $('#sheet');
    L.DomEvent.disableClickPropagation(sheet);
    L.DomEvent.disableScrollPropagation(sheet);
    var n0 = computeNext().stop;
    if (n0) { setSeg(parkOf(n0)); map.setView(ll(n0.x, n0.y + 150), P.map.views[parkOf(n0)].zoom, { animate:false }); }
    else goPark('dl', false);
  }
  function refreshBadges(){
    if (!map) return;
    var cur = computeNext().stop, curId = cur ? cur.id : null;
    P.stops.forEach(function(s){ markers[s.id].setIcon(badgeIcon(s, curId)); });
  }
  function setSeg(park){ $$('#parkSeg button').forEach(function(b){ b.classList.toggle('on', b.dataset.park === park); }); }
  function goPark(park, animate){
    var v = P.map.views[park];
    setSeg(park);
    var target = ll(v.x, v.y);
    if (animate === false) map.setView(target, v.zoom, { animate:false });
    else map.flyTo(target, v.zoom, { duration:.6 });
  }
  function focusStop(id){
    var s = byId(id); if (!s || !map) return;
    setSeg(parkOf(s));
    var z = Math.max(map.getZoom(), P.map.views.next.zoom);
    var sheetH = $('#sheet').classList.contains('open') ? $('#sheet').offsetHeight : 0;
    var pt = map.project(ll(s.x, s.y), z).add([0, sheetH / 2]);
    map.flyTo(map.unproject(pt, z), z, { duration:.6 });
  }
  function sheetHtml(s){
    var isDone = !!done[s.id];
    return '<div class="sheet-head"><span class="num">' + s.id + '</span><div><div class="t">' + esc(s.time) + '</div><h3>' + (s.icon||'') + ' ' + esc(s.title) + '</h3></div>' +
           '<button type="button" class="sheet-close" data-act="close" aria-label="Close">✕</button></div>' +
           chipsHtml(s) + '<div class="tip">' + esc(s.tip) + '</div>' +
           '<button type="button" class="btn btn-done' + (isDone ? ' is-done' : '') + '" data-act="sheetdone" data-id="' + s.id + '">' + (isDone ? '✓ Done (tap to undo)' : '✓ Mark done') + '</button>';
  }
  function openSheet(id, focus){
    var s = byId(id); if (!s) return;
    selId = id;
    var sheet = $('#sheet');
    $('#sheetBody').innerHTML = sheetHtml(s);
    sheet.classList.add('open'); sheet.setAttribute('aria-hidden','false');
    $('#view-map').classList.add('sheet-open');
    requestAnimationFrame(function(){
      $('#view-map').style.setProperty('--sheeth', sheet.offsetHeight + 'px');
      if (focus) focusStop(id);
    });
    refreshBadges();
  }
  function closeSheet(){
    selId = null;
    var sheet = $('#sheet');
    sheet.classList.remove('open'); sheet.setAttribute('aria-hidden','true');
    $('#view-map').classList.remove('sheet-open');
    refreshBadges();
  }

  /* ---------- tabs ---------- */
  var currentTab = 'now';
  function switchTab(tab){
    currentTab = tab;
    $('#app').dataset.tab = tab;
    ['now','plan','map','shows'].forEach(function(t){ $('#view-' + t).hidden = (t !== tab); });
    $$('#tabbar button').forEach(function(b){ b.classList.toggle('on', b.dataset.tab === tab); });
    if (tab === 'map'){
      requestAnimationFrame(function(){
        if (!map) initMap();
        map.invalidateSize();
        refreshBadges();
        if (pendingFocus != null){ var id = pendingFocus; pendingFocus = null; openSheet(id, true); }
      });
    }
  }
  function showOnMap(id){ pendingFocus = id; switchTab('map'); }

  /* ---------- toast with undo ---------- */
  var toastTimer = null;
  function toast(msg, undoId){
    var t = $('#toast');
    if (!t){ t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; $('#app').appendChild(t); }
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (undoId ? '<button type="button" data-act="undo" data-id="' + undoId + '">Undo</button>' : '');
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 4000);
  }

  /* ---------- events (delegated) ---------- */
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-act],[data-tab],[data-park]');
    if (!b) return;
    if (b.dataset.tab && b.closest('#tabbar')) { switchTab(b.dataset.tab); return; }
    if (b.dataset.park && b.closest('#parkSeg')) { closeSheet(); goPark(b.dataset.park, true); return; }
    var id = b.dataset.id ? parseInt(b.dataset.id, 10) : null;
    switch (b.dataset.act){
      case 'done': {
        setDone(id, true);
        var n = computeNext().stop;
        toast(n ? 'Nice! Next: ' + n.title : 'All done!', id);
        break;
      }
      case 'undo': setDone(id, false); $('#toast').classList.remove('show'); break;
      case 'map': showOnMap(id); break;
      case 'toggle': openRowId = (openRowId === id) ? null : id; renderPlan(); break;
      case 'check': setDone(id, !done[id]); break;
      case 'close': closeSheet(); break;
      case 'gentle': switchTab('shows'); requestAnimationFrame(function(){ var g = $('#gentle'); if (g) g.scrollIntoView({ block:'start' }); }); break;
      case 'sheetdone': setDone(id, !done[id]); if (selId === id) $('#sheetBody').innerHTML = sheetHtml(byId(id)); break;
    }
  });
  $('#fabNext').addEventListener('click', function(){
    var n = computeNext().stop || MAIN[0];
    openSheet(n.id, true);
  });
  $('#resetBtn').addEventListener('click', function(){
    if (window.confirm('Clear all checkmarks? This cannot be undone.')) { done = {}; saveDone(); openRowId = null; renderAll(); }
  });

  /* ---------- render + clock ---------- */
  function renderAll(){
    renderNow(); renderPlan(); refreshBadges();
  }
  function tick(){
    $('#clock').textContent = pacific().label;
    renderAll();
  }
  $('#dateLabel').textContent = P.dateLabel;
  renderShows();
  tick();
  setInterval(tick, 30000);
  document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'visible') tick(); });
  window.addEventListener('pageshow', tick);
  window.addEventListener('resize', function(){ if (map && currentTab === 'map') map.invalidateSize(); });

  // Expose for tests
  window.__dl = { switchTab: switchTab, openSheet: openSheet, showOnMap: showOnMap, toggleRow: function(id){ openRowId = id; renderPlan(); } };

  /* ---------- offline ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.__SINGLE_FILE__){
    window.addEventListener('load', function(){ navigator.serviceWorker.register('./sw.js', { scope:'./' }).catch(function(){}); });
  }
})();
