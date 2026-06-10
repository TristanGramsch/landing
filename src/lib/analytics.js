export function trackPageView(path) {
  if (typeof window.plausible === "function") {
    window.plausible("pageview", { u: `${window.location.origin}${path}` });
  }
}

export function trackTimeOnPage({ path, pageEnteredAt }) {
  const durationSeconds = Math.max(1, Math.round((Date.now() - pageEnteredAt) / 1000));

  if (typeof window.plausible === "function") {
    window.plausible("Time on Page", {
      props: {
        path,
        duration_seconds: durationSeconds,
      },
    });
  }
}
