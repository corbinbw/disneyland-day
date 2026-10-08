(function(){
  const P = window.PLAN;
  const W = P.map.w, H = P.map.h;
  const bounds = [[0,0],[H,W]];
  const LS_KEY = 'dlr-plan-done-v1';

  function fromPixel(px,py){ return [H-py, px]; }
  function loadDone(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY)||'{}'); }catch(e){ return {}; }
  }
  function saveDone(obj){ localStorage.setItem(LS_KEY, JSON.stringify(obj)); }
  let done = loadDone();

  // Pacific clock
  function pacificNowMinutes(){
    const fmt = new Intl.DateTimeFormat('en-US',{
      timeZone: P.timezone, hour:'numeric', minute:'numeric', hour12:false,
      year:'numeric', month:'2-digit', day:'2-digit'
    });
    const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p=>[p.type,p.value]));
    const dateStr = `${parts.year}-${parts.month}-${parts.day}`;
    const mins = parseInt(parts.hour,10)*60 + parseInt(parts.minute,10);
    return { dateStr, mins };
  }

  function currentStopId(){
    const { dateStr, mins } = pacificNowMinutes();
    if(dateStr !== P.date){
      // demo: if not Oct 9, still highlight next upcoming relative to clock for rehearsal, prefer morning start
      // Use clock time anyway so UI is live
    }
    let cur = P.stops[0].id;
    for(const s of P.stops){
      if(s.optional) continue;
      if(mins >= s.minutes) cur = s.id;
    }
    return cur;
  }

  // Map
  const map = L.map('map',{
    crs: L.CRS.Simple,
    minZoom: -4,
    maxZoom: 1,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    attributionControl: false
  });
  const overlay = L.imageOverlay(P.map.file, bounds).addTo(map);
  if(P.map.fallback){ overlay.on('error', ()=>{ if(overlay._url!==P.map.fallback) overlay.setUrl(P.map.fallback); }); }
  map.fitBounds(bounds);
  map.setMaxBounds(L.latLngBounds(bounds).pad(0.12));

  const markers = {};
  const latlngs = [];

  function pinIcon(stop, isCurrent){
    const cls = ['mickey-pin', stop.optional?'opt':'', done[stop.id]?'done':'', isCurrent?'current':''].filter(Boolean).join(' ');
    return L.divIcon({
      className: cls,
      html: `<div class="pin-wrap"><span class="ear l"></span><span class="ear r"></span><div class="face">${stop.id}</div></div>`,
      iconSize: [40,40],
      iconAnchor: [20,20],
      popupAnchor: [0,-18]
    });
  }

  function popupHtml(s){
    return `<div class="popup-card">
      <h3>${s.icon||''} ${s.id}. ${s.title}</h3>
      <div class="meta">⏰ ${s.time} (Pacific)</div>
      <div class="meta">📏 Height: ${s.height}</div>
      <div class="meta">⚡ Lightning Lane: ${s.ll}</div>
      <div class="tip">${s.tip}</div>
    </div>`;
  }

  function refreshMarkers(){
    const cur = currentStopId();
    P.stops.forEach(s=>{
      const ll = fromPixel(s.x, s.y);
      if(!markers[s.id]){
        const m = L.marker(ll, {icon: pinIcon(s, s.id===cur), riseOnHover:true}).addTo(map);
        m.bindPopup(popupHtml(s), {maxWidth:300, autoPanPaddingTopLeft:[20,80], autoPanPaddingBottomRight:[20,20]});
        m.on('click', ()=> highlightRow(s.id));
        markers[s.id] = m;
        if(!s.optional) latlngs.push(ll);
      } else {
        markers[s.id].setIcon(pinIcon(s, s.id===cur));
        markers[s.id].setPopupContent(popupHtml(s));
      }
    });
  }

  // Route line (skip optional 13 in main path, draw spur)
  const mainStops = P.stops.filter(s=>!s.optional);
  const mainLine = mainStops.map(s=>fromPixel(s.x,s.y));
  L.polyline(mainLine, {color:'#fff8d0', weight:6, opacity:0.9, dashArray:'2 10', lineCap:'round'}).addTo(map);
  L.polyline(mainLine, {color:'#d89018', weight:3, opacity:0.95, dashArray:'2 10', lineCap:'round'}).addTo(map);
  // spur to WoC from 12
  const s12 = P.stops.find(s=>s.id===12), s13 = P.stops.find(s=>s.id===13);
  L.polyline([fromPixel(s12.x,s12.y), fromPixel(s13.x,s13.y)], {
    color:'#9090a0', weight:2.5, dashArray:'4 6', opacity:0.85
  }).addTo(map);

  refreshMarkers();

  function flyToStop(id){
    const s = P.stops.find(x=>x.id===id);
    if(!s) return;
    const ll = fromPixel(s.x, s.y);
    map.flyTo(ll, Math.max(map.getZoom(), -1), {duration:0.7});
    markers[id].openPopup();
    highlightRow(id);
  }

  function highlightRow(id){
    document.querySelectorAll('.row').forEach(el=>{
      el.classList.toggle('current', Number(el.dataset.id)===id);
    });
  }

  // Timeline UI
  const list = document.getElementById('timeline');
  P.stops.forEach(s=>{
    const row = document.createElement('div');
    row.className = 'row' + (done[s.id]?' done':'');
    row.dataset.id = s.id;
    row.innerHTML = `
      <input class="ck" type="checkbox" ${done[s.id]?'checked':''} aria-label="Mark done"/>
      <div class="t">${s.time}</div>
      <div>
        <div class="n"><span class="badge-sm">${s.id}</span>${s.title}</div>
        <div class="tip">${s.tip}</div>
      </div>`;
    row.addEventListener('click', (e)=>{
      if(e.target.classList.contains('ck')) return;
      flyToStop(s.id);
    });
    row.querySelector('.ck').addEventListener('click', (e)=>{
      e.stopPropagation();
      done[s.id] = e.target.checked;
      if(!e.target.checked) delete done[s.id];
      saveDone(done);
      row.classList.toggle('done', !!done[s.id]);
      refreshMarkers();
    });
    list.appendChild(row);
  });

  // Shows
  const showsEl = document.getElementById('shows');
  P.shows.forEach(sh=>{
    const d = document.createElement('div');
    d.className = 'show-card';
    d.innerHTML = `<h3>${sh.name}</h3><p>${sh.times}</p><p>${sh.where}</p>`;
    showsEl.appendChild(d);
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-body').forEach(b=>b.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.remove('hidden');
    });
  });

  // Live highlight
  function tick(){
    const cur = currentStopId();
    highlightRow(cur);
    refreshMarkers();
    const { dateStr, mins } = pacificNowMinutes();
    const hh = String(Math.floor(mins/60)).padStart(2,'0');
    const mm = String(mins%60).padStart(2,'0');
    document.getElementById('clock').textContent = `Park time ${hh}:${mm} PT · ${dateStr}`;
  }
  tick();
  setInterval(tick, 30000);

  // Start view: overview then soft zoom to rope drop after a beat
  setTimeout(()=> {
    // keep overview on load for orientation
  }, 100);

  window.flyToStop = flyToStop;
})();
