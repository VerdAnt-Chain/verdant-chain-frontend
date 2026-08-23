import { api } from "./client"
import { buildQueryPath, toListResponse, type ListResponse } from "./list"
import type {
  CreateProjectInput,
  FundProjectResponse,
  MilestoneMutationResponse,
  Project,
  ProjectCategory,
  ProjectStatus,
  ProjectSummary,
  SubmitMilestoneInput,
  UpdateProjectInput,
  VerifyMilestoneInput,
} from "./types"

export interface ListProjectsParams {
  status?: ProjectStatus
  category?: ProjectCategory
  farmer?: string
  page?: number
  pageSize?: number
}

export async function listProjects(
  params: ListProjectsParams = {}
): Promise<ListResponse<ProjectSummary>> {
  const path = buildQueryPath("/api/v1/projects", {
    status: params.status,
    category: params.category,
    farmer: params.farmer,
    page: params.page,
    pageSize: params.pageSize,
  })
  const data = await api.get<unknown>(path)
  return toListResponse<ProjectSummary>(data, params)
}

export async function getProject(id: string): Promise<Project> {
  return api.get<Project>(`/api/v1/projects/${encodeURIComponent(id)}`)
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  return api.post<Project>("/api/v1/projects", input)
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  return api.put<Project>(`/api/v1/projects/${encodeURIComponent(id)}`, input)
}

export async function publishProject(id: string): Promise<Project> {
  return api.post<Project>(`/api/v1/projects/${encodeURIComponent(id)}/publish`, {})
}

export async function fundProject(id: string, amount: number): Promise<FundProjectResponse> {
  return api.post<FundProjectResponse>(`/api/v1/projects/${encodeURIComponent(id)}/fund`, {
    amount,
  })
}

export async function submitMilestone(
  id: string,
  index: number,
  input: SubmitMilestoneInput
): Promise<MilestoneMutationResponse> {
  return api.post<MilestoneMutationResponse>(
    `/api/v1/projects/${encodeURIComponent(id)}/milestones/${encodeURIComponent(String(index))}/submit`,
    input
  )
}

export async function verifyMilestone(
  id: string,
  index: number,
  input: VerifyMilestoneInput
): Promise<MilestoneMutationResponse> {
  return api.post<MilestoneMutationResponse>(
    `/api/v1/projects/${encodeURIComponent(id)}/milestones/${encodeURIComponent(String(index))}/verify`,
    input
  )
}
