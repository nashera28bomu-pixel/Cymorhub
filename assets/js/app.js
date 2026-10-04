/*
  Pulls contact + social info from /data/socials.json.
  Expected fields: email, whatsapp[] (local format e.g. "0113821327"),
  instagram[] (handles, no @), telegram (handle, no @), tiktok (handle, no @)
*/

function toWhatsAppUrl(localNumber, message){
  const digits = localNumber.replace(/\D/g, '').replace(/^0/, '254');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function applySocials(data){
  const message = "Hi Cymor, I'd like to talk about a project.";
  const primaryWaUrl = data.whatsapp && data.whatsapp[0]
    ? toWhatsAppUrl(data.whatsapp[0], message)
    : '#';

  window.CYMOR_WA_URL = primaryWaUrl;
  document.querySelectorAll('[data-wa-link]').forEach(el => el.setAttribute('href', primaryWaUrl));
  document.querySelectorAll('[data-mailto-link]').forEach(el => el.setAttribute('href', `mailto:${data.email || ''}`));

  const icons = [];
  if(data.whatsapp && data.whatsapp[1]){
    icons.push({ label: 'WhatsApp (alt)', href: toWhatsAppUrl(data.whatsapp[1], message), icon: '💬' });
  }
  (data.instagram || []).forEach(handle => {
    icons.push({ label: `Instagram @${handle}`, href: `https://instagram.com/${handle}`, icon: '📸' });
  });
  if(data.telegram){
    icons.push({ label: `Telegram @${data.telegram}`, href: `https://t.me/${data.telegram}`, icon: '✈️' });
  }
  if(data.tiktok){
    icons.push({ label: `TikTok @${data.tiktok}`, href: `https://tiktok.com/@${data.tiktok}`, icon: '🎵' });
  }

  const socialRow = document.getElementById('social-row');
  if(socialRow){
    socialRow.innerHTML = icons.map(s =>
      `<a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}">${s.icon}</a>`
    ).join('');
  }
}

function loadSocials(){
  fetch('data/socials.json')
    .then(res => {
      if(!res.ok) throw new Error('Failed to load socials.json');
      return res.json();
    })
    .then(applySocials)
    .catch(err => console.error(err));
}

document.addEventListener('DOMContentLoaded', () => {
  loadSocials();
});
