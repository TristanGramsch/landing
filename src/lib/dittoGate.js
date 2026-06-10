const DITTO_PITCH_80_PASSWORD = "justice";
const DITTO_PITCH_80_UNLOCK_KEY = "ditto-pitch-80-unlocked";

const DITTO_PITCH_80_PATH = "/sociological/ditto-pitch-80";

let dittoPitch80TwitchTimeout = null;

export function isDittoPitch80Unlocked() {
  try {
    return sessionStorage.getItem(DITTO_PITCH_80_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function setDittoPitch80Unlocked(unlocked) {
  try {
    if (unlocked) {
      sessionStorage.setItem(DITTO_PITCH_80_UNLOCK_KEY, "1");
    } else {
      sessionStorage.removeItem(DITTO_PITCH_80_UNLOCK_KEY);
    }
  } catch {
    // Ignore storage errors; this is best-effort privacy.
  }
}

function stopDittoPitch80TwitchInternal() {
  if (dittoPitch80TwitchTimeout) {
    window.clearTimeout(dittoPitch80TwitchTimeout);
    dittoPitch80TwitchTimeout = null;
  }
}

function triggerDittoPitch80Twitch() {
  const input = document.querySelector("#ditto-password-input");
  if (!input) return;

  if (isDittoPitch80Unlocked()) {
    return;
  }

  input.classList.remove("ditto-auth-twitch");
  void input.offsetWidth;
  input.classList.add("ditto-auth-twitch");

  window.setTimeout(() => {
    input.classList.remove("ditto-auth-twitch");
  }, 160);
}

export function stopDittoPitch80Twitch() {
  stopDittoPitch80TwitchInternal();
}

export function bindDittoPitch80KeyTwitch() {
  const input = document.querySelector("#ditto-password-input");
  if (!input) return;

  if (input.dataset.dittoKeyBound === "1") {
    return;
  }

  input.dataset.dittoKeyBound = "1";

  input.addEventListener(
    "keydown",
    () => {
      if (isDittoPitch80Unlocked()) return;
      triggerDittoPitch80Twitch();
    },
    { passive: true },
  );
}

export function startDittoPitch80Twitch({ getIsBooted, getCurrentPath } = {}) {
  stopDittoPitch80TwitchInternal();

  const scheduleNext = () => {
    const delayMs = 250 + Math.random() * 250;

    dittoPitch80TwitchTimeout = window.setTimeout(() => {
      const isBooted = getIsBooted?.() ?? false;
      const currentPath = getCurrentPath?.() ?? "";

      if (!isBooted || currentPath !== DITTO_PITCH_80_PATH || isDittoPitch80Unlocked()) {
        stopDittoPitch80TwitchInternal();
        return;
      }

      const input = document.querySelector("#ditto-password-input");
      if (!input) {
        stopDittoPitch80TwitchInternal();
        return;
      }

      triggerDittoPitch80Twitch();
      scheduleNext();
    }, delayMs);
  };

  scheduleNext();
}

export { DITTO_PITCH_80_PASSWORD };
