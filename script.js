import govFlexibilityText from "./Government flexibility.txt?raw";
import optoelectronicaText from "./Optoelectronica.txt?raw";

import equipoImageSrc from "./equipo.jpeg";
import instalacionImageSrc from "./instalación.jpeg";

const BOOT_TEXT = "Hello friend";
const BOOT_TYPE_SPEED_MS = 92;
const BOOT_HOLD_MS = 900;
const PULSE_MS = 760;

const ROUTES = {
  "/": "home",
  "/sociological": "sociological",
  "/technological": "technological",
  "/technological/optoelectronica": "optoelectronica",
  "/technological/system-health": "system-health",
};

const CONTENT = {
  sociological: {
    label: "Sociological",
    subtitle: "Sociology & Ideas",
    description: "A collection of written essays.",
  },
  technological: {
    label: "Technological",
    subtitle: "Computers / Product Manager Work",
    description: "A collection of professional technical projects.",
  },
};

const app = document.querySelector("#app");
const bootScreen = document.querySelector("#boot-screen");
const bootText = document.querySelector("#boot-text");
const bootCursor = document.querySelector("#boot-cursor");

let currentPath = normalizePath(window.location.pathname);
let pageEnteredAt = Date.now();
let isBooted = false;
let audioContext = null;

function normalizePath(path) {
  const normalized = path.replace(/\/$/, "");
  return normalized === "" ? "/" : normalized;
}

