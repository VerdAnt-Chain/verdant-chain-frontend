/**
 * Integer-safe presentation formatting for on-chain amounts.
 *
 * 1 XLM = 10,000,000 stroops. Amounts arrive from the API as integers
 * (or integer-safe strings) in stroops. All arithmetic here uses BigInt;
 * floating point is never used for monetary values.
 */

const STROOPS_PER_UNIT = BigInt(10000000)

export type FormatStroopsOptions = {
  /** Fractional digits to render (default 2). */
  decimals?: number
  /** Currency symbol suffix (default "XLM"; pass "" to omit). */
  symbol?: string
}

/**
 * Format a stroop amount for display, e.g. 1250000000 -> "125.00 XLM".
 * Rounds half-up at the presentation boundary only; never mutates data.
 */
export function formatStroops(
  stroops: number | bigint | string,
  options?: FormatStroopsOptions
): string {
  const decimals = Math.max(0, Math.min(options?.decimals ?? 2, 7))
  const symbol = options?.symbol ?? "XLM"
  const raw = typeof stroops === "string" ? stroops.trim() : stroops
  const value = BigInt(raw === "" || raw === "+" ? 0 : raw)
  const negative = value < BigInt(0)
  const abs = negative ? -value : value

  const scale = BigInt(Math.pow(10, decimals))
  const half = STROOPS_PER_UNIT / BigInt(2)
  const scaled = (abs * scale + half) / STROOPS_PER_UNIT
  const whole = scaled / scale
  const frac = scaled % scale

  const wholeStr = whole.toLocaleString("en-US")
  const fracStr = decimals > 0 ? "." + frac.toString().padStart(decimals, "0") : ""
  const sign = negative && abs !== BigInt(0) ? "-" : ""
  return `${sign}${wholeStr}${fracStr}${symbol ? ` ${symbol}` : ""}`
}
