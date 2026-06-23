export const ROUTES = {
  "/": "home",
  "/sociological": "sociological",
  "/sociological/assessing-agents": "assessing-agents",
  "/sociological/government-flexibility": "government-flexibility",
  "/technological": "technological",
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
