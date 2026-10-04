/*
  SYSTEM ONLINE telemetry. Everything is read from browser APIs the visitor's own
  browser exposes. Nothing is sent anywhere or stored — except the IP/provider lookup,
  which runs ONLY when the visitor presses the button and is never saved.
  To change the lookup service, edit IP_LOOKUP_URL (must return JSON with ip, org/isp, city, country_name).
*/
(function(){
  const IP_LOOKUP_URL = 'https://ipapi.co/json/';
  const pill = document.getElementById('sys-pill'), panel = document.getElementById('sys-panel');
  if(!pill || !panel) return;
  const $ = id => document.getElementById(id), NA = 'Unavailable';
  const set = (id, v) => { const el = $(id); if(el) el.textContent = v; };

  function tick(){
    const d = new Date();
    const tz = new Intl.DateTimeFormat([], {timeZoneName:'short'}).formatToParts(d).find(p => p.type === 'timeZoneName');
    set('sys-time', d.toLocaleTimeString([], {hour12:false}) + ' ' + (tz ? tz.value : ''));
    set('sys-tz', Intl.DateTimeFormat().resolvedOptions().timeZone || NA);
  }
  function device(){
    const w = innerWidth, touch = matchMedia('(pointer: coarse)').matches;
    return touch ? (w < 700 ? 'Mobile' : 'Tablet') : 'Desktop';
  }
  function browser(){
    const u = navigator.userAgentData;
    if(u && u.brands){ const b = u.brands.filter(x => !/not.?a.?brand/i.test(x.brand)).pop(); if(b) return `${b.brand} ${b.version}`; }
    const ua = navigator.userAgent, m = ua.match(/(Edg|OPR|Firefox|Chrome|Safari)\/([\d.]+)/);
    return m ? `${({Edg:'Edge', OPR:'Opera'})[m[1]] || m[1]} ${m[2].split('.')[0]}` : NA;
  }
  function os(){
    const u = navigator.userAgentData; if(u && u.platform) return u.platform;
    const ua = navigator.userAgent;
    return /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : NA;
  }
  function network(){
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const parts = [navigator.onLine ? 'Connected' : 'Offline'];
    if(c){ if(c.type) parts.push(c.type); if(c.effectiveType) parts.push(c.effectiveType.toUpperCase()); if(c.downlink) parts.push(c.downlink + ' Mbps'); }
    set('sys-net', parts.join(' · '));
    const on = navigator.onLine;
    set('sys-status', on ? '● ONLINE' : '● OFFLINE'); set('sys-label', on ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE');
    pill.classList.toggle('off', !on);
  }
  async function battery(){
    try{
      if(!navigator.getBattery) throw 0;
      const b = await navigator.getBattery();
      const show = () => { const p = Math.round(b.level * 100); set('sys-bat', p + '%' + (b.charging ? ' · charging' : '')); $('sys-bat-fill').style.width = p + '%'; };
      show(); b.addEventListener('levelchange', show); b.addEventListener('chargingchange', show);
    }catch(e){ set('sys-bat', 'N/A'); $('sys-bat-fill').style.width = '0'; }
  }
  async function lookup(btn){
    btn.disabled = true; btn.textContent = 'Looking up…';
    try{
      const r = await fetch(IP_LOOKUP_URL, {cache:'no-store'}); if(!r.ok) throw 0;
      const j = await r.json(); if(j.error) throw 0;
      set('sys-ip', j.ip || NA); set('sys-isp', j.org || j.isp || NA);
      set('sys-loc', [j.city, j.country_name].filter(Boolean).join(', ') || NA);
      btn.textContent = 'Done — not stored';
    }catch(e){ set('sys-ip', NA); set('sys-isp', NA); set('sys-loc', NA); btn.textContent = 'Lookup failed — retry'; btn.disabled = false; }
  }

  function open(on){
    panel.hidden = !on; pill.setAttribute('aria-expanded', on);
    if(on){ tick(); panel.querySelector('button').focus({preventScroll:true}); }
  }
  pill.addEventListener('click', () => open(panel.hidden));
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !panel.hidden){ open(false); pill.focus(); } });
  document.addEventListener('pointerdown', e => { if(!panel.hidden && !panel.contains(e.target) && !pill.contains(e.target)) open(false); });
  $('ip-lookup').addEventListener('click', e => lookup(e.currentTarget));
  addEventListener('online', network); addEventListener('offline', network);
  const c = navigator.connection; if(c && c.addEventListener) c.addEventListener('change', network);

  set('sys-device', device()); set('sys-browser', browser()); set('sys-os', os());
  network(); battery(); tick(); setInterval(() => { if(!panel.hidden) tick(); }, 1000);
  window.CymorSystem = { open: () => open(true) };
})();
