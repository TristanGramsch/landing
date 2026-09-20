// One greeting per browser session, persisted in sessionStorage so navigation
// never re-rolls. Distribution: 25% Spanish male, 25% Spanish female, 50% English.
const GREETING_KEY = "greeting-variant";

const VARIANTS = [
  {
    hello: "Bienvenido, compañero",
    lede: "Escoja.",
    bubbles: ["Sociología", "Tecnología"],
  },
  {
    hello: "Bienvenida, compañera",
    lede: "Escoja.",
    bubbles: ["Sociología", "Tecnología"],
  },
  {
    hello: "Hello friend",
    lede: "Choose your path.",
    bubbles: ["Sociological", "Technological"],
  },
];

function pickIndex() {
  const spanish = Math.random() < 0.5;
  return spanish ? (Math.random() < 0.5 ? 0 : 1) : 2;
}

let index;
try {
  const stored = sessionStorage.getItem(GREETING_KEY);
  index =
    stored !== null && stored >= 0 && stored < VARIANTS.length
      ? Number(stored)
      : pickIndex();
  sessionStorage.setItem(GREETING_KEY, String(index));
} catch {
  index = pickIndex();
}

export const greeting = VARIANTS[index];