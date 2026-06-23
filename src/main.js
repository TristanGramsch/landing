import { normalizePath, getRoute } from "./router.js";

import { typeInto } from "./lib/animation.js";
import { trackPageView, trackTimeOnPage } from "./lib/analytics.js";
import { playSelectionSound } from "./lib/audio.js";
import {
  disconnectScrollTextRerender,
  setupScrollTextRerender,
} from "./lib/scrollTextRerender.js";
import { initSystemHealthFetch } from "./lib/health.js";
import { initVisitors } from "./lib/visitors.js";

import {
  DITTO_PITCH_80_PASSWORD,
  bindDittoPitch80KeyTwitch,
  isDittoPitch80Unlocked,
  setDittoPitch80Unlocked,
  startDittoPitch80Twitch,
  stopDittoPitch80Twitch,
} from "./lib/dittoGate.js";

import {
  homeTemplate,
  sociologicalTemplate,
  governmentFlexibilityRouteTemplate,
  dittoPitch80UnlockedTemplate,
  dittoPitch80LockedTemplate,
  technologicalTemplate,
  optoelectronicaTemplate,
  systemHealthTemplate,
  notFoundTemplate,
} from "./routes.js";

import hanoIfcUrl from "./assets/44_hano.ifc?url";
import hanoPngUrl from "./assets/44-hano.png?url";

import { dittoPitch80Text } from "./content.js";

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

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getDittoExtraTxtUrl() {
  try {
    const urlParam = new URLSearchParams(window.location.search).get(
      "dittoTxt",
    );

    if (urlParam) return urlParam;

    return window.sessionStorage.getItem("ditto-extra-txt-url");
  } catch {
    return null;
  }
}

async function loadDittoExtraTxt({
  appEl,
  enableScrollRerender = false,
} = {}) {
  const placeholder = appEl?.querySelector?.("#ditto-extra-txt");
  if (!placeholder) return;

  const url = getDittoExtraTxtUrl() ?? hanoIfcUrl;
  if (!url) return;

  placeholder.innerHTML = "";

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return;

    const text = await res.text();

    const img = document.createElement("img");
    img.className = "ditto-hano-image";
    img.src = hanoPngUrl;
    img.alt = "44 Hano (IFC preview image)";
    img.loading = "lazy";
    placeholder.appendChild(img);

    const pre = document.createElement("pre");
    pre.className = "anim-text";
    pre.textContent = text;
    placeholder.appendChild(pre);

    if (enableScrollRerender) {
      setupScrollTextRerender({ appEl });
    }
  } catch {
    // Ignore fetch errors; leaving content empty is safer.
  }
}

function renderRoute(path) {
  currentPath = normalizePath(path);
  const route = getRoute(currentPath);

  disconnectScrollTextRerender();

  if (route === "home") {
    app.innerHTML = homeTemplate();

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

    if (isBooted) {
      initVisitors({ appEl: app });
    }
  } else if (route === "sociological") {
    app.innerHTML = sociologicalTemplate();
    document.title = "tristan.systems — Sociological";

    if (isBooted) {
      setupScrollTextRerender({ appEl: app });
    }
  } else if (route === "government-flexibility") {
    app.innerHTML = governmentFlexibilityRouteTemplate();
    document.title = "tristan.systems — Government flexibility";

    if (isBooted) {
      setupScrollTextRerender({ appEl: app });
    }
  } else if (route === "ditto-pitch-80") {
    stopDittoPitch80Twitch();

    const isUnlocked = isDittoPitch80Unlocked();

    if (isUnlocked) {
      app.innerHTML = dittoPitch80UnlockedTemplate();
    } else {
      app.innerHTML = dittoPitch80LockedTemplate();
    }
    document.title = "tristan.systems — AssessingAgents";

    if (isBooted) {
      void loadDittoExtraTxt({
        appEl: app,
        enableScrollRerender: isUnlocked,
      });
    }

    if (isBooted && !isUnlocked) {
      const passwordInput = document.querySelector("#ditto-password-input");
      passwordInput?.focus();
      bindDittoPitch80KeyTwitch();
      startDittoPitch80Twitch({
        getIsBooted: () => isBooted,
        getCurrentPath: () => currentPath,
      });
    }
  } else if (route === "technological") {
    app.innerHTML = technologicalTemplate();
    document.title = "tristan.systems — Technological";

    if (isBooted) {
      setupScrollTextRerender({ appEl: app });
    }
  } else if (route === "optoelectronica") {
    app.innerHTML = optoelectronicaTemplate();
    document.title = "tristan.systems — Optoelectrónica Icalma";

    if (isBooted) {
      setupScrollTextRerender({ appEl: app });
    }
  } else if (route === "system-health") {
    app.innerHTML = systemHealthTemplate();
    document.title = "tristan.systems — System Health";

    if (isBooted) {
      initSystemHealthFetch({ appEl: app });
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

async function navigateTo(path, { replace = false } = {}) {
  const nextPath = normalizePath(path);
  const nextRoute = getRoute(nextPath);

  if (nextPath === currentPath) {
    pulseWholePage();
    await playSelectionSound();
    return;
  }

  trackTimeOnPage({ path: currentPath, pageEnteredAt });

  // Prevent the home visitors widget from flashing while we wait to
  // replace the DOM.
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
  trackPageView(currentPath);
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
  trackPageView(currentPath);

  // If we landed directly on an article/system-health route, enable scroll-triggered
  // text re-rendering now that boot is complete.
  const route = getRoute(currentPath);
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
  const unlockForm = event.target?.closest?.('form[data-ditto-auth="unlock"]');
  if (!unlockForm) return;

  event.preventDefault();

  const inputEl = unlockForm.querySelector('input[name="password"]');
  const entered = (inputEl?.value ?? "").trim();

  if (entered === DITTO_PITCH_80_PASSWORD) {
    setDittoPitch80Unlocked(true);
    inputEl && (inputEl.value = "");
    renderRoute(currentPath);
    return;
  }

  setDittoPitch80Unlocked(false);
  inputEl && (inputEl.value = "");
  renderRoute(currentPath);

  const passwordInput = document.querySelector("#ditto-password-input");
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
  const previousPath = currentPath;
  trackTimeOnPage({ path: previousPath, pageEnteredAt });
  renderRoute(window.location.pathname);
  pageEnteredAt = Date.now();
  trackPageView(currentPath);
});

window.addEventListener("pagehide", () => {
  trackTimeOnPage({ path: currentPath, pageEnteredAt });
});

boot();
