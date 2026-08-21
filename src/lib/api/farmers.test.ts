import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError, isNotFound } from "./client"
import { getFarmer, registerFarmer, updateFarmerMetadata, searchFarmers } from "./farmers"

const KEY = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
const FARMER_ID = `va:farmer:${KEY}`

const record = {
  address: KEY,
  id: FARMER_ID,
  registered: true,
  createdLedger: 100,
  updatedLedger: 200,
  metadata: { hash: "abc", profile: { name: "Ada Farm Cooperative", region: "Niger" } },
  verificationMarkers: [],
}

const searchResponse = {
  items: [
    {
      address: KEY,
      id: FARMER_ID,
      name: "Ada Farm Cooperative",
      region: "Niger",
      district: "Zinder",
      verificationCount: 3,
    },
  ],
  pagination: { page: 1, pageSize: 20, total: 42, totalPages: 3 },
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn())
  vi.unstubAllGlobals()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("getFarmer", () => {
  it("returns the farmer record for an address", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(record)))
    await expect(getFarmer(KEY)).resolves.toEqual(record)
    expect(fetch).toHaveBeenCalledWith(
      `/api/v1/farmers/${encodeURIComponent(KEY)}`,
      expect.anything()
    )
  })

  it("throws a typed 404 ApiError for unknown farmers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ error: "unknown farmer" }, 404))
    )
    const error = await getFarmer(KEY).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(404)
    expect(isNotFound(error)).toBe(true)
  })

  it("wraps network failures as ApiError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")))
    const error = await getFarmer(KEY).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).message).toBe("Could not reach the VerdAnt API")
  })
})

describe("searchFarmers", () => {
  it("GETs /farmers with query params", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(searchResponse)))
    await expect(searchFarmers({ q: "Ada", page: 2, pageSize: 10 })).resolves.toEqual(
      searchResponse
    )
    expect(fetch).toHaveBeenCalledWith(
      `/api/v1/farmers?q=Ada&page=2&pageSize=10`,
      expect.anything()
    )
  })

  it("omits empty params", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(searchResponse)))
    await expect(searchFarmers({})).resolves.toEqual(searchResponse)
    expect(fetch).toHaveBeenCalledWith("/api/v1/farmers", expect.anything())
  })

  it("handles pagination params", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(searchResponse)))
    await expect(searchFarmers({ page: 3, pageSize: 50 })).resolves.toEqual(searchResponse)
    expect(fetch).toHaveBeenCalledWith("/api/v1/farmers?page=3&pageSize=50", expect.anything())
  })
})

describe("registerFarmer", () => {
  it("posts to /farmers/register", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(record, 201)))
    const input = { address: KEY, metadata: { name: "Ada Farm Cooperative" } }
    await expect(registerFarmer(input)).resolves.toEqual(record)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe("/api/v1/farmers/register")
    expect((init as RequestInit).method).toBe("POST")
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(input)
  })
})

describe("updateFarmerMetadata", () => {
  it("puts to /farmers/:address/metadata", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(record)))
    await expect(
      updateFarmerMetadata(KEY, { name: "Ada Farm Cooperative", region: "Zinder" })
    ).resolves.toEqual(record)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/farmers/${encodeURIComponent(KEY)}/metadata`)
    expect((init as RequestInit).method).toBe("PUT")
  })
})
