import { sleep } from "./animation.js";

let activeScrollObserver = null;

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

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

export function disconnectScrollTextRerender() {
  activeScrollObserver?.disconnect();
  activeScrollObserver = null;
}

export function setupScrollTextRerender({ appEl } = {}) {
  disconnectScrollTextRerender();

  if (prefersReducedMotion()) {
    return;
  }

  const elements = Array.from(appEl?.querySelectorAll?.(".anim-text") ?? []);
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
