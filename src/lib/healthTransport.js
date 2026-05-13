export async function fetchHealthLog() {
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
