import { normalizePath, getRoute } from "./router.js";

import { sleep, typeInto } from "./lib/animation.js";
import { playSelectionSound } from "./lib/audio.js";
import {
  disconnectScrollTextRerender,
  setupScrollTextRerender,
} from "./lib/scrollTextRerender.js";
import { initSystemHealthFetch } from "./lib/health.js";
import { initVisitors } from "./lib/visitors.js";

import {
  ASSESSING_AGENTS_PASSWORD,
  bindAssessingAgentsKeyTwitch,
  isAssessingAgentsUnlocked,
  setAssessingAgentsUnlocked,
  startAssessingAgentsTwitch,
  stopAssessingAgentsTwitch,
} from "./lib/assessingAgentsGate.js";

import {
  homeTemplate,
  sociologicalTemplate,
  governmentFlexibilityRouteTemplate,
  assessingAgentsUnlockedTemplate,
  assessingAgentsLockedTemplate,
  technologicalTemplate,
  optoelectronicaTemplate,
  systemHealthTemplate,
  notFoundTemplate,
} from "./routes.js";

const BOOT_TEXT = "Hello friend";
const BOOT_TYPE_SPEED_MS = 92;
const BOOT_HOLD_MS = 900;
const PULSE_MS = 760;

const app = document.querySelector("#app");
const bootScreen = document.querySelector("#boot-screen");
const bootText = document.querySelector("#boot-text");
const bootCursor = document.querySelector("#boot-cursor");

let currentPath = normalizePath(window.location.pathname);
let pageEnteredAt = Date.now();
let isBooted = false;

// ── Route config ──────────────────────────────────────────────
// Each route maps to { template, title?, onRender? }.
// `onRender` is called after the template is injected into the DOM.

const ROUTE_CONFIG = {
  home: {
    template: homeTemplate,
    onRender() {
      if (isBooted) {
        const homeHelloText = document.querySelector("#home-hello-text");
        const homeHelloCursor = document.querySelector("#home-hello-cursor");
        if (homeHelloText) {
          homeHelloText.textContent = BOOT_TEXT;
        }
        homeHelloCursor?.classList.remove("is-hidden");
        initVisitors({ appEl: app });
      }
    },
  },

  sociological: {
    template: sociologicalTemplate,
    title: "tristan.systems — Sociological",
    onRender() {
      if (isBooted) setupScrollTextRerender({ appEl: app });
    },
  },

  "government-flexibility": {
    template: governmentFlexibilityRouteTemplate,
    title: "tristan.systems — Government flexibility",
    onRender() {
      if (isBooted) setupScrollTextRerender({ appEl: app });
    },
  },

  "assessing-agents": {
    template() {
      stopAssessingAgentsTwitch();
      return isAssessingAgentsUnlocked()
        ? assessingAgentsUnlockedTemplate()
        : assessingAgentsLockedTemplate();
    },
    title: "tristan.systems — AssessingAgents",
    onRender() {
      if (isBooted && !isAssessingAgentsUnlocked()) {
        const passwordInput = document.querySelector("#assessing-agents-password-input");
        passwordInput?.focus();
        bindAssessingAgentsKeyTwitch();
        startAssessingAgentsTwitch({
          getIsBooted: () => isBooted,
          getCurrentPath: () => currentPath,
        });
      }
    },
  },

  technological: {
    template: technologicalTemplate,
    title: "tristan.systems — Technological",
    onRender() {
      if (isBooted) setupScrollTextRerender({ appEl: app });
    },
  },

  optoelectronica: {
    template: optoelectronicaTemplate,
    title: "tristan.systems — Optoelectrónica Icalma",
    onRender() {
      if (isBooted) setupScrollTextRerender({ appEl: app });
    },
  },

  "system-health": {
    template: systemHealthTemplate,
    title: "tristan.systems — System Health",
    onRender() {
      if (isBooted) initSystemHealthFetch({ appEl: app });
    },
  },
};

// ── Render ─────────────────────────────────────────────────────

