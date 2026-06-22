// Aithreus embeddable widget runtime (loader).
// Phase-2 placeholder — the full runtime (scan .aithreus-widget nodes, fetch published
// config per configId, render data-driven operator CTAs, fire impression beacons,
// style isolation) is built in Phase 4 per specs/20-runtime/03-embed-widget.md.
(function () {
  if (typeof window === "undefined") return;
  // Marker so we can confirm the bundle loaded during early integration.
  (window as unknown as Record<string, unknown>).__AITHREUS_WIDGET__ = { version: "v1", ready: false };
})();
