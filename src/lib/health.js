import { typeInto } from "./animation.js";
import { setupScrollTextRerender } from "./scrollTextRerender.js";

async function fetchHealthLog() {
  try {
    const response = await fetch("/api/health-log");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Failed to fetch health log:", error);
    return "Health log unavailable. Run diagnose.sh manually.";
  }
}

export async function initSystemHealthFetch({ appEl } = {}) {
  const promptEl = document.querySelector("#health-prompt");
  const cursorEl = document.querySelector("#health-cursor");
  const logContentEl = document.querySelector("#health-log-content");

  if (!promptEl || !cursorEl || !logContentEl) {
    return;
  }

  cursorEl.classList.remove("is-hidden");
  await typeInto(promptEl, "$ fetch('/api/health-log')", 60);
  cursorEl.classList.add("is-hidden");

  const logContent = await fetchHealthLog();

  // Render the whole log as plain text (preserve indentation/blank lines).
  // Mark it as anim-text (in the template) so scroll-based scrambling still works.
  logContentEl.textContent = logContent;

  setupScrollTextRerender({ appEl });
}