const BOOT_TEXT = "Hello friend";
const BOOT_TYPE_SPEED_MS = 92;
const BOOT_HOLD_MS = 900;
const PULSE_MS = 760;

const ROUTES = {
  "/": "home",
  "/sociological": "sociological",
  "/technological": "technological",
};

const CONTENT = {
  sociological: {
    label: "Sociological",
    subtitle: "Sociology & Ideas",
    description: "A collection of written essays.",
    items: [
      {
        title: "Ser",
        type: "Essay placeholder",
        description: 'Tristan\'s ideas on the concept of "Ser" (Spanish: "to be").',
      },
      {
        title: "On the Art of Bureaucracy",
        type: "Essay placeholder",
        description: "A book review.",
      },
    ],
  },
  technological: {
    label: "Technological",
    subtitle: "Computers / Product Manager Work",
    description: "A collection of professional technical projects.",
    items: [
      {
        title: "Opto",
        type: "Project placeholder",
        description: "Work done with Opto.",
      },
      {
        title: "Whoop",
        type: "Project placeholder",
        description: "Work done with Whoop.",
      },
    ],
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

function sectionTemplate(key) {
  const section = CONTENT[key];

  return `
    <main class="section-shell">
      <a class="back-link" href="/" data-nav>&lt; back</a>
      <section class="hero section-hero" aria-label="${section.label}">
        <h1 class="section-title">${section.label}</h1>
        <p class="lede">${section.description}</p>
      </section>
      <section class="item-list" aria-label="${section.subtitle}">
        ${section.items
          .map(
            (item) => `
              <article class="item-card">
                <span class="meta">${item.type}</span>
                <h2>${item.title}</h2>
                <p>${item.description}</p>
              </article>
            `,
          )
          .join("")}
      </section>
    </main>
  `;
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

  if (route === "home") {
    app.innerHTML = homeTemplate();
    document.title = "tristan.systems";
  } else if (route === "sociological") {
    app.innerHTML = sectionTemplate("sociological");
    document.title = "tristan.systems — Sociological";
  } else if (route === "technological") {
    app.innerHTML = sectionTemplate("technological");
    document.title = "tristan.systems — Technological";
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

  // When navigating back to the home route after boot, re-run the
  // "Hello friend_" typing so it doesn't appear blank.
  if (isBooted && route === "home") {
    void animateHomeHelloFriend();
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
