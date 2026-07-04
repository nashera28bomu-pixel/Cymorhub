/* main.js — final wiring: pulls data/socials.json and populates every
   contact touchpoint (header CTA, hero CTA, contact section, footer
   socials) so there is exactly one place to update a phone number. */

function waLink(number) {
  const digits = number.replace(/^0/, "254").replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

async function loadSocials() {
  try {
    const res = await fetch("data/socials.json");
    const socials = await res.json();

    const primaryWa = waLink(socials.whatsapp[0]);
    document.querySelectorAll("[data-wa-link]").forEach((el) => (el.href = primaryWa));
    document.querySelectorAll("[data-mailto-link]").forEach((el) => (el.href = `mailto:${socials.email}`));

    const socialRow = document.getElementById("social-row");
    if (socialRow) {
      const chips = [
        { label: "📧 Email", href: `mailto:${socials.email}` },
        { label: "💬 WhatsApp", href: primaryWa },
        { label: "📸 " + socials.instagram[0], href: `https://instagram.com/${socials.instagram[0].replace(/^@/, "")}` },
        { label: "✈️ Telegram", href: `https://t.me/${socials.telegram}` },
        { label: "🎵 TikTok", href: `https://tiktok.com/@${socials.tiktok}` }
      ];
      socialRow.innerHTML = chips
        .map((c) => `<a class="social-chip" href="${c.href}" target="_blank" rel="noopener">${c.label}</a>`)
        .join("");
    }
  } catch (err) {
    console.error("Could not load socials.json — is this running over http(s), not file://?", err);
  }
}

document.addEventListener("DOMContentLoaded", loadSocials);
