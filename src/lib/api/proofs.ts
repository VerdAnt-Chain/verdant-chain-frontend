import { api } from "./client"
import { buildQueryPath, toListResponse, type ListResponse } from "./list"
import type {
  AddEvidenceInput,
  CreateProofInput,
  Evidence,
  ProofDetail,
  ProofListItem,
  ProofStatus,
  ProofSubjectType,
  VerifyProofInput,
  VerifyProofResponse,
} from "./types"

export interface ListProofsParams {
  status?: ProofStatus
  subjectType?: ProofSubjectType
  subjectId?: string
  creator?: string
  page?: number
  pageSize?: number
}

export async function listProofs(
  params: ListProofsParams = {}
): Promise<ListResponse<ProofListItem>> {
  const path = buildQueryPath("/api/v1/proofs", {
    status: params.status,
    subjectType: params.subjectType,
    subjectId: params.subjectId,
    creator: params.creator,
    page: params.page,
    pageSize: params.pageSize,
  })
  const data = await api.get<unknown>(path)
  return toListResponse<ProofListItem>(data, params)
}

export async function getProof(id: string): Promise<ProofDetail> {
  return api.get<ProofDetail>(`/api/v1/proofs/${encodeURIComponent(id)}`)
}

export async function createProof(input: CreateProofInput): Promise<ProofDetail> {
  return api.post<ProofDetail>("/api/v1/proofs", input)
}

export async function addEvidence(proofId: string, input: AddEvidenceInput): Promise<Evidence> {
  return api.post<Evidence>(`/api/v1/proofs/${encodeURIComponent(proofId)}/evidence`, input)
}

export async function submitProof(proofId: string): Promise<ProofDetail> {
  return api.post<ProofDetail>(`/api/v1/proofs/${encodeURIComponent(proofId)}/submit`, {})
}

export async function verifyProof(
  proofId: string,
  input: VerifyProofInput
): Promise<VerifyProofResponse> {
  return api.post<VerifyProofResponse>(
    `/api/v1/proofs/${encodeURIComponent(proofId)}/verify`,
    input
  )
}
export type { ProofListItem, ProofStatus, ProofSubjectType } from "./types"