function getRoute(path) {
  return ROUTES[normalizePath(path)] || null;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function typeInto(element, text, speed) {
  element.textContent = "";

  for (const character of text) {
    element.textContent += character;
    await sleep(speed);
  }
}

function trackPageView(path) {
  if (typeof window.plausible === "function") {
    window.plausible("pageview", { u: `${window.location.origin}${path}` });
  }
}

function trackTimeOnPage(path) {
  const durationSeconds = Math.max(1, Math.round((Date.now() - pageEnteredAt) / 1000));

  if (typeof window.plausible === "function") {
    window.plausible("Time on Page", {
      props: {
        path,
        duration_seconds: durationSeconds,
      },
    });
  }
}

function homeTemplate() {
  return `
    <main class="home-shell">
      <section class="hero hero-centered" aria-label="Welcome">
        <h1 class="hero-title">
          <span id="home-hello-text"></span><span id="home-hello-cursor" class="cursor is-hidden">_</span>
        </h1>
        <div class="home-paths" aria-label="Choose a path">
          <p class="lede lede-home">Choose a path of your interest.</p>

          <section class="bubble-grid" aria-label="Choose a path">
            <button class="bubble" type="button" data-nav="/sociological">
              <span class="bubble-frame">
                <span class="bubble-label">Sociological</span>
              </span>
            </button>
            <button class="bubble" type="button" data-nav="/technological">
              <span class="bubble-frame">
                <span class="bubble-label">Technological</span>
              </span>
            </button>
          </section>
        </div>
      </section>
    </main>
  `;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

const GOVERNMENT_TITLE_PAIN_POINTS = "The pains of inflexibility at local public health";
const GOVERNMENT_TITLE_INCENTIVIZE = "Incentivizing flexibility at local public health";

function parseGovernmentFlexibility(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const idx1 = lines.indexOf(GOVERNMENT_TITLE_PAIN_POINTS);
  const idx2 = lines.indexOf(GOVERNMENT_TITLE_INCENTIVIZE);

  if (idx1 === -1 || idx2 === -1 || idx2 <= idx1) {
    return {
      lead: lines,
      sections: [],
    };
  }

  return {
    lead: lines.slice(0, idx1),
    sections: [
      {
        title: GOVERNMENT_TITLE_PAIN_POINTS,
        paragraphs: lines.slice(idx1 + 1, idx2),
      },
      {
        title: GOVERNMENT_TITLE_INCENTIVIZE,
        paragraphs: lines.slice(idx2 + 1),
      },
    ],
  };
}

function parseOptoelectronica(text) {
  const paragraphs = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return { paragraphs };
}

const governmentArticle = parseGovernmentFlexibility(govFlexibilityText);
const optoelectronicaArticle = parseOptoelectronica(optoelectronicaText);

function governmentFlexibilityArticleTemplate() {
  const lead = governmentArticle.lead
    .map((p) => `<p class="anim-text">${escapeHtml(p)}</p>`)
    .join("");

  const sections = governmentArticle.sections
    .map(
      (section) => `
        <h2 class="article-title anim-text">${escapeHtml(section.title)}</h2>
        ${section.paragraphs
          .map((p) => `<p class="anim-text">${escapeHtml(p)}</p>`)
          .join("")}
      `,
    )
    .join("");

  return `
    <article class="article-shell" aria-label="Government flexibility">
      ${lead}
      ${sections}
    </article>
  `;
}

function optoelectronicaArticleTemplate() {
  return `
    <article class="article-shell" aria-label="Optoelectronica">
      ${optoelectronicaArticle.paragraphs
        .map((p) => `<p class="anim-text">${escapeHtml(p)}</p>`)
        .join("")}

      <section class="article-images" aria-label="Photos">
        <figure class="article-figure">
          <img
            src="${equipoImageSrc}"
            alt="Equipo de Optoelectrónica"
            loading="lazy"
          />
          <figcaption>Equipo de trabajo en Optoelectrónica.</figcaption>
        </figure>

        <figure class="article-figure">
          <img
            src="${instalacionImageSrc}"
            alt="Instalación del panel"
            loading="lazy"
          />
          <figcaption>Instalación del panel y montaje del sistema.</figcaption>
        </figure>
      </section>
    </article>
  `;
}

async function fetchHealthLog() {
  try {
    const response = await fetch('/api/health-log');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch health log:', error);
    return 'Health log unavailable. Run diagnose.sh manually.';
  }
}

function sociologicalTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/" data-nav>&lt; back</a>
      ${governmentFlexibilityArticleTemplate()}
    </main>
  `;
}

function technologicalTemplate() {
  return `
    <main class="home-shell">
      <section class="bubble-grid" aria-label="Technological routes">
        <a class="bubble tech-box" href="/technological/optoelectronica" data-nav>
          <span class="bubble-frame">
            <span class="bubble-label">Optoelectrónica Icalma</span>
          </span>
        </a>
        <a class="bubble tech-box" href="/technological/system-health" data-nav>
          <span class="bubble-frame">
            <span class="bubble-label">System Health</span>
          </span>
        </a>
      </section>
    </main>
  `;
}

function optoelectronicaTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/technological" data-nav>&lt; back</a>
      ${optoelectronicaArticleTemplate()}
    </main>
  `;
}

function systemHealthTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/technological" data-nav>&lt; back</a>
      <article class="article-shell" aria-label="System Health Log">
        <div id="health-prompt"></div>
        <div id="health-cursor" class="cursor is-hidden">_</div>
        <div id="health-log-content" class="health-log-content"></div>
      </article>
    </main>
  `;
}

let activeScrollObserver = null;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randomScrambleChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function scrambleText(finalText, keepProbability) {
  return [...finalText]
    .map((char) => {
      if (char === " " || char === "\n" || char === "\t") return char;

      if (keepProbability <= 0) return randomScrambleChar();
      if (keepProbability >= 1) return char;

      return Math.random() < keepProbability ? char : randomScrambleChar();
    })
    .join("");
}

async function rerenderTextElement(el, { iterations = 3, stepMs = 90 } = {}) {
  if (prefersReducedMotion()) {
    return;
  }

  const finalText = el.dataset.finalText ?? el.textContent ?? "";

  for (let step = 0; step < iterations; step++) {
    const keepProbability = iterations === 1 ? 1 : step / (iterations - 1);
    el.textContent = scrambleText(finalText, keepProbability);

    if (step < iterations - 1) {
      await sleep(stepMs);
    }
  }

  el.textContent = finalText;
}

function disconnectScrollTextRerender() {
  activeScrollObserver?.disconnect();
  activeScrollObserver = null;
}

function setupScrollTextRerender() {
  disconnectScrollTextRerender();

  if (prefersReducedMotion()) {
    return;
  }

  const elements = Array.from(app.querySelectorAll(".anim-text"));
  if (elements.length === 0) {
    return;
  }

  for (const el of elements) {
    el.dataset.finalText = el.textContent ?? "";
  }

  const done = new Set();

  activeScrollObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const el = entry.target;
        if (done.has(el)) continue;

        done.add(el);
        void rerenderTextElement(el);
      }
    },
    { threshold: 0.25 },
  );

  for (const el of elements) {
    activeScrollObserver.observe(el);
  }
}

async function initSystemHealthFetch() {
  const promptEl = document.querySelector('#health-prompt');
  const cursorEl = document.querySelector('#health-cursor');
  const logContentEl = document.querySelector('#health-log-content');
  
  if (!promptEl || !cursorEl) {
    return;
  }
  
  cursorEl.classList.remove('is-hidden');
  await typeInto(promptEl, "$ fetch('/api/health-log')", 60);
  cursorEl.classList.add('is-hidden');
  
  // Load and display health log
  const logContent = await fetchHealthLog();
  
  // Split log into lines and render each as anim-text for scroll animation
  const lines = logContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  logContentEl.innerHTML = lines
    .map(line => `<div class="anim-text">${escapeHtml(line)}</div>`)
    .join('');
  
  // Setup scroll animations for the log
  setupScrollTextRerender();
}


function notFoundTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/" data-nav>&lt; back</a>
      <section class="hero section-hero">
        <h1 class="section-title">404</h1>
        <p class="lede">This route does not exist.</p>
      </section>
    </main>
  `;
}

