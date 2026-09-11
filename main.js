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
     2. Scroll reveal via IntersectionObserver
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
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------
     3. React GradualBlur Component Port (Vanilla JavaScript Engine)
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

    const existing = document.querySelector(`.${posClass}`);
    if (existing) {
      existing.remove();
    }

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

      let progress = i / divCount;
      progress = curveFunc(progress);

      const blurValue = exponential
        ? Math.pow(2, progress * 4) * 0.0625 * strength
        : progress * strength;

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

    return container;
  }

  window.createGradualBlur = createGradualBlur;

  /* ------------------------------------------------------------------
     4. Scroll-Driven Master Cross-Fade Experience (GSAP + ScrollTrigger)
  ------------------------------------------------------------------ */
  function initNotifyExperience() {
    const stage = document.querySelector("#hero-notify-stage");
    const hero = document.querySelector("#hero");
    const section = document.querySelector("#notify-experience");
    const selfIntro = document.querySelector("#self-intro");
    const aboutProfileSection = document.querySelector("#about-profile");
    const introSection = document.querySelector("#intro");
    const personalSnsSection = document.querySelector("#personal-sns");
    const toolsSection = document.querySelector("#tools");
    const workSection = document.querySelector("#work");

    if (!stage || !hero || !section || !selfIntro || !aboutProfileSection || !introSection || !personalSnsSection || !toolsSection || !workSection) return;

    const sticky = stage.querySelector(".hero-notify-stage__sticky");
    const inner = section.querySelector(".notify-experience__inner");
    const cards = Array.from(section.querySelectorAll(".notify-card"));
    const copies = Array.from(section.querySelectorAll(".notify-copy__item"));
    const eyebrow = selfIntro.querySelector(".self-intro__eyebrow");
    const title = selfIntro.querySelector(".self-intro__title");
    const desc = selfIntro.querySelector(".self-intro__desc");
    const tags = selfIntro.querySelector(".self-intro__tags");

    const aboutHeader = aboutProfileSection.querySelector(".about-profile__header");
    const aboutIntroCopy = aboutProfileSection.querySelector(".about-profile__intro-copy");
    const aboutNameKrInner = Array.from(aboutProfileSection.querySelectorAll(".about-profile__name-kr span"));
    const aboutNameEn = aboutProfileSection.querySelector(".about-profile__name-en");
    const aboutTitleEnInner = Array.from(aboutProfileSection.querySelectorAll(".about-profile__title-en span"));
    const aboutLocationEn = aboutProfileSection.querySelector(".about-profile__location-en");
    const aboutProfileRow = aboutProfileSection.querySelector(".about-profile__profile-row");
    const aboutJourneySection = aboutProfileSection.querySelector(".about-profile__journey-section");
    const aboutTimelineTrackFill = aboutProfileSection.querySelector(".timeline-track__fill");
    const aboutTimelineCols = Array.from(aboutProfileSection.querySelectorAll(".timeline-col"));

    const personalLabel = personalSnsSection.querySelector(".personal-sns__label");
    const personalTitle = personalSnsSection.querySelector(".personal-sns__title");
    const personalDesc = personalSnsSection.querySelector(".personal-sns__desc");
    const personalCards = Array.from(personalSnsSection.querySelectorAll(".personal-sns__card"));

    const toolsIndex = toolsSection.querySelector(".tools__index");
    const toolsTitle = toolsSection.querySelector(".tools__title");
    const toolsHeadRight = toolsSection.querySelector(".tools__head-right");
    const toolsDivider = toolsSection.querySelector(".tools__divider");
    const toolsMarqueeWrapper = toolsSection.querySelector(".tools__marquee-wrapper");
    const toolsRow1 = toolsSection.querySelector(".tools-marquee--row-1");
    const toolsRow2 = toolsSection.querySelector(".tools-marquee--row-2");
    const toolsRow3 = toolsSection.querySelector(".tools-marquee--row-3");

    const workIndex = workSection.querySelector(".work__index");
    const workTitle = workSection.querySelector(".work__title");
    const workHeadRight = workSection.querySelector(".work__head-right");
    const workDivider = workSection.querySelector(".work__divider");
    const workCard1 = workSection.querySelector(".work-card--01");
    const workCard2 = workSection.querySelector(".work-card--02");
    const workCard3 = workSection.querySelector(".work-card--03");
    const workCard4 = workSection.querySelector(".work-card--04");

    const copyData = copies.map((item) => ({
      num: item.querySelector(".notify-copy__num"),
      title: item.querySelector(".notify-copy__title"),
      desc: item.querySelector(".notify-copy__desc"),
    }));

    const masterIndicator = document.querySelector("#master-scroll-indicator");
    const sparkleBg = document.querySelector("#notify-sparkle-bg");

    function setIndicatorTheme(theme) {
      if (!masterIndicator) return;
      if (theme === "hero") {
        masterIndicator.classList.add("scroll-indicator--hero");
        masterIndicator.classList.remove("scroll-indicator--dark");
      } else {
        masterIndicator.classList.add("scroll-indicator--dark");
        masterIndicator.classList.remove("scroll-indicator--hero");
      }
    }

    const scenes = {
      hero: hero,
      notification: section,
      selfIntro: selfIntro,
      aboutProfile: aboutProfileSection,
      intro: introSection,
      personalSns: personalSnsSection,
      tools: toolsSection,
      work: workSection,
    };

    function activateScene(activeName) {
      Object.keys(scenes).forEach((key) => {
        const sec = scenes[key];
        if (sec) {
          const isActive = key === activeName;
          sec.style.pointerEvents = isActive ? "auto" : "none";
          sec.style.zIndex = isActive ? (key === "work" ? "30" : "10") : "2";

          const interactiveElems = sec.querySelectorAll("a, button, .personal-sns__card, .marquee-card, .personal-sns__cards, .vertical-marquee, .work-card, .work-card__link");
          interactiveElems.forEach((el) => {
            el.style.pointerEvents = isActive ? "auto" : "none";
          });
        }
      });
    }

    function syncPersonalSnsInteraction() {
      const snsOpacity = Number(gsap.getProperty(personalSnsSection, "opacity")) || 0;
      const toolsOpacity = Number(gsap.getProperty(toolsSection, "opacity")) || 0;
      const workOpacity = Number(gsap.getProperty(workSection, "opacity")) || 0;
      const label = typeof masterTimeline !== "undefined" && masterTimeline ? masterTimeline.currentLabel() : "";

      if (label === "work" || label === "release" || workOpacity > 0.05) {
        Object.keys(scenes).forEach((key) => {
          const sec = scenes[key];
          if (sec) {
            const isWork = key === "work";
            sec.style.pointerEvents = isWork ? "auto" : "none";
            sec.style.zIndex = isWork ? "30" : "2";

            const interactiveElems = sec.querySelectorAll("a, button, .personal-sns__card, .marquee-card, .personal-sns__cards, .vertical-marquee, .work-card, .work-card__link");
            interactiveElems.forEach((el) => {
              el.style.pointerEvents = isWork ? "auto" : "none";
            });
          }
        });
        return;
      }

      if (label && scenes[label]) {
        activateScene(label);
      }

      if (snsOpacity > 0.05) {
        personalSnsSection.style.pointerEvents = "auto";
        personalSnsSection.style.zIndex = "10";
        const snsCards = personalSnsSection.querySelectorAll(".personal-sns__card, a, button");
        snsCards.forEach((el) => { el.style.pointerEvents = "auto"; });

        if (toolsSection) {
          toolsSection.style.pointerEvents = "none";
          toolsSection.style.zIndex = "2";
          const toolsElems = toolsSection.querySelectorAll("a, button");
          toolsElems.forEach((el) => { el.style.pointerEvents = "none"; });
        }
      } else if (label === "tools" || (toolsOpacity > 0.08 && workOpacity <= 0.05)) {
        personalSnsSection.style.pointerEvents = "none";
        personalSnsSection.style.zIndex = "2";
        const snsCards = personalSnsSection.querySelectorAll(".personal-sns__card, a, button");
        snsCards.forEach((el) => { el.style.pointerEvents = "none"; });

        if (toolsSection) {
          toolsSection.style.pointerEvents = "auto";
          toolsSection.style.zIndex = "10";
          const toolsElems = toolsSection.querySelectorAll("a, button");
          toolsElems.forEach((el) => { el.style.pointerEvents = "auto"; });
        }
      }
    }

    if (!sticky || !inner || cards.length !== 5 || copies.length !== 5 || !eyebrow || !title || !desc || !tags || !toolsIndex || !toolsTitle || !toolsHeadRight || !toolsDivider || !toolsMarqueeWrapper || !toolsRow1 || !toolsRow2 || !toolsRow3 || !workIndex || !workTitle || !workHeadRight || !workDivider || !workCard1 || !workCard2 || !workCard3 || !workCard4) {
      console.warn("[Notify Experience] Missing required elements for master timeline.");
      return;
    }

    // Prefers Reduced Motion fallback (Display Hero only without overlapping absolute scenes)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hero.style.opacity = "1";
      hero.style.visibility = "visible";
      hero.style.transform = "none";
      hero.style.pointerEvents = "auto";

      [section, selfIntro, aboutProfileSection, introSection, personalSnsSection, toolsSection, workSection].forEach((sec) => {
        sec.style.opacity = "0";
        sec.style.pointerEvents = "none";
      });

      if (masterIndicator) {
        masterIndicator.style.opacity = "1";
        masterIndicator.style.visibility = "visible";
        setIndicatorTheme("hero");
      }
      return;
    }

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Initial Scene States
      gsap.set(hero, {
        opacity: 1,
        scale: 1,
        visibility: "visible",
        pointerEvents: "auto",
      });

      if (masterIndicator) {
        gsap.set(masterIndicator, {
          opacity: 1,
          visibility: "visible",
          pointerEvents: "none",
        });
        setIndicatorTheme("hero");
      }

      gsap.set(section, {
        visibility: "visible",
        pointerEvents: "none",
      });
      if (sparkleBg) {
        gsap.set(sparkleBg, { opacity: 0 });
      }
      gsap.set(inner, {
        opacity: 0,
        y: 40,
        scale: 1.01,
      });
      gsap.set(cards, {
        opacity: 0,
        y: 55,
        scale: 0.94,
        filter: "blur(4px)",
      });
      gsap.set([copyData[0].num, copyData[0].title], {
        yPercent: 0,
        opacity: 1,
        filter: "blur(0px)",
      });
      gsap.set(copyData[0].desc, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
      });
      for (let i = 1; i < copyData.length; i++) {
        gsap.set(copyData[i].num, { yPercent: 100, opacity: 0, filter: "blur(3px)" });
        gsap.set(copyData[i].title, { yPercent: 110, opacity: 0, filter: "blur(3px)" });
        gsap.set(copyData[i].desc, { y: 20, opacity: 0, filter: "blur(3px)" });
      }

      gsap.set(selfIntro, {
        visibility: "visible",
        pointerEvents: "none",
      });
      gsap.set(eyebrow, { opacity: 0, y: 24 });
      gsap.set(title, { opacity: 0, y: 45 });
      gsap.set(desc, { opacity: 0, y: 30 });
      gsap.set(tags, { opacity: 0, y: 20 });

      gsap.set(aboutProfileSection, {
        opacity: 0,
        y: 30,
        scale: 0.99,
        visibility: "visible",
        pointerEvents: "none",
      });
      if (aboutHeader) gsap.set(aboutHeader, { opacity: 0, y: 15 });
      if (aboutIntroCopy) gsap.set(aboutIntroCopy, { opacity: 0, y: 15 });
      if (aboutNameKrInner.length) gsap.set(aboutNameKrInner, { y: "110%", opacity: 0 });
      if (aboutNameEn) gsap.set(aboutNameEn, { opacity: 0, y: 10 });
      if (aboutTitleEnInner.length) gsap.set(aboutTitleEnInner, { y: "110%", opacity: 0 });
      if (aboutLocationEn) gsap.set(aboutLocationEn, { opacity: 0, y: 10 });
      if (aboutProfileRow) gsap.set(aboutProfileRow, { opacity: 0, y: 18 });
      if (aboutJourneySection) gsap.set(aboutJourneySection, { opacity: 0, y: 22 });
      if (aboutTimelineTrackFill) gsap.set(aboutTimelineTrackFill, { scaleX: 0, transformOrigin: "left center" });
      if (aboutTimelineCols.length) gsap.set(aboutTimelineCols, { opacity: 0, y: 14, scale: 0.96 });

      gsap.set(introSection, {
        opacity: 0,
        y: 30,
        scale: 1,
        visibility: "visible",
        pointerEvents: "none",
      });

      gsap.set(personalSnsSection, {
        opacity: 0,
        y: 30,
        scale: 0.99,
        visibility: "visible",
        pointerEvents: "none",
      });
      if (personalLabel) gsap.set(personalLabel, { opacity: 0, y: 20 });
      if (personalTitle) gsap.set(personalTitle, { opacity: 0, y: 32 });
      if (personalDesc) gsap.set(personalDesc, { opacity: 0, y: 24 });
      if (personalCards.length) gsap.set(personalCards, { opacity: 0, y: 30, scale: 0.96 });

      gsap.set(toolsSection, {
        opacity: 0,
        y: 30,
        scale: 0.99,
        visibility: "visible",
        pointerEvents: "none",
      });
      gsap.set(toolsIndex, { opacity: 0, y: 20 });
      gsap.set(toolsTitle, { opacity: 0, y: 30 });
      gsap.set(toolsHeadRight, { opacity: 0, y: 20 });
      gsap.set(toolsDivider, { opacity: 0, scaleX: 0, transformOrigin: "left center" });
      gsap.set(toolsMarqueeWrapper, { opacity: 0 });
      gsap.set([toolsRow1, toolsRow2, toolsRow3], {
        opacity: 0,
        y: 32,
        scale: 0.98,
        filter: "blur(4px)",
      });

      gsap.set(workSection, {
        opacity: 0,
        y: 30,
        scale: 0.99,
        visibility: "visible",
        pointerEvents: "none",
      });
      gsap.set([workIndex, workTitle, workHeadRight, workDivider], { opacity: 0, y: 24 });
      gsap.set([workCard1, workCard2, workCard3, workCard4], {
        opacity: 0,
        y: 28,
        filter: "blur(4px)",
      });

      // Master Timeline (Exactly 1 ScrollTrigger)
      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "+=26500",
          pin: sticky,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: () => {
            const label = masterTimeline.currentLabel();
            if (label && scenes[label]) {
              activateScene(label);
              setIndicatorTheme(label === "hero" ? "hero" : "dark");
            } else if (label === "release") {
              activateScene("work");
              setIndicatorTheme("dark");
            }

            syncPersonalSnsInteraction();
          },
        },
      });

      // [LABEL 1: HERO - CLEAN ORIGINAL VIDEO EXPERIENCE]
      masterTimeline
        .addLabel("hero")
        .call(() => {
          activateScene("hero");
          setIndicatorTheme("hero");
        })
        .to(sparkleBg, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.5 });

      // [LABEL 2: NOTIFICATION]
      masterTimeline
        .addLabel("notification")
        .call(() => {
          activateScene("notification");
          setIndicatorTheme("dark");
        })
        // Hero -> Notification Cross-Fade
        .to(hero, { opacity: 0, scale: 0.985, duration: 1.2, ease: "power2.inOut" })
        .to(inner, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power2.inOut" }, "<")
        .to(cards[0], { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" }, "-=0.8")
        .to(sparkleBg, { opacity: 1, "--sparkle-color-main": "#5F8CFF", "--sparkle-color-sec": "#86C8FF", "--glow-color": "rgba(110, 160, 255, 0.04)", "--aurora-color": "rgba(110, 160, 255, 0.08)", "--aurora-color-2": "rgba(150, 195, 255, 0.055)", "--aurora-pos-1": "18% 22%", "--aurora-pos-2": "75% 70%", duration: 0.8 }, "<")
        .to({}, { duration: 0.5 })

        // 02 PROJECT
        .to(cards[0], { y: -8, scale: 0.988, opacity: 0.92, duration: 0.8, ease: "power2.out" })
        .to(cards[1], { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" }, "<")
        .to(sparkleBg, { "--sparkle-color-main": "#9B6DFF", "--sparkle-color-sec": "#C39BFF", "--glow-color": "rgba(140, 100, 240, 0.035)", "--aurora-color": "rgba(140, 100, 240, 0.075)", "--aurora-color-2": "rgba(215, 130, 210, 0.045)", "--aurora-pos-1": "30% 20%", "--aurora-pos-2": "70% 75%", duration: 0.8 }, "<")
        .to(copyData[0].num, { yPercent: -100, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<")
        .to(copyData[0].title, { yPercent: -110, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<+=0.05")
        .to(copyData[0].desc, { y: -20, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<+=0.05")
        .to(copyData[1].num, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.08")
        .to(copyData[1].title, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.05")
        .to(copyData[1].desc, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.05")
        .to({}, { duration: 0.6 })

        // 03 SNS
        .to(cards[0], { y: -16, scale: 0.976, opacity: 0.84, duration: 0.8, ease: "power2.out" })
        .to(cards[1], { y: -8, scale: 0.988, opacity: 0.92, duration: 0.8, ease: "power2.out" }, "<")
        .to(cards[2], { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" }, "<")
        .to(sparkleBg, { "--sparkle-color-main": "#E96BCB", "--sparkle-color-sec": "#FF9FD8", "--glow-color": "rgba(233, 115, 203, 0.035)", "--aurora-color": "rgba(233, 115, 203, 0.075)", "--aurora-color-2": "rgba(255, 160, 215, 0.045)", "--aurora-pos-1": "70% 30%", "--aurora-pos-2": "20% 80%", duration: 0.8 }, "<")
        .to(copyData[1].num, { yPercent: -100, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<")
        .to(copyData[1].title, { yPercent: -110, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<+=0.05")
        .to(copyData[1].desc, { y: -20, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<+=0.05")
        .to(copyData[2].num, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.08")
        .to(copyData[2].title, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.05")
        .to(copyData[2].desc, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.05")
        .to({}, { duration: 0.6 })

        // 04 COLLAB
        .to(cards[0], { y: -24, scale: 0.964, opacity: 0.76, duration: 0.8, ease: "power2.out" })
        .to(cards[1], { y: -16, scale: 0.976, opacity: 0.84, duration: 0.8, ease: "power2.out" }, "<")
        .to(cards[2], { y: -8, scale: 0.988, opacity: 0.92, duration: 0.8, ease: "power2.out" }, "<")
        .to(cards[3], { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" }, "<")
        .to(sparkleBg, { "--sparkle-color-main": "#36CFC2", "--sparkle-color-sec": "#72E0C2", "--glow-color": "rgba(45, 200, 185, 0.038)", "--aurora-color": "rgba(45, 200, 185, 0.075)", "--aurora-color-2": "rgba(100, 220, 190, 0.05)", "--aurora-pos-1": "82% 35%", "--aurora-pos-2": "25% 75%", duration: 0.8 }, "<")
        .to(copyData[2].num, { yPercent: -100, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<")
        .to(copyData[2].title, { yPercent: -110, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<+=0.05")
        .to(copyData[2].desc, { y: -20, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<+=0.05")
        .to(copyData[3].num, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.08")
        .to(copyData[3].title, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.05")
        .to(copyData[3].desc, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.05")
        .to({}, { duration: 0.6 })

        // 05 COMMUNICATION
        .to(cards[0], { y: -32, scale: 0.95, opacity: 0.68, duration: 0.8, ease: "power2.out" })
        .to(cards[1], { y: -24, scale: 0.964, opacity: 0.76, duration: 0.8, ease: "power2.out" }, "<")
        .to(cards[2], { y: -16, scale: 0.976, opacity: 0.84, duration: 0.8, ease: "power2.out" }, "<")
        .to(cards[3], { y: -8, scale: 0.988, opacity: 0.92, duration: 0.8, ease: "power2.out" }, "<")
        .to(cards[4], { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" }, "<")
        .to(sparkleBg, { "--sparkle-color-main": "#F2A65A", "--sparkle-color-sec": "#F6C453", "--glow-color": "rgba(242, 180, 100, 0.035)", "--aurora-color": "rgba(242, 180, 100, 0.07)", "--aurora-color-2": "rgba(246, 210, 130, 0.045)", "--aurora-pos-1": "88% 20%", "--aurora-pos-2": "12% 80%", duration: 0.8 }, "<")
        .to(copyData[3].num, { yPercent: -100, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<")
        .to(copyData[3].title, { yPercent: -110, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<+=0.05")
        .to(copyData[3].desc, { y: -20, opacity: 0, filter: "blur(3px)", duration: 0.38, ease: "power2.in" }, "<+=0.05")
        .to(copyData[4].num, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.08")
        .to(copyData[4].title, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.05")
        .to(copyData[4].desc, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, "<+=0.05")
        .to({}, { duration: 0.8 });

      // [LABEL 3: SELF INTRO - VERY PALE ICE BLUE LIGHT TINT]
      masterTimeline
        .addLabel("selfIntro")
        .call(() => {
          activateScene("selfIntro");
          setIndicatorTheme("dark");
        })
        // Notification 05 -> Self Intro Cross-Fade & Quick Color Shift (Initial 25% duration)
        .to(inner, { opacity: 0, scale: 0.985, duration: 1.1, ease: "power2.inOut" })
        .to(sparkleBg, { "--sparkle-color-main": "#5F8CFF", "--sparkle-color-sec": "#86C8FF", "--glow-color": "rgba(110, 160, 255, 0.04)", "--aurora-color": "rgba(110, 160, 255, 0.08)", "--aurora-color-2": "rgba(150, 195, 255, 0.055)", "--aurora-pos-1": "18% 22%", "--aurora-pos-2": "75% 70%", duration: 0.35, ease: "power2.out" }, "<")
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.9")
        .to(title, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
        .to(desc, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
        .to(tags, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
        .to({}, { duration: 0.8 });

      // [LABEL 3.5: ABOUT / PROFILE - SOFT SKY BLUE & VERY LIGHT LAVENDER TINT]
      masterTimeline
        .addLabel("aboutProfile")
        .call(() => {
          activateScene("aboutProfile");
          setIndicatorTheme("dark");
        })
        // Self Intro -> About Profile Cross-Fade
        .to([eyebrow, title, desc, tags], { opacity: 0, scale: 0.99, duration: 1.1, ease: "power2.inOut" })
        .to(aboutProfileSection, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(sparkleBg, { "--sparkle-color-main": "#4A63E0", "--sparkle-color-sec": "#9B72CF", "--glow-color": "rgba(74, 99, 224, 0.04)", "--aurora-color": "rgba(120, 100, 240, 0.075)", "--aurora-color-2": "rgba(185, 140, 235, 0.045)", "--aurora-pos-1": "35% 25%", "--aurora-pos-2": "65% 75%", duration: 0.35, ease: "power2.out" }, "<")
        .to(aboutHeader, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.5")
        .to(aboutIntroCopy, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.35")
        .to(aboutNameKrInner, { y: "0%", opacity: 1, duration: 0.65, stagger: 0.08, ease: "power3.out" }, "-=0.3")
        .to(aboutNameEn, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, "-=0.4")
        .to(aboutTitleEnInner, { y: "0%", opacity: 1, duration: 0.65, stagger: 0.1, ease: "power3.out" }, "-=0.5")
        .to(aboutLocationEn, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, "-=0.4")
        .to(aboutProfileRow, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3")
        .to(aboutJourneySection, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3")
        .to(aboutTimelineTrackFill, { scaleX: 1, duration: 0.5, ease: "power2.out" }, "-=0.25")
        .to(aboutTimelineCols, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.14, ease: "power3.out" }, "-=0.2")
        .to({}, { duration: 0.9 });

      // [LABEL 4: INTRO / WORKED WITH - PALE AQUA / LIGHT MINT TINT]
      masterTimeline
        .addLabel("intro")
        .call(() => {
          activateScene("intro");
          setIndicatorTheme("dark");
        })
        // About Profile -> Intro Cross-Fade & Quick Color Shift (Initial 25% duration)
        .to(aboutProfileSection, { opacity: 0, scale: 0.985, duration: 1.1, ease: "power2.inOut" })
        .to(introSection, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(sparkleBg, { "--sparkle-color-main": "#36CFC2", "--sparkle-color-sec": "#72E0C2", "--glow-color": "rgba(45, 200, 185, 0.038)", "--aurora-color": "rgba(45, 200, 185, 0.075)", "--aurora-color-2": "rgba(100, 220, 190, 0.05)", "--aurora-pos-1": "82% 35%", "--aurora-pos-2": "25% 75%", duration: 0.35, ease: "power2.out" }, "<")
        .to({}, { duration: 0.8 });

      // [LABEL 4.5: PERSONAL SNS - SOFT ICE BLUE / PINK / LAVENDER LIGHT TINT]
      masterTimeline
        .addLabel("personalSns")
        .call(() => {
          activateScene("personalSns");
          setIndicatorTheme("dark");
        })
        // Intro -> Personal SNS Cross-Fade
        .to(introSection, { opacity: 0, scale: 0.985, duration: 1.1, ease: "power2.inOut" })
        .to(personalSnsSection, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(sparkleBg, { "--sparkle-color-main": "#5F8CFF", "--sparkle-color-sec": "#E96BCB", "--glow-color": "rgba(110, 160, 255, 0.04)", "--aurora-color": "rgba(140, 100, 240, 0.075)", "--aurora-color-2": "rgba(233, 115, 203, 0.045)", "--aurora-pos-1": "50% 30%", "--aurora-pos-2": "25% 75%", duration: 0.35, ease: "power2.out" }, "<")
        .to(personalLabel, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.5")
        .to(personalTitle, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .to(personalDesc, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.4")
        .to(personalCards[0], { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }, "-=0.3")
        .to(personalCards[1], { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }, "-=0.4")
        .to(personalCards[2], { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }, "-=0.4")
        .to({}, { duration: 1.6 });

      // [LABEL 5: TOOLS & WORKFLOW - PALE LAVENDER / SOFT PINK TINT]
      masterTimeline
        .addLabel("tools")
        .call(() => {
          activateScene("tools");
          setIndicatorTheme("dark");
        })
        // Personal SNS -> Tools Cross-Fade & Quick Color Shift (Initial 25% duration)
        .to(personalSnsSection, { opacity: 0, scale: 0.985, duration: 1.4, ease: "power2.inOut" })
        .to(toolsSection, { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: "power2.inOut" }, "<")
        .to(sparkleBg, { "--sparkle-color-main": "#8B5CF6", "--sparkle-color-sec": "#D65ACF", "--glow-color": "rgba(140, 100, 240, 0.035)", "--aurora-color": "rgba(140, 100, 240, 0.075)", "--aurora-color-2": "rgba(215, 130, 210, 0.045)", "--aurora-pos-1": "50% 68%", "--aurora-pos-2": "20% 25%", duration: 0.35, ease: "power2.out" }, "<")
        .to(toolsIndex, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.4")
        .to(toolsTitle, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
        .to(toolsHeadRight, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3")
        .to(toolsDivider, { opacity: 1, scaleX: 1, duration: 0.5, ease: "power3.out" }, "-=0.3")
        .to(toolsMarqueeWrapper, { opacity: 1, duration: 0.4, ease: "power2.out" }, "-=0.2")
        .to(toolsRow1, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.0, ease: "power2.out" })
        .to(toolsRow2, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.0, ease: "power2.out" }, "-=0.5")
        .to(toolsRow3, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.0, ease: "power2.out" }, "-=0.5")
        .to({}, { duration: 0.8 });

      // [LABEL 6: WORK - WARM IVORY / SOFT GOLD LIGHT TINT]
      masterTimeline
        .addLabel("work")
        .call(() => {
          activateScene("work");
          setIndicatorTheme("dark");
        })
        // Tools -> Work Cross-Fade & Quick Color Shift (Initial 25% duration)
        .to(toolsSection, { opacity: 0, scale: 0.985, duration: 1.2, ease: "power2.inOut" })
        .to(workSection, { opacity: 1, y: 0, scale: 1, visibility: "visible", duration: 1.2, ease: "power2.inOut" }, "<")
        .to(sparkleBg, { "--sparkle-color-main": "#F2A65A", "--sparkle-color-sec": "#F6C453", "--glow-color": "rgba(242, 180, 100, 0.035)", "--aurora-color": "rgba(242, 180, 100, 0.07)", "--aurora-color-2": "rgba(246, 210, 130, 0.045)", "--aurora-pos-1": "88% 20%", "--aurora-pos-2": "12% 80%", duration: 0.35, ease: "power2.out" }, "<")
        .to(workIndex, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, "-=0.4")
        .to(workTitle, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3")
        .to(workHeadRight, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.3")
        .to(workDivider, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.3")
        .to(workCard1, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }, "-=0.2")
        .to(workCard2, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }, "-=0.1")
        .to(workCard3, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }, "-=0.1")
        .to(workCard4, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }, "-=0.1")
        .to({}, { duration: 1.0 });

      // [LABEL 7: RELEASE - FOOTER SOFT NEUTRAL TRANSITION]
      masterTimeline
        .addLabel("release")
        .to(masterIndicator ? masterIndicator : {}, { opacity: 0, duration: 0.6, ease: "power2.inOut" })
        .to(sparkleBg, { "--glow-color": "rgba(220, 225, 235, 0.01)", "--aurora-color": "rgba(245, 247, 250, 0.02)", "--aurora-color-2": "rgba(240, 242, 248, 0.01)", opacity: 0.25, duration: 0.6, ease: "power2.out" }, "<")
        .to({}, { duration: 0.5 })
        .set(workSection, {
          opacity: 1,
          y: 0,
          scale: 1,
          visibility: "visible",
          pointerEvents: "auto",
        })
        .set([workIndex, workTitle, workHeadRight, workDivider, workCard1, workCard2, workCard3, workCard4], {
          opacity: 1,
        });

      ScrollTrigger.refresh();
    } else {
      hero.style.opacity = "1";
      hero.style.visibility = "visible";
      hero.style.transform = "none";
      hero.style.pointerEvents = "auto";

      [section, selfIntro, introSection, toolsSection, workSection].forEach((sec) => {
        sec.style.opacity = "0";
        sec.style.pointerEvents = "none";
      });

      if (masterIndicator) {
        masterIndicator.style.opacity = "1";
        masterIndicator.style.visibility = "visible";
        setIndicatorTheme("hero");
      }
    }
  }

  function initVerticalMarqueeHover() {
    const columns = document.querySelectorAll(".marquee-column");
    columns.forEach((column) => {
      const track = column.querySelector(".marquee-track");
      if (!track) return;

      column.addEventListener("mouseenter", () => {
        track.style.animationPlayState = "paused";
      });

      column.addEventListener("mouseleave", () => {
        track.style.animationPlayState = "running";
      });
    });

    document.querySelectorAll(".marquee-card[href='#']").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
      });
    });
  }

  /* ------------------------------------------------------------------
     5. Starlight Custom Cursor Engine
  ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
     5. Starlight Custom Cursor Engine (Bulletproof Stability)
  ------------------------------------------------------------------ */
  let cursorRafId = null;

  function initStarlightCursor() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.__starlightCursorInitialized) return;
    window.__starlightCursorInitialized = true;

    let cursor = document.querySelector("#starlight-cursor");
    let trailContainer = document.querySelector("#starlight-trail-container");

    const energyHTML = `
      <div class="starlight-cursor__ring"></div>
      <div class="starlight-cursor__core">
        <div class="energy-diamond"></div>
      </div>
    `;

    if (!cursor) {
      cursor = document.createElement("div");
      cursor.id = "starlight-cursor";
      cursor.className = "starlight-cursor";
      cursor.setAttribute("aria-hidden", "true");
      cursor.innerHTML = energyHTML;
      document.body.appendChild(cursor);
    } else if (!cursor.querySelector(".starlight-cursor__ring")) {
      cursor.innerHTML = energyHTML;
    }

    if (!trailContainer) {
      trailContainer = document.createElement("div");
      trailContainer.id = "starlight-trail-container";
      trailContainer.className = "starlight-trail-container";
      trailContainer.setAttribute("aria-hidden", "true");
      document.body.appendChild(trailContainer);
    }

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isInitialized = false;
    let isHovered = false;

    const LERP = 0.28;

    function resetCursorStates() {
      isHovered = false;
      cursor.classList.remove("is-hover", "is-clicked");
    }

    function spawnStreakTrail(x, y, dx, dy, speed) {
      if (!trailContainer) return;
      if (speed < 2) return;

      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const streakLen = Math.min(65, speed * 2.4);

      const streak = document.createElement("div");
      streak.className = "energy-trail-streak";
      streak.style.width = streakLen + "px";
      streak.style.setProperty("--tx", x + "px");
      streak.style.setProperty("--ty", y + "px");
      streak.style.setProperty("--angle", (angle + 180) + "deg");
      streak.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle + 180}deg)`;

      trailContainer.appendChild(streak);

      setTimeout(() => {
        if (streak.parentNode) streak.remove();
      }, 320);

      // Fast move gold shards
      if (speed > 10 && Math.random() < 0.65) {
        spawnGoldShard(x, y, angle);
      }
    }

    function spawnGoldShard(x, y, baseAngle) {
      if (!trailContainer) return;
      const shard = document.createElement("div");
      shard.className = "energy-gold-shard";

      const spreadAngle = (baseAngle + 180 + (Math.random() * 60 - 30)) * (Math.PI / 180);
      const dist = 12 + Math.random() * 24;
      const endX = x + Math.cos(spreadAngle) * dist;
      const endY = y + Math.sin(spreadAngle) * dist;

      shard.style.setProperty("--sx", x + "px");
      shard.style.setProperty("--sy", y + "px");
      shard.style.setProperty("--ex", endX + "px");
      shard.style.setProperty("--ey", endY + "px");

      trailContainer.appendChild(shard);

      setTimeout(() => {
        if (shard.parentNode) shard.remove();
      }, 400);
    }

    function triggerClickBurst(x, y) {
      if (!trailContainer) return;

      // 1. Ripple
      const ripple = document.createElement("div");
      ripple.className = "energy-click-ripple";
      ripple.style.setProperty("--rx", x + "px");
      ripple.style.setProperty("--ry", y + "px");
      trailContainer.appendChild(ripple);

      setTimeout(() => {
        if (ripple.parentNode) ripple.remove();
      }, 420);

      // 2. Gold Diamond Shard Burst
      const count = 8;
      for (let i = 0; i < count; i++) {
        const rad = (i * (360 / count) + (Math.random() * 20 - 10)) * (Math.PI / 180);
        const dist = 20 + Math.random() * 25;
        const endX = x + Math.cos(rad) * dist;
        const endY = y + Math.sin(rad) * dist;

        const shard = document.createElement("div");
        shard.className = "energy-gold-shard";
        shard.style.setProperty("--sx", x + "px");
        shard.style.setProperty("--sy", y + "px");
        shard.style.setProperty("--ex", endX + "px");
        shard.style.setProperty("--ey", endY + "px");
        trailContainer.appendChild(shard);

        setTimeout(() => {
          if (shard.parentNode) shard.remove();
        }, 400);
      }
    }

    function onMouseMove(e) {
      const prevX = targetX;
      const prevY = targetY;
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isInitialized) {
        currentX = targetX;
        currentY = targetY;
        isInitialized = true;
        document.body.classList.add("cursor-enabled");
      }

      cursor.classList.remove("is-hidden");

      const dx = targetX - prevX;
      const dy = targetY - prevY;
      const speed = Math.hypot(dx, dy);

      spawnStreakTrail(targetX, targetY, dx, dy, speed);
    }

    function render() {
      if (isInitialized) {
        currentX += (targetX - currentX) * LERP;
        currentY += (targetY - currentY) * LERP;
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      cursorRafId = requestAnimationFrame(render);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    document.addEventListener("mouseleave", () => {
      cursor.classList.add("is-hidden");
      resetCursorStates();
    });

    document.addEventListener("mouseenter", (e) => {
      cursor.classList.remove("is-hidden");
      targetX = e.clientX;
      targetY = e.clientY;
    });

    window.addEventListener("blur", () => {
      cursor.classList.add("is-hidden");
      resetCursorStates();
    });

    window.addEventListener("focus", () => {
      cursor.classList.remove("is-hidden");
    });

    const interactiveSelectors = "a, button, [role='button'], input, label, select, .marquee-card, .tools-item, .work-card__link, .notify-card, .intro__card, .project-archive__item, .project-archive__btn, .project-archive-modal__close, .marketing-menu__item, .marketing-menu-modal__close";

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(interactiveSelectors)) {
        if (!isHovered) {
          isHovered = true;
          cursor.classList.add("is-hover");
        }
      }
    }, { passive: true });

    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(interactiveSelectors)) {
        const related = e.relatedTarget;
        if (!related || !related.closest(interactiveSelectors)) {
          isHovered = false;
          cursor.classList.remove("is-hover");
        }
      }
    }, { passive: true });

    document.addEventListener("mousedown", (e) => {
      cursor.classList.add("is-clicked");
      triggerClickBurst(e.clientX, e.clientY);
      setTimeout(() => {
        cursor.classList.remove("is-clicked");
      }, 250);
    }, { passive: true });

    if (cursorRafId) cancelAnimationFrame(cursorRafId);
    cursorRafId = requestAnimationFrame(render);
  }

  function initGlobal3DTiltSystem() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tiltConfigs = [
      { selector: ".work-card__link", maxRx: 8.0, maxRy: 10.0 },
      { selector: ".marquee-card", maxRx: 7.0, maxRy: 9.0 },
      { selector: ".intro__card", maxRx: 5.0, maxRy: 7.0 },
      { selector: ".notify-card__glass", maxRx: 4.0, maxRy: 6.0 },
      { selector: ".tools-item", maxRx: 4.0, maxRy: 6.0 }
    ];

    tiltConfigs.forEach((config) => {
      const elements = document.querySelectorAll(config.selector);

      elements.forEach((el) => {
        const href = el.getAttribute("href");
        if (href === "#") return;

        let rect = null;
        let rafId = null;
        let mousePos = { clientX: 0, clientY: 0 };

        function updateRect() {
          rect = el.getBoundingClientRect();
        }

        function calculateTilt() {
          if (!rect) updateRect();
          if (!rect || rect.width === 0 || rect.height === 0) return;

          const x = mousePos.clientX - rect.left;
          const y = mousePos.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const mouseX = Math.min(100, Math.max(0, Math.round((x / rect.width) * 100)));
          const mouseY = Math.min(100, Math.max(0, Math.round((y / rect.height) * 100)));

          el.style.setProperty("--mouse-x", `${mouseX}%`);
          el.style.setProperty("--mouse-y", `${mouseY}%`);

          const normX = (x - centerX) / centerX;
          const normY = (y - centerY) / centerY;

          const rotateX = (-normY * config.maxRx).toFixed(2);
          const rotateY = (normX * config.maxRy).toFixed(2);

          el.style.setProperty("--rx", `${rotateX}deg`);
          el.style.setProperty("--ry", `${rotateY}deg`);

          rafId = null;
        }

        el.addEventListener("pointerenter", () => {
          updateRect();
        });

        window.addEventListener("resize", updateRect, { passive: true });

        el.addEventListener("pointermove", (e) => {
          mousePos.clientX = e.clientX;
          mousePos.clientY = e.clientY;

          if (!rafId) {
            rafId = requestAnimationFrame(calculateTilt);
          }
        });

        el.addEventListener("pointerleave", () => {
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          el.style.setProperty("--rx", "0deg");
          el.style.setProperty("--ry", "0deg");
          el.style.setProperty("--mouse-x", "50%");
          el.style.setProperty("--mouse-y", "50%");
        });
      });
    });
  }

  function setupModalSystem(modalSelector, backdropSelector, panelSelector, closeSelector, triggerSelector) {
    const modal = document.querySelector(modalSelector);
    const backdrop = document.querySelector(backdropSelector);
    const panel = modal ? modal.querySelector(panelSelector) : null;
    const closeBtn = document.querySelector(closeSelector);
    const triggers = document.querySelectorAll(triggerSelector);

    if (!modal || !closeBtn || !backdrop || !panel) return;

    let previousActiveElement = null;

    function openModal() {
      previousActiveElement = document.activeElement;
      modal.setAttribute("aria-hidden", "false");
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        panel.focus();
      }, 50);
    }

    function closeModal() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";

      setTimeout(() => {
        modal.setAttribute("aria-hidden", "true");
        if (previousActiveElement && typeof previousActiveElement.focus === "function") {
          previousActiveElement.focus();
        }
      }, 450);
    }

    modal.openModal = openModal;
    modal.closeModal = closeModal;

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal();
        const targetId = trigger.getAttribute("data-sns-target");
        if (targetId) {
          const item = modal.querySelector(`#content-archive-item-${targetId}`);
          if (item) {
            setTimeout(() => {
              item.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
          }
        }
      });
    });

    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  function initProjectArchiveModal() {
    setupModalSystem(
      "#project-archive-modal",
      "#project-archive-backdrop",
      ".project-archive-modal__panel",
      "#project-archive-close",
      "[data-open-archive='true'], #open-archive-trigger"
    );

    setupModalSystem(
      "#content-archive-modal",
      "#content-archive-backdrop",
      ".project-archive-modal__panel",
      "#content-archive-close",
      "[data-open-content-archive='true'], #open-content-archive-trigger"
    );

    setupModalSystem(
      "#marketing-menu-modal",
      "#marketing-menu-backdrop",
      ".marketing-menu-modal__panel",
      "#marketing-menu-close",
      "[data-open-marketing-menu='true'], #open-marketing-menu-trigger"
    );

    setupModalSystem(
      "#about-connect-modal",
      "#about-connect-backdrop",
      ".about-connect-modal__panel",
      "#about-connect-close",
      "[data-open-about='true'], #open-about-trigger, .work-card--04, .work-card--04 *"
    );

    // Global fail-safe click delegation for ABOUT CONNECT modal trigger
    document.addEventListener("click", (e) => {
      const aboutTarget = e.target.closest("[data-open-about='true'], #open-about-trigger, .work-card--04, a[href='#about-connect-modal']");
      if (aboutTarget) {
        e.preventDefault();
        e.stopPropagation();
        const aboutModal = document.querySelector("#about-connect-modal");
        if (aboutModal && typeof aboutModal.openModal === "function") {
          aboutModal.openModal();
        } else if (aboutModal) {
          aboutModal.setAttribute("aria-hidden", "false");
          aboutModal.classList.add("is-open");
          document.body.style.overflow = "hidden";
        }
      }
    });
  }

  function initApp() {
    initNotifyExperience();
    initVerticalMarqueeHover();
    initStarlightCursor();
    initGlobal3DTiltSystem();
    initProjectArchiveModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