function renderRoute(path) {
  currentPath = normalizePath(path);
  const route = getRoute(currentPath);

  disconnectScrollTextRerender();

  const config = ROUTE_CONFIG[route];
  if (config) {
    app.innerHTML = config.template();
    if (config.title) document.title = config.title;
    config.onRender?.();
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

async function navigateTo(path, { replace = false } = {}) {
  const nextPath = normalizePath(path);
  const nextRoute = getRoute(nextPath);

  if (nextPath === currentPath) {
    pulseWholePage();
    await playSelectionSound();
    return;
  }

  // Prevent the visitors widget from flashing during navigation.
  const homeVisitorsShell = document.querySelector('.home-visitors-shell');
  homeVisitorsShell?.classList?.add('is-nav-hiding');

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
  document.body.classList.remove("page-pulse");

  document.querySelector('.home-visitors-shell')?.classList?.remove('is-nav-hiding');
}

async function boot() {
  document.body.classList.add("booting");
  renderRoute(currentPath);

  const homeHelloText = document.querySelector("#home-hello-text");
  const homeHelloCursor = document.querySelector("#home-hello-cursor");

  await Promise.all([
    typeInto(bootText, BOOT_TEXT, BOOT_TYPE_SPEED_MS),
    homeHelloText
      ? typeInto(homeHelloText, BOOT_TEXT, BOOT_TYPE_SPEED_MS)
      : Promise.resolve(),
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

  const route = getRoute(currentPath);

  // If we landed directly on the AssessingAgents route, we may need to
  // load/refresh the IFC/preview image now that boot is complete. renderRoute()
  // was already called once during boot while isBooted === false.
  if (route === "assessing-agents") {
    const isUnlocked = isAssessingAgentsUnlocked();

    if (isUnlocked) {
      // Ensure the unlocked template is swapped in on direct URL loads.
      // Without this, we can end up stuck on the locked template UI
      // even if unlock state is already present.
      renderRoute(currentPath);
    } else {
      const passwordInput = document.querySelector(
        "#assessing-agents-password-input",
      );
      passwordInput?.focus();
      bindAssessingAgentsKeyTwitch();
      startAssessingAgentsTwitch({
        getIsBooted: () => isBooted,
        getCurrentPath: () => currentPath,
      });
    }
  }

  // If we landed directly on an article/system-health route, enable scroll-triggered
  // text re-rendering now that boot is complete.
  if (route === "system-health") {
    initSystemHealthFetch({ appEl: app });
  } else {
    setupScrollTextRerender({ appEl: app });
  }

  if (route === "home") {
    initVisitors({ appEl: app });
  }
}

app.addEventListener("submit", (event) => {
  const unlockForm = event.target?.closest?.('form[data-assessing-agents-auth="unlock"]');
  if (!unlockForm) return;

  event.preventDefault();

  const inputEl = unlockForm.querySelector('input[name="password"]');
  const entered = (inputEl?.value ?? "").trim();

  const enteredNormalized = entered.toLowerCase();
  const expectedNormalized = (ASSESSING_AGENTS_PASSWORD ?? "").toLowerCase();

  if (enteredNormalized === expectedNormalized) {
    setAssessingAgentsUnlocked(true);
    inputEl && (inputEl.value = "");
    renderRoute(currentPath);
    return;
  }

  setAssessingAgentsUnlocked(false);
  inputEl && (inputEl.value = "");
  renderRoute(currentPath);

  const passwordInput = document.querySelector("#assessing-agents-password-input");
  passwordInput?.focus();
});

app.addEventListener("click", (event) => {
  const navTarget = event.target.closest("[data-nav]");

  if (!navTarget || !isBooted) {
    return;
  }

  const nextPath = navTarget.getAttribute("href") || navTarget.dataset.nav;
  if (!nextPath) return;

  event.preventDefault();
  navigateTo(nextPath);
});

window.addEventListener("popstate", () => {
  renderRoute(window.location.pathname);
  pageEnteredAt = Date.now();
});

boot();
