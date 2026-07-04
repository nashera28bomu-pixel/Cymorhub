/* animations.js — everything that isn't pure CSS:
   1. Cycles a "glow" class around the orbiting tech-stack tabs.
   2. Animates the statistics counters up when they scroll into view.
   3. Reveals experience timeline items one by one on scroll. */

(function orbitGlowCycle() {
  const tabs = () => Array.from(document.querySelectorAll(".orbit-tab"));
  let i = 0;
  function tick() {
    const list = tabs();
    if (list.length === 0) return;
    list.forEach((t) => t.classList.remove("glow"));
    list[i % list.length].classList.add("glow");
    i++;
    setTimeout(tick, 1400);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick);
  } else {
    tick();
  }
})();

(function animatedCounters() {
  function animateValue(el, target, isPercent, isInfinite) {
    if (isInfinite) { el.textContent = "∞"; return; }
    const duration = 1200;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + (isPercent ? "%" : target >= 10 ? "+" : "");
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = target + (isPercent ? "%" : "");
    }
    requestAnimationFrame(frame);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const statEls = document.querySelectorAll(".stat-value[data-target]");
    if (statEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.dataset.animated === "true") return;
          el.dataset.animated = "true";
          const raw = el.dataset.target;
          if (raw === "infinite") {
            animateValue(el, 0, false, true);
          } else {
            animateValue(el, parseInt(raw, 10), el.dataset.percent === "true", false);
          }
          observer.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    statEls.forEach((el) => observer.observe(el));
  });
})();

(function timelineReveal() {
  document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".timeline-item");
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      },
      { threshold: 0.3 }
    );
    items.forEach((el) => observer.observe(el));
  });
})();
