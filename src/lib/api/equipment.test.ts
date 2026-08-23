import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  approveLease,
  cancelLease,
  completeLease,
  createEquipment,
  createLease,
  getEquipment,
  getLease,
  listEquipment,
  listLeases,
  updateEquipment,
} from "./equipment"

const EQ_ID = "va:equipment:0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b"
const LEASE_ID = "va:booking:0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b"
const KEY = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

const equipment = {
  id: EQ_ID,
  name: "John Deere 6R Tractor",
  type: "tractor",
  owner: KEY,
  description: null,
  condition: "excellent",
  location: "Niger",
  dailyRate: 50000,
  available: true,
  verificationId: null,
  createdAt: "2026-08-20T10:00:00Z",
  updatedAt: "2026-08-20T10:00:00Z",
}

const lease = {
  id: LEASE_ID,
  equipmentId: EQ_ID,
  renter: KEY,
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  status: "requested",
  escrowId: "va:escrow:000000000007",
  totalAmount: 1500000,
  paidAmount: 0,
  createdAt: "2026-08-21T10:00:00Z",
  updatedAt: "2026-08-21T10:00:00Z",
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("listEquipment", () => {
  it("GETs /equipment with filters and normalizes the payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([equipment])))
    const result = await listEquipment({ type: "tractor", location: "Niger", available: true })
    expect(result.items).toEqual([equipment])
    expect(result.pagination.total).toBe(1)
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/equipment?type=tractor&location=Niger&available=true",
      expect.anything()
    )
  })
})

describe("getEquipment / create / update", () => {
  it("GETs /equipment/:id", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(equipment)))
    await expect(getEquipment(EQ_ID)).resolves.toEqual(equipment)
    expect(fetch).toHaveBeenCalledWith(
      `/api/v1/equipment/${encodeURIComponent(EQ_ID)}`,
      expect.anything()
    )
  })

  it("POSTs /equipment on create", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(equipment, 201)))
    const input = {
      name: equipment.name,
      type: "tractor" as const,
      condition: "excellent" as const,
      location: "Niger",
      dailyRate: 50000,
      available: true,
    }
    await expect(createEquipment(input)).resolves.toEqual(equipment)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe("/api/v1/equipment")
    expect((init as RequestInit).method).toBe("POST")
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(input)
  })

  it("PUTs partial updates to /equipment/:id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ ...equipment, condition: "fair" }))
    )
    await expect(
      updateEquipment(EQ_ID, { condition: "fair", dailyRate: 45000 })
    ).resolves.toMatchObject({
      condition: "fair",
    })
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/equipment/${encodeURIComponent(EQ_ID)}`)
    expect((init as RequestInit).method).toBe("PUT")
  })
})

describe("leases", () => {
  it("GETs /leases with filters", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([lease])))
    const result = await listLeases({ renter: KEY, status: "requested" })
    expect(result.items).toEqual([lease])
    expect(fetch).toHaveBeenCalledWith(
      `/api/v1/leases?renter=${encodeURIComponent(KEY)}&status=requested`,
      expect.anything()
    )
  })

  it("GETs a single lease", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(lease)))
    await expect(getLease(LEASE_ID)).resolves.toEqual(lease)
  })

  it("POSTs /leases to request a booking", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(lease, 201)))
    const input = { equipmentId: EQ_ID, startDate: "2026-09-01", endDate: "2026-09-30" }
    await expect(createLease(input)).resolves.toMatchObject({ status: "requested" })
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe("/api/v1/leases")
    expect((init as RequestInit).method).toBe("POST")
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(input)
  })

  it.each([
    ["approve", approveLease],
    ["complete", completeLease],
    ["cancel", cancelLease],
  ])("PUTs /leases/:id/%s for transitions", async (action, fn) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          ...lease,
          status:
            action === "approve" ? "approved" : action === "complete" ? "completed" : "cancelled",
        })
      )
    )
    await expect(fn(LEASE_ID)).resolves.toBeDefined()
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/leases/${encodeURIComponent(LEASE_ID)}/${action}`)
    expect((init as RequestInit).method).toBe("PUT")
  })
})
