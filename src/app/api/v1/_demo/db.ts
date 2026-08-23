import type { NextRequest } from "next/server"

/**
 * Transitional data layer for the four new cores.
 *
 * Priority: REAL BACKEND FIRST. When VERDANT_BACKEND_URL is set, every request
 * is proxied; only an upstream 404 falls back to the in-memory demo store, so
 * these surfaces work before Agent #1 ships and auto-upgrade afterwards.
 * Set VERDANT_DISABLE_MOCK_FALLBACK=1 to force pure proxy behaviour.
 *
 * The demo store is globalThis-persisted (survives HMR, resets on restart)
 * and exists ONLY behind this API boundary — UI never imports it.
 */

export type Rec = Record<string, unknown>

type Store = {
  proofs: Map<string, Rec>
  equipment: Map<string, Rec>
  leases: Map<string, Rec>
  projects: Map<string, Rec>
  animals: Map<string, Rec>
  animalEvents: Map<string, Rec[]> // key: animalId
}

type GlobalWithDb = typeof globalThis & { __verdantCoreDemo?: Store }

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

export function db(): Store {
  const g = globalThis as GlobalWithDb
  if (!g.__verdantCoreDemo) {
    const KEY = "GCWXIWY5VLB5K5UZD5KS2M3SKG7H3RCVQ7YHBO32N44VD5XUU6HBVSXJ"
    const KEY2 = "GBQWWK3DJ7DZQQ5EV3KY3G2CWNBZ2X6Q7YHBO32N44VD5XUU6HBVSXJ"
    const t = now()
    const proofVerified = {
      id: `va:proof:${uid()}`,
      subjectType: "batch",
      subjectId: "va:batch:0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b",
      claim: "Organic certification for harvest batch B-1041",
      status: "verified",
      creator: KEY,
      verificationId: "va:verification:000000000042",
      evidenceCount: 1,
      createdAt: t,
      updatedAt: t,
    }
    const evidence = [
      {
        id: `va:doc:${uid().replace(/-/g, "")}`,
        proofId: proofVerified.id,
        type: "document",
        uri: null,
        contentHash: "a3f9c1b2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
        metadata: { filename: "organic-cert.pdf", mimeType: "application/pdf" },
        submittedBy: KEY,
        createdAt: t,
      },
    ]
    const eq = (
      id: string,
      name: string,
      type: string,
      condition: string,
      location: string,
      rate: number,
      available: boolean
    ) => ({
      // Stable seed IDs keep links valid when a dev-server route worker or
      // hot reload recreates this in-memory demonstration catalogue.
      id,
      name,
      type,
      owner: KEY,
      description: null,
      condition,
      location,
      dailyRate: rate,
      available,
      verificationId: null,
      createdAt: t,
      updatedAt: t,
    })
    const tractor = eq(
      "va:equipment:019a0000-0000-7000-8000-000000000001",
      "John Deere 6R Tractor",
      "tractor",
      "excellent",
      "Niger, Zinder",
      50000,
      true
    )
    const harvester = eq(
      "va:equipment:019a0000-0000-7000-8000-000000000002",
      "Claas Harvester",
      "harvester",
      "good",
      "Ashanti, Ejisu",
      80000,
      false
    )
    const pivot = eq(
      "va:equipment:019a0000-0000-7000-8000-000000000003",
      "Irrigation Pivot 40ha",
      "irrigation",
      "fair",
      "Central, Cape Coast",
      30000,
      true
    )
    const leaseActive = {
      id: `va:booking:${uid()}`,
      equipmentId: harvester.id,
      renter: KEY2,
      startDate: "2026-09-01",
      endDate: "2026-09-10",
      status: "active",
      escrowId: "va:escrow:000000000007",
      totalAmount: 800000,
      paidAmount: 800000,
      createdAt: t,
      updatedAt: t,
    }
    const project = {
      id: `va:project:${uid()}`,
      title: "Dry-season irrigation expansion",
      description: "Extend the pivot system to 12 hectares and add drip lines for vegetable beds.",
      farmer: KEY,
      category: "infrastructure",
      fundingTarget: 50000000,
      fundedAmount: 20000000,
      status: "funding",
      milestones: [
        {
          index: 1,
          title: "Site survey & design",
          description: null,
          proofHash: "aa11",
          status: "approved",
          amount: 10000000,
          deadline: "2026-10-01",
          createdAt: t,
          updatedAt: t,
        },
        {
          index: 2,
          title: "Pivot installation",
          description: null,
          proofHash: null,
          status: "pending",
          amount: 25000000,
          deadline: "2026-11-15",
          createdAt: t,
          updatedAt: t,
        },
        {
          index: 3,
          title: "Drip lines commissioned",
          description: null,
          proofHash: null,
          status: "pending",
          amount: 15000000,
          deadline: "2026-12-20",
          createdAt: t,
          updatedAt: t,
        },
      ],
      createdAt: t,
      updatedAt: t,
    }
    const animal = (species: string, breed: string, name: string, tag: string) => ({
      id: `va:livestock:${uid()}`,
      species,
      breed,
      name,
      farm: "Daraku Farms",
      owner: KEY,
      identification: { tag },
      dateOfBirth: "2024-03-15",
      status: "active",
      verificationId: null,
      createdAt: t,
      updatedAt: t,
    })
    const cow = animal("cattle", "Angus", "Bessie", "BT-1234")
    const goat = animal("goat", "Boer", "Peanut", "GR-077")
    const sheep = animal("sheep", "Dorper", "Wooly", "SH-231")
    g.__verdantCoreDemo = {
      proofs: new Map([[proofVerified.id, { ...proofVerified, evidence }]]),
      equipment: new Map([
        [tractor.id, tractor],
        [harvester.id, harvester],
        [pivot.id, pivot],
      ]),
      leases: new Map([[leaseActive.id, leaseActive]]),
      projects: new Map([[project.id, project]]),
      animals: new Map([
        [cow.id, cow],
        [goat.id, goat],
        [sheep.id, sheep],
      ]),
      animalEvents: new Map([
        [
          cow.id,
          [
            {
              id: `va:event:${uid()}`,
              animalId: cow.id,
              type: "registration",
              data: { tag: "BT-1234" },
              recordedBy: KEY,
              proofId: null,
              createdAt: t,
            },
          ],
        ],
        [goat.id, []],
        [sheep.id, []],
      ]),
    }
  }
  return g.__verdantCoreDemo
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
}

