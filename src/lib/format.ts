/**
 * Deterministic thousands separator. Unlike `Number.prototype.toLocaleString()`,
 * this produces identical output on the server (Node) and the client (browser)
 * regardless of runtime locale, so it never causes a hydration mismatch.
 */
export function formatNumber(n: number): string {
  return Math.trunc(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
