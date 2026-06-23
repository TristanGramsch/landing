const ASSESSING_AGENTS_PASSWORD = "justice";
const ASSESSING_AGENTS_UNLOCK_KEY = "assessing-agents-unlocked";

const ASSESSING_AGENTS_PATH = "/sociological/assessing-agents";

let assessingAgentsTwitchTimeout = null;

export function isAssessingAgentsUnlocked() {
  try {
    return sessionStorage.getItem(ASSESSING_AGENTS_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAssessingAgentsUnlocked(unlocked) {
  try {
    if (unlocked) {
      sessionStorage.setItem(ASSESSING_AGENTS_UNLOCK_KEY, "1");
    } else {
      sessionStorage.removeItem(ASSESSING_AGENTS_UNLOCK_KEY);
    }
  } catch {
    // Ignore storage errors; this is best-effort privacy.
  }
}

function stopAssessingAgentsTwitchInternal() {
  if (assessingAgentsTwitchTimeout) {
    window.clearTimeout(assessingAgentsTwitchTimeout);
    assessingAgentsTwitchTimeout = null;
  }
}

function triggerAssessingAgentsTwitch() {
  const input = document.querySelector("#assessing-agents-password-input");
  if (!input) return;

  if (isAssessingAgentsUnlocked()) {
    return;
  }

  input.classList.remove("assessing-agents-auth-twitch");
  void input.offsetWidth;
  input.classList.add("assessing-agents-auth-twitch");

  window.setTimeout(() => {
    input.classList.remove("assessing-agents-auth-twitch");
  }, 160);
}

export function stopAssessingAgentsTwitch() {
  stopAssessingAgentsTwitchInternal();
}

export function bindAssessingAgentsKeyTwitch() {
  const input = document.querySelector("#assessing-agents-password-input");
  if (!input) return;

  if (input.dataset.assessingAgentsKeyBound === "1") {
    return;
  }

  input.dataset.assessingAgentsKeyBound = "1";

  input.addEventListener(
    "keydown",
    () => {
      if (isAssessingAgentsUnlocked()) return;
      triggerAssessingAgentsTwitch();
    },
    { passive: true },
  );
}

export function startAssessingAgentsTwitch({ getIsBooted, getCurrentPath } = {}) {
  stopAssessingAgentsTwitchInternal();

  const scheduleNext = () => {
    const delayMs = 7_000 + Math.random() * 1_000;

    assessingAgentsTwitchTimeout = window.setTimeout(() => {
      const isBooted = getIsBooted?.() ?? false;
      const currentPath = getCurrentPath?.() ?? "";

      if (
        !isBooted ||
        currentPath !== ASSESSING_AGENTS_PATH ||
        isAssessingAgentsUnlocked()
      ) {
        stopAssessingAgentsTwitchInternal();
        return;
      }

      const input = document.querySelector("#assessing-agents-password-input");
      if (!input) {
        stopAssessingAgentsTwitchInternal();
        return;
      }

      triggerAssessingAgentsTwitch();
      scheduleNext();
    }, delayMs);
  };

  scheduleNext();
}

export { ASSESSING_AGENTS_PASSWORD };