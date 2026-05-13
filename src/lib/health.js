import { typeInto } from "./animation.js";
import { fetchHealthLog } from "./healthTransport.js";
import { setupScrollTextRerender } from "./scrollTextRerender.js";

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