export function paginated<T>(items: T[], req: NextRequest): Response {
  const sp = new URL(req.url).searchParams
  const page = Math.max(1, parseInt(sp.get("page") ?? "1") || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(sp.get("pageSize") ?? "20") || 20))
  const start = (page - 1) * pageSize
  return json({
    items: items.slice(start, start + pageSize),
    pagination: {
      page,
      pageSize,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    },
  })
}

/** Proxy to the real backend; returns null when it should fall back to demo. */
export async function proxy(req: NextRequest, path: string): Promise<Response | null> {
  const backend = process.env.VERDANT_BACKEND_URL
  if (!backend || process.env.VERDANT_DISABLE_MOCK_FALLBACK === "1") return null
  const url = `${backend}/api/v1/${path}${new URL(req.url).search}`
  const headers: Record<string, string> = { "content-type": "application/json" }
  const auth = req.headers.get("authorization")
  if (auth) headers["authorization"] = auth
  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body: req.method === "GET" ? undefined : await req.text(),
    })
    if (res.status === 404) return null // fall back to demo store
    const text = await res.text()
    return new Response(text, {
      status: res.status,
      headers: { "content-type": "application/json" },
    })
  } catch {
    return json({ error: "Could not reach the VerdAnt backend" }, 502)
  }
}

export function requireAuth(req: NextRequest): boolean {
  return !!req.headers.get("authorization")
}
