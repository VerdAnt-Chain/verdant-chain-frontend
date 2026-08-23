import { api } from "./client"
import type {
  FarmerProfileMetadata,
  FarmerRecord,
  FarmerSearchResponse,
  RegisterFarmerInput,
  SearchFarmersParams,
} from "./types"
import type { FarmerSearchItem } from "./types"

export type { FarmerSearchItem, FarmerSearchResponse, SearchFarmersParams }

export async function getFarmer(address: string): Promise<FarmerRecord> {
  return api.get<FarmerRecord>(`/api/v1/farmers/${encodeURIComponent(address)}`)
}

export async function searchFarmers(params: SearchFarmersParams): Promise<FarmerSearchResponse> {
  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set("q", params.q)
  if (params.page) searchParams.set("page", String(params.page))
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize))
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return api.get<FarmerSearchResponse>(`/api/v1/farmers${query}`)
}

export async function registerFarmer(input: RegisterFarmerInput): Promise<FarmerRecord> {
  return api.post<FarmerRecord>("/api/v1/farmers/register", input)
}

export async function updateFarmerMetadata(
  address: string,
  metadata: FarmerProfileMetadata
): Promise<FarmerRecord> {
  return api.put<FarmerRecord>(`/api/v1/farmers/${encodeURIComponent(address)}/metadata`, { metadata })
}
