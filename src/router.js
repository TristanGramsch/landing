export const ROUTES = {
  "/": "home",
  "/sociological": "sociological",
  "/sociological/ditto-pitch-80": "ditto-pitch-80",
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
