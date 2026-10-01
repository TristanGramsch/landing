export const ROUTES = {
  "/": "home",
  "/sociological": "sociological",
  "/sociological/government-flexibility": "government-flexibility",
  "/sociological/mantenerse-abierto": "mantenerse-abierto",
  "/sociological/the-perfect-assessors-office": "perfect-assessors-office",
  "/sociological/ser": "ser",
  "/technological": "technological",
  "/technological/assessing-agents": "assessing-agents",
  "/technological/optoelectronica": "optoelectronica",
  "/technological/system-health": "system-health",
};

export function normalizePath(path) {
  const normalized = path.replace(/\/$/, "");
  return normalized === "" ? "/" : normalized;
}

export function getRoute(path) {
  return ROUTES[normalizePath(path)] || null;
}
