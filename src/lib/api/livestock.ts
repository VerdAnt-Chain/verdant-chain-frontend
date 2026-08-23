import { api } from "./client"
import { buildQueryPath, toListResponse, type ListResponse } from "./list"
import type {
  Animal,
  AnimalEvent,
  AnimalStatus,
  CompleteTransferResponse,
  OwnershipTransfer,
  RecordAnimalEventInput,
  RegisterAnimalInput,
  TransferAnimalInput,
  UpdateAnimalInput,
} from "./types"

export interface ListAnimalsParams {
  species?: string
  breed?: string
  farm?: string
  owner?: string
  status?: AnimalStatus
  page?: number
  pageSize?: number
}

export async function listAnimals(params: ListAnimalsParams = {}): Promise<ListResponse<Animal>> {
  const path = buildQueryPath("/api/v1/livestock", {
    species: params.species,
    breed: params.breed,
    farm: params.farm,
    owner: params.owner,
    status: params.status,
    page: params.page,
    pageSize: params.pageSize,
  })
  const data = await api.get<unknown>(path)
  return toListResponse<Animal>(data, params)
}

export async function getAnimal(id: string): Promise<Animal> {
  return api.get<Animal>(`/api/v1/livestock/${encodeURIComponent(id)}`)
}

/** GET /livestock/:id/history returns a bare event array per the contract. */
export async function getAnimalHistory(id: string): Promise<AnimalEvent[]> {
  const data = await api.get<unknown>(`/api/v1/livestock/${encodeURIComponent(id)}/history`)
  if (Array.isArray(data)) return data as AnimalEvent[]
  const items = (data as { items?: AnimalEvent[] } | null)?.items
  return Array.isArray(items) ? items : []
}

export async function registerAnimal(input: RegisterAnimalInput): Promise<Animal> {
  return api.post<Animal>("/api/v1/livestock", input)
}

export async function updateAnimal(id: string, input: UpdateAnimalInput): Promise<Animal> {
  return api.put<Animal>(`/api/v1/livestock/${encodeURIComponent(id)}`, input)
}

export async function recordAnimalEvent(
  id: string,
  input: RecordAnimalEventInput
): Promise<AnimalEvent> {
  return api.post<AnimalEvent>(`/api/v1/livestock/${encodeURIComponent(id)}/events`, input)
}

export async function initiateTransfer(
  id: string,
  input: TransferAnimalInput
): Promise<OwnershipTransfer> {
  return api.post<OwnershipTransfer>(`/api/v1/livestock/${encodeURIComponent(id)}/transfer`, input)
}

export async function acceptTransfer(id: string): Promise<OwnershipTransfer> {
  return api.put<OwnershipTransfer>(
    `/api/v1/livestock/${encodeURIComponent(id)}/transfer/accept`,
    {}
  )
}

export async function completeTransfer(id: string): Promise<CompleteTransferResponse> {
  return api.put<CompleteTransferResponse>(
    `/api/v1/livestock/${encodeURIComponent(id)}/transfer/complete`,
    {}
  )
}
