(function(){
  'use strict';
  var P = window.PLAN;
  var TZ = 'America/Los_Angeles';
  var LS_KEY = 'dlr-plan-done-v4';           // v4: 21 stops, Toy Story Midway Mania added as 13
  // Older saves are migrated step by step so checkmarks survive renumbering
  var STEPS = [
    { key:'dlr-plan-done-v1', map:{1:[1],2:[2],3:[3,4],4:[5],5:[6],6:[7],7:[8],8:[9],9:[10],10:[11],11:[12],12:[13,14],13:[15],14:[16]} },
    { key:'dlr-plan-done-v2', map:{1:[1],2:[2],3:[3],4:[4],5:[5],6:[6],7:[7],8:[8],9:[9],10:[10],11:[11],12:[12],13:[13],14:[14],15:[19],16:[20]} },
    { key:'dlr-plan-done-v3', map:{1:[1],2:[2],3:[3],4:[4],5:[5],6:[6],7:[7],8:[8],9:[9],10:[10],11:[11],12:[12],13:[14],14:[15],15:[16],16:[17],17:[18],18:[19],19:[20],20:[21]} }
  ];
  (function migrate(){
    try {
      if (localStorage.getItem(LS_KEY) != null) return;
      for (var i=STEPS.length-1; i>=0; i--){
        var cur = JSON.parse(localStorage.getItem(STEPS[i].key) || 'null');
        if (!cur) continue;
        for (var j=i; j<STEPS.length; j++){
          var nu = {}, m = STEPS[j].map;
          Object.keys(cur).forEach(function(k){ if (cur[k]) (m[k] || []).forEach(function(n){ nu[n] = true; }); });
          cur = nu;
        }
        localStorage.setItem(LS_KEY, JSON.stringify(cur));
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

  /* ---------- icons (24px line icons) ---------- */
  var ICONS = {
    check:  '<path d="M4.5 12.5l4.8 4.8L19.5 7"/>',
    map:    '<path d="M9 4.5 3.5 6.8v12.7L9 17.2l6 2.3 5.5-2.3V4.5L15 6.8z"/><path d="M9 4.5v12.7M15 6.8v12.7"/>',
    pin:    '<path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    ruler:  '<path d="M3.5 15.5 15.5 3.5l5 5-12 12z"/><path d="M7.5 11.5l2 2M10.5 8.5l2 2M13.5 5.5l2 2"/>',
    bolt:   '<path d="M13.5 2.5 5 13.6h6.2L10.5 21.5 19 10.4h-6.2z" fill="currentColor" stroke-width="1.2"/>',
    warn:   '<path d="M10.3 4.3 2.6 17.6a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17h.01"/>',
    x:      '<path d="M6 6l12 12M18 6 6 18"/>',
    chev:   '<path d="m9 5.5 6.5 6.5L9 18.5"/>',
    leaf:   '<path d="M4.5 19.5C4.5 10.5 10 4.5 20 4.5c0 10-6 15.5-15.5 15z"/><path d="M4.5 19.5c3-5 6.5-8 10.5-10"/>',
    cal:    '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    ban:    '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c0-3.4 2.7-6 6-6s6 2.6 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M15.8 13.7c2.9.2 5.2 2.6 5.2 5.8"/>',
    phone:  '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    sun:    '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
    sunset: '<path d="M3 18h18M6.5 21.5h11"/><path d="M7 18a5 5 0 0 1 10 0"/><path d="M12 4v4M5 9.5l1.6 1.6M19 9.5l-1.6 1.6M2.5 14.5h2M19.5 14.5h2"/>',
    moon:   '<path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1z"/>',
    castle: '<path d="M3.5 20.5h17M5 20.5V10M8 20.5V10M4.5 10l2-3.5 2 3.5M16 20.5V10M19 20.5V10M15.5 10l2-3.5 2 3.5M9.5 20.5V8.5M14.5 20.5V8.5M9 8.5l3-5 3 5M8 13.5h1.5M14.5 13.5H16M11 20.5V18a1 1 0 0 1 2 0v2.5"/>',
    wheel:  '<circle cx="12" cy="10" r="6.5"/><path d="M12 3.5v13M5.5 10h13M7.4 5.4l9.2 9.2M16.6 5.4l-9.2 9.2M8.5 21 12 10l3.5 11M7 21h10"/>'
  };
  function ico(name, cls){
    return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }

  /* ---------- state ---------- */
  function loadDone(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch(e){ return {}; } }
  function saveDone(){ try { localStorage.setItem(LS_KEY, JSON.stringify(done)); } catch(e){} }
  var done = loadDone();
  var popId = null; // stop that was just checked, gets a one-time pop animation
  function doneCount(){ return P.stops.filter(function(s){ return !!done[s.id]; }).length; }
  function setDone(id, val){ if (val) done[id] = true; else delete done[id]; saveDone(); popId = val ? id : null; renderAll(); popId = null; }

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
  function parkCls(s){ return 'park-' + (PARK_LABEL[s.park] ? s.park : 'dl'); }

  function chipsHtml(s){
    var h = '<div class="chips">';
    h += '<span class="chip park-' + esc(s.park) + '">' + esc(PARK_LABEL[s.park] || s.park) + '</span>';
    if (s.height && s.height !== 'any') h += '<span class="chip">' + ico('ruler') + '<b>' + esc(s.height) + '</b></span>';
    if (s.ll && s.ll !== 'n/a') h += '<span class="chip ll">' + ico('bolt') + esc(s.ll) + '</span>';
    if (s.motion) h += '<span class="chip warn">' + ico('warn') + 'Motion warning</span>';
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
    var r = computeNext(), el = $('#view-now'), h = '<div class="now-band">';
    if (!r.isDay) h += '<div class="banner">' + ico('cal') + '<span>Plan for Fri Oct 9. Showing the first stop not yet done.</span></div>';
    h += '</div>';
    if (!r.stop){
      h += '<div class="next-card all-done">' +
             '<div class="nc-top"><div class="next-kicker">All done</div>' +
             '<div class="next-title"><h2>🎉 Every stop is checked off!</h2></div></div>' +
             '<div class="nc-bot"><div class="next-tip">Enjoy the fireworks. Reset in the Plan tab if needed.</div></div></div>';
    } else {
      var s = r.stop;
      h += '<div class="next-card ' + parkCls(s) + (partOf(s).key === 'evening' ? ' is-night' : '') + '">' +
             '<div class="nc-top">' +
               '<div class="nc-row"><span class="next-kicker' + (r.isNow ? ' live' : '') + '">' + (r.isNow ? 'Now' : 'Next up') + '</span><span class="nc-num">' + s.id + '</span></div>' +
               '<div class="next-time">' + esc(s.time) + '</div>' +
               '<div class="next-title"><span class="ico">' + (s.icon||'') + '</span><h2>' + esc(s.title) + '</h2></div>' +
             '</div>' +
             '<div class="nc-perf" aria-hidden="true"></div>' +
             '<div class="nc-bot">' +
               chipsHtml(s) +
               '<div class="next-tip">' + esc(s.tip) + '</div>' +
               (isThrill(s) && P.brandon ? '<button type="button" class="gentle-hint" data-act="gentle">' + ico('leaf') + '<span>Gentle options for Brandon</span>' + ico('chev', 'chev') + '</button>' : '') +
               '<div class="btn-row">' +
                 '<button type="button" class="btn btn-done" data-act="done" data-id="' + s.id + '">' + ico('check') + 'Done</button>' +
                 '<button type="button" class="btn btn-map" data-act="map" data-id="' + s.id + '">' + ico('map') + 'Map</button>' +
               '</div>' +
             '</div>' +
           '</div>';
    }
    if (r.after.length){
      h += '<h2 class="h2">After that</h2><div class="after">';
      r.after.forEach(function(s){
        h += '<button type="button" class="mini ' + parkCls(s) + '" data-act="map" data-id="' + s.id + '">' +
               '<span class="num">' + s.id + '</span>' +
               '<span class="mtxt"><span class="mt">' + esc(s.time) + '</span><span class="mn">' + esc(s.title) + '</span></span>' +
               ico('chev', 'chev') + '</button>';
      });
      h += '</div>';
    }
    h += '<div class="info-strip">' + ico('people') + '<span>' + esc(P.group) + ' · Indy closed</span></div>';
    el.innerHTML = h;
    var hp = $('#heroProgress');
    if (hp) hp.innerHTML = progressHtml();
  }

  /* ---------- PLAN ---------- */
  var openRowId = null;
  // Timeline sections by time of day
  var PARTS = [
    { key:'morning',   label:'Morning',   icon:'sun',    until:12*60 },
    { key:'afternoon', label:'Afternoon', icon:'sunset', until:18*60 },
    { key:'evening',   label:'Evening',   icon:'moon',   until:Infinity }
  ];
  function partOf(s){ for (var i=0;i<PARTS.length;i++){ if (s.minutes < PARTS[i].until) return PARTS[i]; } return PARTS[PARTS.length-1]; }
  function rowHtml(s, r){
    var isCur = !!(r.stop && r.stop.id === s.id);
    var cls = ['prow', parkCls(s), 'loc-' + parkOf(s)];
    if (done[s.id]) cls.push('done');
    if (s.optional) cls.push('opt');
    if (isCur) cls.push('current');
    if (openRowId === s.id) cls.push('open');
    if (popId === s.id) cls.push('pop');
    return '<li class="' + cls.join(' ') + '" data-id="' + s.id + '">' +
             '<span class="node" data-act="toggle" data-id="' + s.id + '" aria-hidden="true">' + (done[s.id] ? ico('check') : s.id) + '</span>' +
             '<div class="pcard">' +
               '<div class="prow-main">' +
                 '<button type="button" class="prow-hit" data-act="toggle" data-id="' + s.id + '" aria-expanded="' + (openRowId===s.id) + '">' +
                   '<span class="txt">' + (isCur ? '<span class="now-tag">' + (r.isNow ? 'Now' : 'Next up') + '</span>' : '') +
                     '<span class="t">' + esc(s.time) + '</span><span class="n">' + esc(s.title) + '</span></span>' +
                   ico('chev', 'rchev') +
                 '</button>' +
                 '<button type="button" class="ck" data-act="check" data-id="' + s.id + '" aria-label="Mark ' + esc(s.title) + ' done" aria-pressed="' + !!done[s.id] + '"><span>' + ico('check') + '</span></button>' +
               '</div>' +
               '<div class="prow-detail">' + chipsHtml(s) + '<div class="tip">' + esc(s.tip) + '</div>' +
                 '<button type="button" class="btn btn-map" data-act="map" data-id="' + s.id + '">' + ico('map') + 'Show on map</button>' +
               '</div>' +
             '</div>' +
           '</li>';
  }
  function renderPlan(){
    var r = computeNext();
    $('#planHead').innerHTML = '<div class="ttl">The plan · ' + esc(P.dateLabel) + '</div>' + progressHtml();
    var groups = [];
    P.stops.forEach(function(s){
      var part = partOf(s), g = groups[groups.length-1];
      if (!g || g.part !== part) groups.push(g = { part:part, stops:[] });
      g.stops.push(s);
    });
    var h = '';
    groups.forEach(function(g){
      var parks = [];
      g.stops.forEach(function(s){ var k = parkOf(s); if (!s.optional && parks.indexOf(k) < 0) parks.push(k); });
      h += '<li class="tl-sec tl-' + g.part.key + (g.part.key === 'evening' ? ' starfield' : '') + '">' +
             '<div class="tl-head"><span class="tl-ico">' + ico(g.part.icon) + '</span>' +
               '<div class="tl-hd"><h3 class="tl-ttl">' + g.part.label + '</h3>' +
               '<div class="tl-parks">' + parks.map(function(k){ return '<span class="tl-park park-' + k + '">' + PARK_LABEL[k] + '</span>'; }).join(ico('chev', 'tl-arrow')) + '</div></div>' +
             '</div>' +
             '<ol class="tl-list">' + g.stops.map(function(s){ return rowHtml(s, r); }).join('') + '</ol>' +
           '</li>';
    });
    $('#planList').innerHTML = h;
  }

  /* ---------- SHOWS ---------- */
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

  function renderShows(){
    var h = '<div class="note red">' + ico('ban') + '<span>Indiana Jones Adventure is closed. Skip it.</span></div>';
    h += '<div class="group-card">' + ico('people') + '<span>' + esc(P.group) + '</span></div>';
    h += '<section class="night starfield">' + FIREWORKS + '<h2 class="h2">Shows tonight</h2>';
    P.shows.forEach(function(sh){
      h += '<div class="show"><h3>' + esc(sh.name) + '</h3><div class="when">' + esc(sh.times) + '</div>' +
           '<div class="where">' + ico('pin') + '<span>' + esc(sh.where) + '</span></div>' + (sh.tip ? '<div class="tip">' + esc(sh.tip) + '</div>' : '') + '</div>';
    });
    h += '</section>';
    h += '<h2 class="h2">Park hours</h2>';
    P.hours.forEach(function(x){
      var k = /california/i.test(x.park) ? 'dca' : 'dl';
      h += '<div class="hours park-' + k + '"><span class="hico">' + ico(k === 'dca' ? 'wheel' : 'castle') + '</span>' +
           '<div><h3>' + esc(x.park) + '</h3><div class="when">' + esc(x.hours) + '</div><div class="tip">' + esc(x.tip) + '</div></div></div>';
    });
    if (P.brandon){
      var B = P.brandon, li = function(x){ return '<li><b>' + esc(x.name) + '</b><span>' + esc(x.note) + '</span></li>'; };
      h += '<section class="gentle" id="gentle"><h3><span class="gico">' + ico('leaf') + '</span>' + esc(B.title) + '</h3><p>' + esc(B.intro) + '</p>' +
           '<div class="gsub">Best picks</div><ul>' + B.picks.map(li).join('') + '</ul>' +
           '<div class="gsub">Extras</div><ul>' + B.extras.map(li).join('') + '</ul>' +
           '<div class="gsub">Tips</div><ul class="gtips">' + B.tips.map(function(t){ return '<li>' + ico('check') + '<span>' + esc(t) + '</span></li>'; }).join('') + '</ul></section>';
    }
    h += '<div class="note">' + ico('phone') + '<span>Verify all times in the Disneyland app the morning of. Times shown are Pacific.</span></div>';
    $('#view-shows').innerHTML = h;
  }

  /* ---------- MAP ---------- */
  var map = null, markers = {}, selId = null, pendingFocus = null;
  var PIN_PATH = 'M20 50.5C14 43 3 32.5 3 20a17 17 0 0 1 34 0c0 12.5-11 23-17 30.5z';
  function ll(x, y){ return [P.map.h - y, x]; }
  function badgeIcon(s, curId){
    var c = ['pin'];
    if (s.optional) c.push('opt');
    if (done[s.id]) c.push('done');
    else if (curId === s.id) c.push('cur');
    if (selId === s.id) c.push('sel');
    if (popId === s.id) c.push('pop');
    return L.divIcon({ className:'pin-icon', html:'<div class="' + c.join(' ') + '"><svg viewBox="0 0 40 52" width="40" height="52" aria-hidden="true"><path d="' + PIN_PATH + '"/></svg><b>' + (done[s.id] ? ico('check') : s.id) + '</b></div>', iconSize:[48,58], iconAnchor:[24,52] });
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
    L.polyline(line, { color:'#ffffff', weight:8, opacity:.9, dashArray:'1 12', lineCap:'round', interactive:false }).addTo(map);
    L.polyline(line, { color:'#1d237c', weight:4, opacity:.95, dashArray:'1 12', lineCap:'round', interactive:false }).addTo(map);
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
    P.stops.forEach(function(s){
      markers[s.id].setIcon(badgeIcon(s, curId));
      markers[s.id].setZIndexOffset(selId === s.id ? 1000 : (curId === s.id ? 500 : 0));
    });
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
    return '<div class="sheet-head ' + parkCls(s) + '">' +
             '<span class="sh-tile"><span class="sh-ico">' + (s.icon||'') + '</span><span class="num">' + s.id + '</span></span>' +
             '<div class="sh-txt"><div class="t">' + esc(s.time) + '</div><h3>' + esc(s.title) + '</h3></div>' +
             '<button type="button" class="sheet-close" data-act="close" aria-label="Close">' + ico('x') + '</button>' +
           '</div>' +
           chipsHtml(s) + '<div class="tip">' + esc(s.tip) + '</div>' +
           '<button type="button" class="btn btn-done' + (isDone ? ' is-done' : '') + '" data-act="sheetdone" data-id="' + s.id + '">' + ico('check') + (isDone ? 'Done (tap to undo)' : 'Mark done') + '</button>';
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
    if (sheet.contains(document.activeElement)) document.activeElement.blur();
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
    var i = -1;
    for (var k=0;k<P.stops.length;k++){ if (P.stops[k].id === selId) { i = k; break; } }
    var n = i >= 0 ? P.stops[(i + 1) % P.stops.length] : (computeNext().stop || MAIN[0]);
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
