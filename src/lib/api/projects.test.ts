import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  createProject,
  fundProject,
  getProject,
  listProjects,
  publishProject,
  submitMilestone,
  updateProject,
  verifyMilestone,
} from "./projects"

const PROJECT_ID = "va:project:0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b"
const KEY = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

const milestone = {
  index: 1,
  title: "Land preparation",
  description: null,
  proofHash: null,
  status: "approved",
  amount: 2000000,
  deadline: "2026-10-01",
  createdAt: "2026-08-20T10:00:00Z",
  updatedAt: "2026-08-21T10:00:00Z",
}

const project = {
  id: PROJECT_ID,
  title: "Land Preparation for Rainy Season",
  description: "Prepare fields and install irrigation.",
  farmer: KEY,
  category: "infrastructure",
  fundingTarget: 5000000,
  fundedAmount: 2000000,
  status: "funding",
  milestones: [milestone],
  createdAt: "2026-08-20T10:00:00Z",
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

describe("listProjects", () => {
  it("GETs /projects with filters", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([project])))
    const result = await listProjects({ category: "infrastructure", status: "funding" })
    expect(result.items).toEqual([project])
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/projects?status=funding&category=infrastructure",
      expect.anything()
    )
  })
})

describe("getProject / create / update / publish", () => {
  it("GETs /projects/:id with milestones", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(project)))
    await expect(getProject(PROJECT_ID)).resolves.toEqual(project)
    expect(fetch).toHaveBeenCalledWith(
      `/api/v1/projects/${encodeURIComponent(PROJECT_ID)}`,
      expect.anything()
    )
  })

  it("POSTs /projects on create", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ ...project, status: "draft" }, 201))
    )
    const input = {
      title: project.title,
      description: project.description,
      category: "infrastructure" as const,
      fundingTarget: 5000000,
    }
    await expect(createProject(input)).resolves.toMatchObject({ status: "draft" })
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe("/api/v1/projects")
    expect((init as RequestInit).method).toBe("POST")
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(input)
  })

  it("PUTs partial updates", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(project)))
    await expect(updateProject(PROJECT_ID, { description: "Updated" })).resolves.toBeDefined()
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/projects/${encodeURIComponent(PROJECT_ID)}`)
    expect((init as RequestInit).method).toBe("PUT")
  })

  it("POSTs /publish", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ ...project, status: "published" }))
    )
    await expect(publishProject(PROJECT_ID)).resolves.toMatchObject({ status: "published" })
    const url = vi.mocked(fetch).mock.calls[0][0]
    expect(url).toBe(`/api/v1/projects/${encodeURIComponent(PROJECT_ID)}/publish`)
  })
})

describe("fundProject", () => {
  it("POSTs the contribution amount and returns project + receipt", async () => {
    const response = {
      project: { ...project, fundedAmount: 3000000 },
      receipt: {
        id: "receipt-1",
        projectId: PROJECT_ID,
        contributor: KEY,
        amount: 1000000,
        status: "confirmed",
        createdAt: "2026-08-22T10:00:00Z",
      },
    }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(response)))
    await expect(fundProject(PROJECT_ID, 1000000)).resolves.toEqual(response)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/projects/${encodeURIComponent(PROJECT_ID)}/fund`)
    expect((init as RequestInit).method).toBe("POST")
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ amount: 1000000 })
  })
})

describe("milestones", () => {
  it("POSTs milestone submit with proofHash", async () => {
    const response = {
      milestone: { ...milestone, status: "submitted", proofHash: "abc" },
      project,
    }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(response)))
    await expect(submitMilestone(PROJECT_ID, 1, { proofHash: "abc" })).resolves.toEqual(response)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/projects/${encodeURIComponent(PROJECT_ID)}/milestones/1/submit`)
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ proofHash: "abc" })
  })

  it("POSTs milestone verify decision", async () => {
    const response = {
      milestone: { ...milestone, status: "verified" },
      project,
    }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(response)))
    const input = { status: "approved" as const, decision: "Field conditions met." }
    await expect(verifyMilestone(PROJECT_ID, 2, input)).resolves.toEqual(response)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`/api/v1/projects/${encodeURIComponent(PROJECT_ID)}/milestones/2/verify`)
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(input)
  })
})
