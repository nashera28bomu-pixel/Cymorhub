/* CYMOR ACTIVITY from data/activity.json — hand-maintained: [{ "date": "2026-10-04", "text": "…", "type": "deployed" }]. Hidden when empty. */
(function(){
  const sec = document.getElementById('activity'), list = document.getElementById('activity-list');
  if(!sec) return;
  fetch('data/activity.json').then(r => r.ok ? r.json() : []).catch(() => []).then(items => {
    if(!items.length) return;
    list.innerHTML = items.slice(0, 8).map(a => `<li><i class="dot"></i><div><span class="act-date">${esc(a.date || '')}</span><p>${esc(a.text)}</p></div></li>`).join('');
    sec.hidden = false;
  });
})();
