import { describe, expect, it } from "vitest"
import { formatStroops } from "./format"

describe("formatStroops", () => {
  it("formats zero", () => {
    expect(formatStroops(0)).toBe("0.00 XLM")
  })

  it("converts stroops to XLM with 2 decimals", () => {
    expect(formatStroops(1250000000)).toBe("125.00 XLM")
    expect(formatStroops(123456789)).toBe("12.35 XLM")
  })

  it("rounds half-up at the presentation boundary only", () => {
    // exactly half a hundredth
    expect(formatStroops(50000)).toBe("0.01 XLM")
    expect(formatStroops(49999)).toBe("0.00 XLM")
  })

  it("handles negative amounts", () => {
    expect(formatStroops(-2500000)).toBe("-0.25 XLM")
    expect(formatStroops(-1)).toBe("-0.00 XLM")
  })

  it("supports custom decimals and symbol", () => {
    expect(formatStroops(1234567, { decimals: 7 })).toBe("0.1234567 XLM")
    expect(formatStroops(100000000, { decimals: 0 })).toBe("10 XLM")
    expect(formatStroops(5000000, { symbol: "" })).toBe("0.50")
  })

  it("accepts integer-safe string input beyond Number.MAX_SAFE_INTEGER", () => {
    const huge = "900719925474099300000000"
    // Naive Number(huge)/1e7 would lose precision; BigInt must not.
    expect(formatStroops(huge)).toBe("90,071,992,547,409,930.00 XLM")
  })

  it("accepts bigint input", () => {
    expect(formatStroops(BigInt("987654321"))).toBe("98.77 XLM")
  })
})
