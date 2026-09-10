(() => {
  "use strict";

  /* ------------------------------------------------------------------
     1. Smooth scroll for in-page anchor links (e.g. CTA buttons)
  ------------------------------------------------------------------ */
  document.querySelectorAll('a[data-scroll]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId.charAt(0) !== "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* ------------------------------------------------------------------
     4. Scroll reveal via IntersectionObserver
  ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll(".scroll-reveal");

  if ("IntersectionObserver" in window && revealTargets.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealTargets.forEach((target) => observer.observe(target));
  } else {
    // Fallback: show everything immediately if IO is unsupported.
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------
     5. React GradualBlur Component Port (Vanilla JavaScript Engine)
     Viewport-Wide Fixed Gradual Blur (Top & Bottom, target: 'page')
     - Bezier curve: p => p * p * (3 - 2 * p)
     - Exponential blur: Math.pow(2, progress * 4) * 0.0625 * strength
     - Mask gradient: transparent p1%, black p2%, black p3%, transparent p4%
     - Target: page, height: 7rem, strength: 2, divCount: 5
  ------------------------------------------------------------------ */
  const DEFAULT_GRADUAL_BLUR_CONFIG = {
    target: 'page',
    position: 'bottom',
    height: '7rem',
    strength: 2,
    divCount: 5,
    curve: 'bezier',
    exponential: true,
    opacity: 1,
    zIndex: 1000,
  };

  const CURVE_FUNCTIONS = {
    bezier: (p) => p * p * (3 - 2 * p),
    linear: (p) => p,
  };

  function createGradualBlur(element, options = {}) {
    const config = { ...DEFAULT_GRADUAL_BLUR_CONFIG, ...options };
    const { target, position, height, strength, divCount, curve, exponential, opacity, zIndex } = config;
    const targetEl = element || document.body;

    const isPage = target === 'page';
    const isTop = position === 'top';
    const posClass = isTop ? 'gradual-blur-top' : 'gradual-blur-bottom';

    // Remove existing gradual blur element for this specific position if present
    const existing = document.querySelector(`.${posClass}`);
    if (existing) {
      existing.remove();
    }

    // Gradual Blur Container
    const container = document.createElement('div');
    container.className = `gradual-blur ${isPage ? 'gradual-blur-page' : 'gradual-blur-parent'} ${posClass}`;
    container.setAttribute('aria-hidden', 'true');
    container.style.position = isPage ? 'fixed' : 'absolute';
    container.style.left = '0';
    container.style.right = '0';

    if (isTop) {
      container.style.top = '0';
    } else {
      container.style.bottom = '0';
    }

    container.style.width = '100%';
    container.style.height = height;
    container.style.zIndex = String(zIndex);
    container.style.pointerEvents = 'none';

    // Inner Container
    const inner = document.createElement('div');
    inner.className = 'gradual-blur-inner';
    inner.style.position = 'relative';
    inner.style.width = '100%';
    inner.style.height = '100%';
    inner.style.pointerEvents = 'none';

    const curveFunc = CURVE_FUNCTIONS[curve] || CURVE_FUNCTIONS.bezier;
    const increment = 100 / divCount;

    for (let i = 1; i <= divCount; i++) {
      const layer = document.createElement('div');
      layer.style.position = 'absolute';
      layer.style.inset = '0';
      layer.style.pointerEvents = 'none';
      layer.style.opacity = String(opacity);

      // 1. Bezier Progress
      let progress = i / divCount;
      progress = curveFunc(progress);

      // 2. Exponential Blur calculation
      const blurValue = exponential
        ? Math.pow(2, progress * 4) * 0.0625 * strength
        : progress * strength;

      // 3. Mask Stops calculation
      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;

      if (p3 <= 100) {
        gradient += `, black ${p3}%`;
      }

      if (p4 <= 100) {
        gradient += `, transparent ${p4}%`;
      }

      const direction = isTop ? 'to top' : 'to bottom';
      const maskString = `linear-gradient(${direction}, ${gradient})`;
      const blurString = `blur(${blurValue.toFixed(4)}rem)`;

      layer.style.backdropFilter = blurString;
      layer.style.webkitBackdropFilter = blurString;
      layer.style.maskImage = maskString;
      layer.style.webkitMaskImage = maskString;

      inner.appendChild(layer);
    }

    container.appendChild(inner);
    targetEl.appendChild(container);

    return container;
  }

  window.createGradualBlur = createGradualBlur;

  function initPageGradualBlur() {
    // Top Fixed Gradual Blur
    createGradualBlur(document.body, {
      target: 'page',
      position: 'top',
      height: '7rem',
      strength: 2,
      divCount: 5,
      curve: 'bezier',
      exponential: true,
      opacity: 1,
      zIndex: 1000
    });

    // Bottom Fixed Gradual Blur
    createGradualBlur(document.body, {
      target: 'page',
      position: 'bottom',
      height: '7rem',
      strength: 2,
      divCount: 5,
      curve: 'bezier',
      exponential: true,
      opacity: 1,
      zIndex: 1000
    });
  }

  function initApp() {
    initPageGradualBlur();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();

