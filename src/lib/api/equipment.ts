import { api } from "./client"
import { buildQueryPath, toListResponse, type ListResponse } from "./list"
import type {
  CreateEquipmentInput,
  CreateLeaseInput,
  Equipment,
  EquipmentType,
  Lease,
  ListLeasesParams,
  UpdateEquipmentInput,
} from "./types"

export interface ListEquipmentParams {
  type?: EquipmentType
  location?: string
  available?: boolean
  owner?: string
  page?: number
  pageSize?: number
}

export async function listEquipment(
  params: ListEquipmentParams = {}
): Promise<ListResponse<Equipment>> {
  const path = buildQueryPath("/api/v1/equipment", {
    type: params.type,
    location: params.location,
    available: params.available,
    owner: params.owner,
    page: params.page,
    pageSize: params.pageSize,
  })
  const data = await api.get<unknown>(path)
  return toListResponse<Equipment>(data, params)
}

export async function getEquipment(id: string): Promise<Equipment> {
  return api.get<Equipment>(`/api/v1/equipment/${encodeURIComponent(id)}`)
}

export async function createEquipment(input: CreateEquipmentInput): Promise<Equipment> {
  return api.post<Equipment>("/api/v1/equipment", input)
}

export async function updateEquipment(id: string, input: UpdateEquipmentInput): Promise<Equipment> {
  return api.put<Equipment>(`/api/v1/equipment/${encodeURIComponent(id)}`, input)
}

export async function listLeases(params: ListLeasesParams = {}): Promise<ListResponse<Lease>> {
  const path = buildQueryPath("/api/v1/leases", {
    renter: params.renter,
    equipmentId: params.equipmentId,
    status: params.status,
    page: params.page,
    pageSize: params.pageSize,
  })
  const data = await api.get<unknown>(path)
  return toListResponse<Lease>(data, params)
}

export async function getLease(id: string): Promise<Lease> {
  return api.get<Lease>(`/api/v1/leases/${encodeURIComponent(id)}`)
}

export async function createLease(input: CreateLeaseInput): Promise<Lease> {
  return api.post<Lease>("/api/v1/leases", input)
}

async function leaseTransition(
  id: string,
  action: "approve" | "complete" | "cancel"
): Promise<Lease> {
  return api.put<Lease>(`/api/v1/leases/${encodeURIComponent(id)}/${action}`, {})
}

export function approveLease(id: string): Promise<Lease> {
  return leaseTransition(id, "approve")
}

export function completeLease(id: string): Promise<Lease> {
  return leaseTransition(id, "complete")
}

export function cancelLease(id: string): Promise<Lease> {
  return leaseTransition(id, "cancel")
}
