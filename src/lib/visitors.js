let didInit = false;

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
  if (didInit) return;
  didInit = true;

  const countEl = appEl?.querySelector?.('#visitors-count') ?? document.querySelector('#visitors-count');
  const fireworksEl = appEl?.querySelector?.('#visitors-fireworks') ?? document.querySelector('#visitors-fireworks');
  const originEl = appEl?.querySelector?.('.home-visitors-shell') ?? document.querySelector('.home-visitors-shell');

  if (!countEl) return;

  // Reduced motion: still fetch and display the number, but skip fireworks.
  const reduced = prefersReducedMotion();

  // Start in a neutral state.
  countEl.textContent = '—';

  try {
    const res = await fetch('/api/umami-visitors', { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const visitors = Number(data?.visitors);
    countEl.textContent = Number.isFinite(visitors) ? formatVisitors(visitors) : '—';

    if (!reduced) {
      // Fire 3–5 bursts so it feels like a cluster, and randomize origin
      // offsets so they don't land on the same exact spot.
      const burstCount = Math.floor(3 + Math.random() * 3); // 3..5

      fireworksEl.innerHTML = '';

      for (let i = 0; i < burstCount; i++) {
        const delayMs = i * 220;
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
      window.setTimeout(() => {
        if (fireworksEl) fireworksEl.innerHTML = '';
      }, 1750 + (burstCount - 1) * 220 + 160);
    }
  } catch {
    countEl.textContent = '—';
  }
}
