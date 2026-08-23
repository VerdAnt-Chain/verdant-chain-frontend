import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { addEvidence, createProof, getProof, listProofs, submitProof, verifyProof } from "./proofs"

const PROOF_ID = "va:proof:0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b"
const KEY = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

const listItem = {
  id: PROOF_ID,
  subjectType: "batch",
  subjectId: "va:batch:0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b",
  claim: "Organic certification for harvest batch B-1041",
  status: "verified",
  creator: KEY,
  verificationId: "va:verification:000000000042",
  evidenceCount: 1,
  createdAt: "2026-08-20T10:00:00Z",
  updatedAt: "2026-08-21T14:30:00Z",
}

const evidence = {
  id: "va:doc:a3f9c1",
  proofId: PROOF_ID,
  type: "document",
  uri: null,
  contentHash: "a3f9c1",
  metadata: { filename: "organic-cert.pdf" },
  submittedBy: KEY,
  createdAt: "2026-08-20T10:00:00Z",
}

const detail = { ...listItem, evidenceCount: undefined, evidence: [evidence] }

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

describe("listProofs", () => {
  it("GETs /proofs with filter params and returns the envelope", async () => {
    const envelope = {
      items: [listItem],
      pagination: { page: 1, pageSize: 20, total: 15, totalPages: 1 },
    }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(envelope)))
    await expect(
      listProofs({ status: "verified", subjectType: "batch", page: 1 })
    ).resolves.toEqual(envelope)
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/proofs?status=verified&subjectType=batch&page=1",
      expect.anything()
    )
  })

  it("normalizes a bare-array payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([listItem])))
    const result = await listProofs({ creator: KEY })
    expect(result.items).toEqual([listItem])
    expect(result.pagination.total).toBe(1)
  })
})

describe("getProof", () => {
  it("GETs /proofs/:id and returns the detail with evidence", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(detail)))
    await expect(getProof(PROOF_ID)).resolves.toEqual(detail)
    expect(fetch).toHaveBeenCalledWith(
      `/api/v1/proofs/${encodeURIComponent(PROOF_ID)}`,
      expect.anything()
    )
  })
})

describe("createProof", () => {
  it("POSTs /proofs with the create input", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ ...detail, status: "draft" }, 201))
    )
    const input = {
      subjectType: "batch" as const,
      subjectId: listItem.subjectId,
      claim: listItem.claim,
    }
    await expect(createProof(input)).resolves.toMatchObject({ status: "draft" })
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe("/api/v1/proofs")
    expect((init as RequestInit).method).toBe("POST")
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(input)
  })
})

describe("addEvidence", () => {
  it("POSTs to /proofs/:id/evidence", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(evidence, 201)))
    const input = {
      type: "document" as const,
      contentHash: "a3f9c1",
      uri: null,
      metadata: { filename: "organic-cert.pdf" },
    }
    await expect(addEvidence(PROOF_ID, input)).resolves.toEqual(evidence)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/proofs/${encodeURIComponent(PROOF_ID)}/evidence`)
    expect((init as RequestInit).method).toBe("POST")
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(input)
  })
})

describe("submitProof", () => {
  it("POSTs to /proofs/:id/submit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ ...detail, status: "submitted" }))
    )
    await expect(submitProof(PROOF_ID)).resolves.toMatchObject({ status: "submitted" })
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/proofs/${encodeURIComponent(PROOF_ID)}/submit`)
    expect((init as RequestInit).method).toBe("POST")
  })
})

describe("verifyProof", () => {
  it("POSTs the verifier decision to /proofs/:id/verify", async () => {
    const response = {
      proof: { ...detail, status: "verified" },
      verification: {
        proofId: PROOF_ID,
        verifier: KEY,
        status: "approved",
        decision: "ok",
        notes: null,
        createdAt: "2026-08-21T14:30:00Z",
      },
    }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(response)))
    const input = { status: "approved" as const, decision: "ok" }
    await expect(verifyProof(PROOF_ID, input)).resolves.toEqual(response)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/proofs/${encodeURIComponent(PROOF_ID)}/verify`)
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(input)
  })
})
