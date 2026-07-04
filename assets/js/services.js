/* services.js — loads data/services.json and renders the services grid. */

async function loadServices() {
  const grid = document.getElementById("services-grid");
  if (!grid) return;
  try {
    const res = await fetch("data/services.json");
    const services = await res.json();
    grid.innerHTML = services
      .map(
        (s) => `
      <div class="service-card fade-in-up">
        <div class="service-icon">${s.icon}</div>
        <h3>${s.name}</h3>
        <p>${s.description}</p>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error("Could not load services.json — is this running over http(s), not file://?", err);
  }
}

document.addEventListener("DOMContentLoaded", loadServices);
