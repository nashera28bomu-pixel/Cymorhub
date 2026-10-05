/*
  SYSTEM section (always visible). Everything except IP/provider is read from the visitor's own browser.
  IP/provider/location come from one third-party lookup (IP_LOOKUP_URL), run once when the section scrolls
  into view (set AUTO_LOOKUP = false to make it click-only). Nothing is stored or sent anywhere else.
*/
(function(){
  const IP_LOOKUP_URL = 'https://ipapi.co/json/', AUTO_LOOKUP = true;
  const $ = id => document.getElementById(id), NA = 'UNAVAILABLE';
  const set = (id, v) => { const el = $(id); if(el) el.textContent = v; };
  const pill = $('sys-pill'), sec = $('system'); if(!sec) return;
  const t0 = Date.now(), pad = n => String(n).padStart(2, '0');

  function tick(){
    const d = new Date(), tz = new Intl.DateTimeFormat([], {timeZoneName:'short'}).formatToParts(d).find(p => p.type === 'timeZoneName');
    set('sys-time', d.toLocaleTimeString([], {hour12:false}) + ' ' + (tz ? tz.value : ''));
    set('sys-date', d.toLocaleDateString([], {weekday:'short', day:'2-digit', month:'short', year:'numeric'}).toUpperCase());
    const s = Math.floor((Date.now() - t0) / 1000); set('sys-session', `${pad(Math.floor(s / 60))}:${pad(s % 60)}`);
  }
  const device = () => matchMedia('(pointer: coarse)').matches ? (innerWidth < 700 ? 'MOBILE' : 'TABLET') : 'DESKTOP';
  function browser(){
    const u = navigator.userAgentData;
    if(u && u.brands){ const b = u.brands.filter(x => !/not.?a.?brand/i.test(x.brand)).pop(); if(b) return `${b.brand} ${b.version}`.toUpperCase(); }
    const m = navigator.userAgent.match(/(Edg|OPR|Firefox|Chrome|Safari)\/([\d.]+)/);
    return m ? `${({Edg:'EDGE', OPR:'OPERA'})[m[1]] || m[1].toUpperCase()} ${m[2].split('.')[0]}` : NA;
  }
  function os(){
    const u = navigator.userAgentData; if(u && u.platform) return u.platform.toUpperCase();
    const ua = navigator.userAgent;
    return /Android/.test(ua) ? 'ANDROID' : /iPhone|iPad/.test(ua) ? 'IOS' : /Windows/.test(ua) ? 'WINDOWS' : /Mac/.test(ua) ? 'MACOS' : /Linux/.test(ua) ? 'LINUX' : NA;
  }
  function network(){
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection, on = navigator.onLine;
    set('sys-status', on ? 'ONLINE' : 'OFFLINE'); set('sys-label', on ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE');
    $('sys-status').classList.toggle('bad', !on); if(pill) pill.classList.toggle('off', !on);
    set('sys-net', on ? ((c && (c.type || '').toUpperCase()) || 'CONNECTED') : 'DISCONNECTED');
    set('sys-eff', c && c.effectiveType ? c.effectiveType.toUpperCase() : NA);
    set('sys-down', c && c.downlink ? c.downlink + ' MBPS' : NA);
    set('sys-rtt', c && c.rtt != null ? c.rtt + ' MS' : NA);
  }
  async function battery(){
    try{
      if(!navigator.getBattery) throw 0;
      const b = await navigator.getBattery();
      const show = () => { const p = Math.round(b.level * 100); set('sys-bat', p + '%'); set('sys-chg', b.charging ? 'CHARGING' : 'ON BATTERY');
        const f = $('sys-bat-fill'); f.style.width = p + '%'; f.classList.toggle('low', p <= 20); };
      show(); b.addEventListener('levelchange', show); b.addEventListener('chargingchange', show);
    }catch(e){ set('sys-bat', 'N/A'); set('sys-chg', 'NOT EXPOSED BY BROWSER'); $('sys-bat-fill').style.width = '0'; }
  }
  let looked = false;
  async function lookup(){
    const btn = $('ip-lookup'); looked = true; btn.disabled = true; btn.textContent = 'SCANNING…';
    ['sys-ip', 'sys-isp', 'sys-loc'].forEach(i => set(i, 'SCANNING…'));
    try{
      const r = await fetch(IP_LOOKUP_URL, {cache:'no-store'}); if(!r.ok) throw 0;
      const j = await r.json(); if(j.error) throw 0;
      set('sys-ip', j.ip || NA); set('sys-isp', (j.org || j.isp || NA).toUpperCase());
      set('sys-loc', ([j.city, j.country_name].filter(Boolean).join(', ') || NA).toUpperCase());
      btn.textContent = 'RESCAN';
    }catch(e){ ['sys-ip', 'sys-isp', 'sys-loc'].forEach(i => set(i, NA)); btn.textContent = 'RETRY'; }
    btn.disabled = false;
  }
  $('ip-lookup').addEventListener('click', lookup);
  if(pill) pill.addEventListener('click', () => sec.scrollIntoView({behavior:'smooth'}));
  if(AUTO_LOOKUP) new IntersectionObserver((es, io) => { if(es[0].isIntersecting && !looked){ io.disconnect(); lookup(); } }, {rootMargin:'200px'}).observe(sec);

  set('sys-device', device()); set('sys-browser', browser()); set('sys-os', os());
  set('sys-screen', `${screen.width}×${screen.height} @${(devicePixelRatio || 1).toFixed(1)}x`);
  set('sys-lang', (navigator.language || NA).toUpperCase());
  set('sys-tz', (Intl.DateTimeFormat().resolvedOptions().timeZone || NA).toUpperCase());
  set('sys-cpu', navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' CORES' : NA);
  set('sys-mem', navigator.deviceMemory ? '≥ ' + navigator.deviceMemory + ' GB' : NA);
  addEventListener('online', network); addEventListener('offline', network);
  const c = navigator.connection; if(c && c.addEventListener) c.addEventListener('change', network);
  network(); battery(); tick(); setInterval(tick, 1000);
  window.CymorSystem = { open: () => sec.scrollIntoView({behavior:'smooth'}) };
})();
