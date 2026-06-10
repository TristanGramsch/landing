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

function spawnFireworks({ containerEl, originEl, sparkCount = 22 }) {
  if (!containerEl) return;

  // Clear any previous burst.
  containerEl.innerHTML = '';

  const containerRect = containerEl.getBoundingClientRect();
  const originRect = originEl?.getBoundingClientRect?.() ?? containerRect;

  // Place the origin point relative to the container.
  const originX = originRect.left - containerRect.left + originRect.width / 2;
  const originY = originRect.top - containerRect.top + originRect.height / 2;

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

  // Remove sparks after the animation.
  window.setTimeout(() => {
    if (containerEl) containerEl.innerHTML = '';
  }, 1750);
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
      // Trigger the burst after the number is painted.
      spawnFireworks({ containerEl: fireworksEl, originEl, sparkCount: 26 });
    }
  } catch {
    countEl.textContent = '—';
  }
}
