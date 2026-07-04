/* loader.js — the "CYMOR HUB / Loading... / Initializing Projects..."
   splash screen. Purely cosmetic timing, not tied to real fetch progress,
   so it always feels snappy even on a slow connection. */

(function () {
  const STAGES = [
    { pct: 20, text: "Loading assets..." },
    { pct: 45, text: "Initializing Projects..." },
    { pct: 70, text: "Waking up the bots..." },
    { pct: 92, text: "Almost there..." },
    { pct: 100, text: "Welcome." }
  ];

  function runLoader() {
    const screen = document.getElementById("loading-screen");
    const fill = document.getElementById("loader-bar-fill");
    const status = document.getElementById("loader-status");
    if (!screen || !fill || !status) return;

    let i = 0;
    function step() {
      if (i >= STAGES.length) {
        setTimeout(() => screen.classList.add("hidden"), 250);
        return;
      }
      const stage = STAGES[i];
      fill.style.width = stage.pct + "%";
      status.textContent = stage.text;
      i++;
      setTimeout(step, 320);
    }
    step();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runLoader);
  } else {
    runLoader();
  }
})();
