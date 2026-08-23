import { describe, expect, it } from "vitest"
import { buildQueryPath, toListResponse } from "./list"

describe("toListResponse", () => {
  it("passes through a paginated envelope", () => {
    const data = {
      items: [{ id: "a" }, { id: "b" }],
      pagination: { page: 2, pageSize: 10, total: 21, totalPages: 3 },
    }
    expect(toListResponse<{ id: string }>(data, {})).toEqual(data)
  })

  it("normalizes a bare array with synthesized pagination", () => {
    const result = toListResponse<{ id: string }>([{ id: "a" }], { page: 1, pageSize: 20 })
    expect(result.items).toHaveLength(1)
    expect(result.pagination).toEqual({ page: 1, pageSize: 20, total: 1, totalPages: 1 })
  })

  it("synthesizes pagination when the envelope omits it", () => {
    const result = toListResponse<{ id: string }>(
      { items: [{ id: "a" }, { id: "b" }, { id: "c" }] },
      { page: 3, pageSize: 2 }
    )
    expect(result.pagination).toEqual({ page: 3, pageSize: 2, total: 3, totalPages: 2 })
  })

  it("returns an empty page for unexpected payloads", () => {
    const result = toListResponse<unknown>(null, {})
    expect(result.items).toEqual([])
    expect(result.pagination.total).toBe(0)
  })
})

describe("buildQueryPath", () => {
  it("appends non-empty params in insertion order", () => {
    expect(buildQueryPath("/proofs", { status: "verified", page: 2 })).toBe(
      "/proofs?status=verified&page=2"
    )
  })

  it("skips undefined and empty values", () => {
    expect(buildQueryPath("/equipment", { type: undefined, location: "", available: true })).toBe(
      "/equipment?available=true"
    )
  })

  it("returns the bare path with no params", () => {
    expect(buildQueryPath("/projects", {})).toBe("/projects")
  })

  it("stringifies booleans and numbers", () => {
    expect(buildQueryPath("/leases", { status: "active", pageSize: 50 })).toBe(
      "/leases?status=active&pageSize=50"
    )
  })
})
