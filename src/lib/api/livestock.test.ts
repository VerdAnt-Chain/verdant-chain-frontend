import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  acceptTransfer,
  completeTransfer,
  getAnimal,
  getAnimalHistory,
  initiateTransfer,
  listAnimals,
  recordAnimalEvent,
  registerAnimal,
  updateAnimal,
} from "./livestock"

const ANIMAL_ID = "va:livestock:0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b"
const KEY = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

const animal = {
  id: ANIMAL_ID,
  species: "cattle",
  breed: "Angus",
  name: "Bessie",
  farm: "Happy Valley Farm",
  owner: KEY,
  identification: { tag: "BT-1234", microchip: "1234567890" },
  dateOfBirth: "2024-03-15",
  status: "active",
  verificationId: null,
  createdAt: "2026-08-20T10:00:00Z",
  updatedAt: "2026-08-20T10:00:00Z",
}

const event = {
  id: "va:event:0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b",
  animalId: ANIMAL_ID,
  type: "health",
  data: {
    symptoms: "lameness",
    diagnosis: "footrot",
    treatment: "antibiotics",
    veterinarian: "Dr. Ada",
  },
  recordedBy: KEY,
  proofId: null,
  createdAt: "2026-08-21T10:00:00Z",
}

const transfer = {
  id: "transfer-1",
  from: KEY,
  to: "GBQWWK3DJ7DZQQ5EV3KY3G2CWNBZ2X6Q7YHBO32N44VD5XUU6HBVSXJ",
  animalId: ANIMAL_ID,
  status: "pending",
  initiatedAt: "2026-08-22T10:00:00Z",
  completedAt: null,
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

describe("listAnimals", () => {
  it("GETs /livestock with filters", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([animal])))
    const result = await listAnimals({ species: "cattle", status: "active" })
    expect(result.items).toEqual([animal])
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/livestock?species=cattle&status=active",
      expect.anything()
    )
  })
})

describe("getAnimal / history", () => {
  it("GETs a single animal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(animal)))
    await expect(getAnimal(ANIMAL_ID)).resolves.toEqual(animal)
    expect(fetch).toHaveBeenCalledWith(
      `/api/v1/livestock/${encodeURIComponent(ANIMAL_ID)}`,
      expect.anything()
    )
  })

  it("GETs the bare-array event history", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([event])))
    await expect(getAnimalHistory(ANIMAL_ID)).resolves.toEqual([event])
    expect(fetch).toHaveBeenCalledWith(
      `/api/v1/livestock/${encodeURIComponent(ANIMAL_ID)}/history`,
      expect.anything()
    )
  })

  it("normalizes an envelope history payload defensively", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ items: [event] })))
    await expect(getAnimalHistory(ANIMAL_ID)).resolves.toEqual([event])
  })
})

describe("register / update / events", () => {
  it("POSTs /livestock to register an animal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(animal, 201)))
    const input = {
      species: "cattle",
      breed: "Angus",
      name: "Bessie",
      farm: "Happy Valley Farm",
      identification: { tag: "BT-1234", microchip: "1234567890" },
      dateOfBirth: "2024-03-15",
    }
    await expect(registerAnimal(input)).resolves.toEqual(animal)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe("/api/v1/livestock")
    expect((init as RequestInit).method).toBe("POST")
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(input)
  })

  it("PUTs partial updates to /livestock/:id", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(animal)))
    await expect(updateAnimal(ANIMAL_ID, { name: "Bessie II" })).resolves.toBeDefined()
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/livestock/${encodeURIComponent(ANIMAL_ID)}`)
    expect((init as RequestInit).method).toBe("PUT")
  })

  it("POSTs typed events to /livestock/:id/events", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(event, 201)))
    const input = { type: "health" as const, data: event.data }
    await expect(recordAnimalEvent(ANIMAL_ID, input)).resolves.toEqual(event)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/livestock/${encodeURIComponent(ANIMAL_ID)}/events`)
    expect((init as RequestInit).method).toBe("POST")
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(input)
  })
})

describe("transfer workflow", () => {
  it("POSTs /transfer to initiate", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(transfer, 201)))
    const input = { toOwner: transfer.to, consent: true }
    await expect(initiateTransfer(ANIMAL_ID, input)).resolves.toMatchObject({ status: "pending" })
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/livestock/${encodeURIComponent(ANIMAL_ID)}/transfer`)
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(input)
  })

  it("PUTs /transfer/accept", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ ...transfer, status: "accepted" }))
    )
    await expect(acceptTransfer(ANIMAL_ID)).resolves.toMatchObject({ status: "accepted" })
    const url = vi.mocked(fetch).mock.calls[0][0]
    expect(url).toBe(`/api/v1/livestock/${encodeURIComponent(ANIMAL_ID)}/transfer/accept`)
  })

  it("PUTs /transfer/complete and returns animal + transfer", async () => {
    const response = {
      animal: { ...animal, owner: transfer.to, status: "transferred" },
      transfer: { ...transfer, status: "completed", completedAt: "2026-08-23T10:00:00Z" },
    }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(response)))
    await expect(completeTransfer(ANIMAL_ID)).resolves.toEqual(response)
    const url = vi.mocked(fetch).mock.calls[0][0]
    expect(url).toBe(`/api/v1/livestock/${encodeURIComponent(ANIMAL_ID)}/transfer/complete`)
  })
})
