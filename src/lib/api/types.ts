export type VerificationMarker = {
  kind: string
  issuer: string
  issuedLedger: number
}

export type FarmerProfileMetadata = {
  name: string
  region?: string
  district?: string
  bio?: string
  profileImageHash?: string
}

export type FarmerMetadataBlock = {
  hash: string
  profile: FarmerProfileMetadata
}

export type FarmerRecord = {
  address: string
  id: string
  registered: boolean
  createdLedger?: number
  updatedLedger?: number
  // Backend returns flat FarmerProfileMetadata as `metadata` plus `metadataHash`.
  // Keep support for the docs contract shape { hash, profile } for forward compat.
  metadata?: FarmerProfileMetadata | FarmerMetadataBlock
  metadataHash?: string
  verificationMarkers?: VerificationMarker[]
}

export type RegisterFarmerInput = {
  address: string
  metadata: FarmerProfileMetadata
  metadataHash?: string
}

export type FarmerSearchItem = {
  address: string
  id: string
  name: string
  region?: string
  district?: string
  verificationCount: number
}

export type FarmerSearchResponse = {
  items: FarmerSearchItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type SearchFarmersParams = {
  q?: string
  page?: number
  pageSize?: number
}

export type AuthChallenge = {
  domain: string
  nonce: string
  timestamp: string
  address: string
}

export type AuthVerifyPayload = {
  address: string
  domain: string
  nonce: string
  timestamp: string
  signature: string
}

export type AuthVerifyResponse = {
  token: string
  address: string
  roles: string[]
  expires_at: string
}

export type AuthSession = {
  token: string
  address: string
  roles: string[]
  expires_at: string
}
