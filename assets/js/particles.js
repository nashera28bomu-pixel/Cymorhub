/* particles.js — a lightweight connected-dot background for the hero.
   No dependencies, respects prefers-reduced-motion, pauses when the
   tab isn't visible to save battery on a phone. */

(function () {
  function initParticles() {
    const canvas = document.getElementById("hero-particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles = [];
    let width, height;
    let running = true;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
      const count = Math.min(46, Math.floor((width * height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25
      }));
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(232, 163, 61, 0.55)";
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "rgba(47, 174, 131, " + (0.14 * (1 - dist / 120)) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      running = document.visibilityState === "visible" && !reduceMotion;
      if (running) requestAnimationFrame(tick);
    });

    if (!reduceMotion) {
      running = true;
      requestAnimationFrame(tick);
    } else {
      // draw a single static frame and stop
      tick_once();
    }

    function tick_once() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(232, 163, 61, 0.5)";
        ctx.fill();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initParticles);
  } else {
    initParticles();
  }
})();