function renderRoute(path) {
  currentPath = normalizePath(path);
  const route = getRoute(currentPath);

  disconnectScrollTextRerender();

  if (route === "home") {
    app.innerHTML = homeTemplate();
    document.title = "tristan.systems";

    // When navigating back to home after boot, don't re-type.
    // Just show the final text + blinking cursor.
    if (isBooted) {
      const homeHelloText = document.querySelector("#home-hello-text");
      const homeHelloCursor = document.querySelector("#home-hello-cursor");
      if (homeHelloText) {
        homeHelloText.textContent = BOOT_TEXT;
      }
      homeHelloCursor?.classList.remove("is-hidden");
    }
  } else if (route === "sociological") {
    app.innerHTML = sociologicalTemplate();
    document.title = "tristan.systems — Sociological";

    if (isBooted) {
      setupScrollTextRerender();
    }
  } else if (route === "technological") {
    app.innerHTML = technologicalTemplate();
    document.title = "tristan.systems — Technological";

    if (isBooted) {
      setupScrollTextRerender();
    }
  } else if (route === "optoelectronica") {
    app.innerHTML = optoelectronicaTemplate();
    document.title = "tristan.systems — Optoelectrónica Icalma";

    if (isBooted) {
      setupScrollTextRerender();
    }
  } else if (route === "system-health") {
    app.innerHTML = systemHealthTemplate();
    document.title = "tristan.systems — System Health";

    if (isBooted) {
      initSystemHealthFetch();
    }
  } else {
    app.innerHTML = notFoundTemplate();
    document.title = "tristan.systems — 404";
  }

  window.scrollTo({ top: 0, behavior: "instant" });

  // When boot is complete (e.g. navigating back), make sure the home
  // "paths" section is visible.
  if (route === "home" && isBooted) {
    const homePaths = document.querySelector(".home-paths");
    homePaths?.classList.add("is-visible");
  }
}

function pulseWholePage() {
  document.body.classList.remove("page-pulse");
  void document.body.offsetWidth;
  document.body.classList.add("page-pulse");
}

async function animateHomeHelloFriend() {
  const homeHelloText = document.querySelector("#home-hello-text");
  const homeHelloCursor = document.querySelector("#home-hello-cursor");

  if (!homeHelloText || !homeHelloCursor) {
    return;
  }

  // Ensure cursor is visible (and blinking) during/after typing.
  homeHelloCursor.classList.remove("is-hidden");
  await typeInto(homeHelloText, BOOT_TEXT, BOOT_TYPE_SPEED_MS);
  homeHelloCursor.classList.remove("is-hidden");
}

