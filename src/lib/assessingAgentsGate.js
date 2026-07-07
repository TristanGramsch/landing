const ASSESSING_AGENTS_PASSWORD = "justice";
const ASSESSING_AGENTS_UNLOCK_KEY = "assessing-agents-unlocked";

// The lock state used to be sessionStorage-only, which means it resets
// when opening a new tab/window or when navigating to the page via a
// fresh browser context. To make direct URL loads behave consistently,
// we treat localStorage as a fallback and write to both.
const ASSESSING_AGENTS_UNLOCK_STORAGE = ["sessionStorage", "localStorage"];

const ASSESSING_AGENTS_PATH = "/sociological/assessing-agents";

let assessingAgentsTwitchTimeout = null;

function getAssessingAgentsUnlockedFromStorage() {
  for (const storageName of ASSESSING_AGENTS_UNLOCK_STORAGE) {
    try {
      const storage = window?.[storageName];
      if (!storage) continue;
      if (storage.getItem(ASSESSING_AGENTS_UNLOCK_KEY) === "1") return true;
    } catch {
      // Ignore storage errors; best-effort privacy.
    }
  }
  return false;
}

export function isAssessingAgentsUnlocked() {
  return getAssessingAgentsUnlockedFromStorage();
}

export function setAssessingAgentsUnlocked(unlocked) {
  const value = unlocked ? "1" : null;

  for (const storageName of ASSESSING_AGENTS_UNLOCK_STORAGE) {
    try {
      const storage = window?.[storageName];
      if (!storage) continue;
      if (value) {
        storage.setItem(ASSESSING_AGENTS_UNLOCK_KEY, value);
      } else {
        storage.removeItem(ASSESSING_AGENTS_UNLOCK_KEY);
      }
    } catch {
      // Ignore storage errors; this is best-effort privacy.
    }
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
    const delayMs = 3_000 + Math.random() * 600;

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