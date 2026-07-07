/**
 * Reads the visitor count from VITE_UMAMI_VISITORS and renders it
 * with staggered firework bursts.  After the bursts finish the count
 * glitch-fades away — it repeats every time you land on home.
 */

// ── helpers ─────────────────────────────────────────────────────

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function formatVisitors(n) {
  try {
    return new Intl.NumberFormat(undefined).format(n);
  } catch {
    return String(n);
  }
}

// ── fireworks ───────────────────────────────────────────────────

function spawnBurst({ containerEl, originEl, sparkCount, offsetX, offsetY }) {
  if (!containerEl) return;

  const containerRect = containerEl.getBoundingClientRect();
  const originRect = originEl?.getBoundingClientRect?.() ?? containerRect;
  const ox =
    originRect.left - containerRect.left + originRect.width / 2 + offsetX;
  const oy =
    originRect.top - containerRect.top + originRect.height / 2 + offsetY;

  for (let i = 0; i < sparkCount; i++) {
    const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.35;
    const radius = 64 + Math.random() * 98;

    const spark = document.createElement("span");
    spark.className = "visitors-firework-spark";
    spark.style.setProperty("--ox", `${ox}px`);
    spark.style.setProperty("--oy", `${oy}px`);
    spark.style.setProperty("--dx", `${Math.cos(angle) * radius}px`);
    spark.style.setProperty("--dy", `${Math.sin(angle) * radius}px`);
    spark.style.animationDelay = `${Math.random() * 160}ms`;

    containerEl.appendChild(spark);
  }
}

// ── public API ──────────────────────────────────────────────────

export function initVisitors({ appEl } = {}) {
  const root = appEl ?? document;
  const countEl = root.querySelector("#visitors-count");
  const fireworksEl = root.querySelector("#visitors-fireworks");
  const originEl = root.querySelector(".home-visitors-shell");
  const widgetEl =
    originEl?.querySelector?.(".visitors-widget") ??
    root.querySelector(".visitors-widget");

  if (!countEl) return;

  // Fresh start every time we land on home.
  widgetEl?.classList?.remove?.("is-fireworks-ended");
  widgetEl?.classList?.add?.("is-loading");
  countEl.textContent = "";

  const reduced = prefersReducedMotion();

  // Read from env; Vite inlines this at build time.
  const raw = import.meta.env.VITE_UMAMI_VISITORS;
  const visitors = raw ? Number(raw) : 0;

  countEl.textContent = formatVisitors(visitors);
  widgetEl?.classList?.remove?.("is-loading");

  if (reduced || !visitors) return;

  // 3–5 staggered bursts so it feels like a cluster.
  fireworksEl.innerHTML = "";

  const burstCount = Math.floor(3 + Math.random() * 3); // 3..5
  for (let i = 0; i < burstCount; i++) {
    const baseDelayMs = i * 640;
    const jitterMs = Math.floor(Math.random() * 520);
    const delayMs = baseDelayMs + jitterMs;

    window.setTimeout(() => {
      spawnBurst({
        containerEl: fireworksEl,
        originEl,
        sparkCount: 18 + Math.floor(Math.random() * 10),
        offsetX: (Math.random() - 0.5) * 28,
        offsetY: (Math.random() - 0.5) * 22,
      });
    }, delayMs);
  }

  // After the last burst finishes, glitch-fade the count away.
  const maxJitterMs = 519;
  const totalMs = 1750 + (burstCount - 1) * 640 + 160 + maxJitterMs;
  window.setTimeout(() => {
    widgetEl?.classList?.add?.("is-fireworks-ended");
    if (fireworksEl) fireworksEl.innerHTML = "";
  }, totalMs);
}