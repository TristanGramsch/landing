function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
}

function formatVisitors(n) {
  try {
    return new Intl.NumberFormat(undefined).format(n);
  } catch {
    return String(n);
  }
}

function spawnFireworksBurst({
  containerEl,
  originEl,
  sparkCount = 22,
  originOffsetX = 0,
  originOffsetY = 0,
}) {
  if (!containerEl) return;

  const containerRect = containerEl.getBoundingClientRect();
  const originRect = originEl?.getBoundingClientRect?.() ?? containerRect;

  // Place the origin point relative to the container.
  const originX =
    originRect.left - containerRect.left + originRect.width / 2 + originOffsetX;
  const originY =
    originRect.top - containerRect.top + originRect.height / 2 + originOffsetY;

  for (let i = 0; i < sparkCount; i++) {
    const spark = document.createElement('span');
    spark.className = 'visitors-firework-spark';

    const angle =
      (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.35;
    const radius = 64 + Math.random() * 98;

    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;

    spark.style.setProperty('--ox', `${originX}px`);
    spark.style.setProperty('--oy', `${originY}px`);
    spark.style.setProperty('--dx', `${dx}px`);
    spark.style.setProperty('--dy', `${dy}px`);

    // Stagger slightly so the burst feels more organic.
    spark.style.animationDelay = `${Math.random() * 160}ms`;

    containerEl.appendChild(spark);
  }
}

export async function initVisitors({ appEl } = {}) {
  const countEl =
    appEl?.querySelector?.('#visitors-count') ?? document.querySelector('#visitors-count');
  const visitorsSuffixEl =
    appEl?.querySelector?.('.visitors-suffix--header') ?? document.querySelector('.visitors-suffix--header');
  const fireworksEl =
    appEl?.querySelector?.('#visitors-fireworks') ?? document.querySelector('#visitors-fireworks');
  const originEl =
    appEl?.querySelector?.('.home-visitors-shell') ?? document.querySelector('.home-visitors-shell');
  const visitorsWidgetEl =
    originEl?.querySelector?.('.visitors-widget') ??
    appEl?.querySelector?.('.visitors-widget') ??
    document.querySelector('.visitors-widget');

  if (!countEl) return;

  // Ensure we start fresh for each home render.
  visitorsWidgetEl?.classList?.remove?.('is-fireworks-ended');
  visitorsWidgetEl?.classList?.add?.('is-loading');
  countEl.textContent = '';

  // Reduced motion: still show the number, but skip fireworks.
  const reduced = prefersReducedMotion();

  // Visitors count is fixed for now (instead of calling /api/umami-visitors).
  const visitors = 100;
  countEl.textContent = formatVisitors(visitors);
  visitorsWidgetEl?.classList?.remove?.('is-loading');

  if (!reduced) {
    // Fire 3–5 bursts so it feels like a cluster, and randomize origin
    // offsets so they don't land on the same exact spot.
    const burstCount = Math.floor(3 + Math.random() * 3); // 3..5

    fireworksEl.innerHTML = '';

    for (let i = 0; i < burstCount; i++) {
      // First burst fires immediately; subsequent bursts are delayed
      // progressively with additional randomness.
      const baseDelayMs = i * 640;
      const jitterMs = Math.floor(Math.random() * 520); // 0..519
      const delayMs = baseDelayMs + jitterMs;

      const originOffsetX = (Math.random() - 0.5) * 28;
      const originOffsetY = (Math.random() - 0.5) * 22;
      const sparkCount = 18 + Math.floor(Math.random() * 10);

      window.setTimeout(() => {
        spawnFireworksBurst({
          containerEl: fireworksEl,
          originEl,
          sparkCount,
          originOffsetX,
          originOffsetY,
        });
      }, delayMs);
    }

    // Clear after the last burst finishes.
    // Account for the maximum jitter on the last scheduled burst.
    const maxJitterMs = 519;
    window.setTimeout(() => {
      if (visitorsWidgetEl) {
        visitorsWidgetEl.classList.add('is-fireworks-ended');
      } else {
        // Fallback: fade the individual nodes.
        countEl?.classList?.add?.('is-fireworks-ended');
        visitorsSuffixEl?.classList?.add?.('is-fireworks-ended');
      }

      if (fireworksEl) fireworksEl.innerHTML = '';
    }, 1750 + (burstCount - 1) * 640 + 160 + maxJitterMs);
  }
}