async function playSelectionSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const now = audioContext.currentTime;
  const master = audioContext.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.connect(audioContext.destination);

  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, now);
  filter.Q.value = 0.7;

  const toneGain = audioContext.createGain();
  toneGain.gain.setValueAtTime(0.0001, now);
  toneGain.gain.exponentialRampToValueAtTime(0.05, now + 0.03);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

  const primary = audioContext.createOscillator();
  primary.type = "sine";
  primary.frequency.setValueAtTime(118, now);
  primary.frequency.exponentialRampToValueAtTime(92, now + 0.25);

  const harmonic = audioContext.createOscillator();
  harmonic.type = "triangle";
  harmonic.frequency.setValueAtTime(176, now);
  harmonic.frequency.exponentialRampToValueAtTime(132, now + 0.27);

  const transient = audioContext.createOscillator();
  transient.type = "sine";
  transient.frequency.setValueAtTime(52, now);
  transient.frequency.exponentialRampToValueAtTime(41, now + 0.16);

  const transientGain = audioContext.createGain();
  transientGain.gain.setValueAtTime(0.0001, now);
  transientGain.gain.exponentialRampToValueAtTime(0.014, now + 0.02);
  transientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  primary.connect(filter);
  harmonic.connect(filter);
  filter.connect(toneGain);
  toneGain.connect(master);

  transient.connect(transientGain);
  transientGain.connect(master);

  primary.start(now);
  harmonic.start(now + 0.01);
  transient.start(now);
  primary.stop(now + 0.5);
  harmonic.stop(now + 0.5);
  transient.stop(now + 0.2);

  master.gain.exponentialRampToValueAtTime(1.0, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
}

async function navigateTo(path, { replace = false } = {}) {
  const nextPath = normalizePath(path);
  const nextRoute = getRoute(nextPath);

  if (nextPath === currentPath) {
    pulseWholePage();
    await playSelectionSound();
    return;
  }

  trackTimeOnPage(currentPath);
  pulseWholePage();
  await playSelectionSound();
  await sleep(PULSE_MS);

  if (replace) {
    window.history.replaceState({}, "", nextPath);
  } else {
    window.history.pushState({}, "", nextPath);
  }

  renderRoute(nextRoute ? nextPath : "/");
  pageEnteredAt = Date.now();
  trackPageView(currentPath);
  document.body.classList.remove("page-pulse");
}

async function boot() {
  document.body.classList.add("booting");
  renderRoute(currentPath);

  const homeHelloText = document.querySelector("#home-hello-text");
  const homeHelloCursor = document.querySelector("#home-hello-cursor");

  await Promise.all([
    typeInto(bootText, BOOT_TEXT, BOOT_TYPE_SPEED_MS),
    homeHelloText ? typeInto(homeHelloText, BOOT_TEXT, BOOT_TYPE_SPEED_MS) : Promise.resolve(),
  ]);

  bootCursor.classList.remove("is-hidden");
  if (homeHelloCursor) {
    homeHelloCursor.classList.remove("is-hidden");
  }

  await sleep(BOOT_HOLD_MS);
  bootScreen.classList.add("is-hidden");
  document.body.classList.remove("booting");
  document.body.classList.add("boot-complete");

  // Reveal home paths after the hello text is ready.
  if (currentPath === "/") {
    const homePaths = document.querySelector(".home-paths");
    homePaths?.classList.add("is-visible");
  }

  isBooted = true;
  trackPageView(currentPath);

  // If we landed directly on an article/system-health route, enable scroll-triggered
  // text re-rendering now that boot is complete.
  const route = getRoute(currentPath);
  if (route === "system-health") {
    initSystemHealthFetch();
  } else if (route === "sociological" || route === "technological") {
    setupScrollTextRerender();
  }
}

app.addEventListener("click", (event) => {
  const navTarget = event.target.closest("[data-nav]");

  if (!navTarget || !isBooted) {
    return;
  }

  const nextPath = navTarget.getAttribute("href") || navTarget.dataset.nav;

  if (!nextPath) {
    return;
  }

  event.preventDefault();
  navigateTo(nextPath);
});

window.addEventListener("popstate", () => {
  const previousPath = currentPath;
  trackTimeOnPage(previousPath);
  renderRoute(window.location.pathname);
  pageEnteredAt = Date.now();
  trackPageView(currentPath);
});

window.addEventListener("pagehide", () => {
  trackTimeOnPage(currentPath);
});

boot();
