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

// ── Shared list pagination ──

export type PaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// ── AgroProof (docs/api/proofs.md v1.0) ──

export type ProofSubjectType = "farmer" | "batch" | "equipment" | "animal" | "project"

export type ProofStatus =
  "draft" | "submitted" | "under_review" | "verified" | "rejected" | "revoked"

export type EvidenceType = "document" | "image" | "hash" | "link"

export type Evidence = {
  id: string
  proofId: string
  type: EvidenceType
  uri: string | null
  contentHash: string
  metadata?: Record<string, unknown> | null
  submittedBy: string
  createdAt: string
}

export type ProofListItem = {
  id: string
  subjectType: ProofSubjectType
  subjectId: string
  claim: string
  status: ProofStatus
  creator: string
  verificationId?: string | null
  evidenceCount: number
  createdAt: string
  updatedAt: string
}

export type ProofDetail = {
  id: string
  subjectType: ProofSubjectType
  subjectId: string
  claim: string
  status: ProofStatus
  creator: string
  verificationId?: string | null
  evidence: Evidence[]
  createdAt: string
  updatedAt: string
}

export type VerificationDecisionStatus = "pending" | "approved" | "rejected" | "request_info"

export type VerificationRecord = {
  proofId: string
  verifier: string
  status: VerificationDecisionStatus
  decision?: string | null
  notes?: string | null
  createdAt: string
}

export type CreateProofInput = {
  subjectType: ProofSubjectType
  subjectId: string
  claim: string
}

export type AddEvidenceInput = {
  type: EvidenceType
  contentHash: string
  uri?: string | null
  metadata?: Record<string, unknown>
}

export type VerifyProofInput = {
  status: Exclude<VerificationDecisionStatus, "pending">
  decision?: string | null
  notes?: string | null
}

/** POST /proofs/:id/verify response shape ("updated proof + verification record"). */
export type VerifyProofResponse = {
  proof: ProofDetail
  verification: VerificationRecord
}

// ── AgriLease (docs/api/equipment.md v1.0) ──

export type EquipmentType =
  "tractor" | "harvester" | "irrigation" | "processing" | "transport" | "tools"

export type EquipmentCondition = "excellent" | "good" | "fair" | "maintenance"

export type Equipment = {
  id: string
  name: string
  type: EquipmentType
  owner: string
  description?: string | null
  condition: EquipmentCondition
  location: string
  /** Daily rental rate in stroops. */
  dailyRate: number
  available: boolean
  verificationId?: string | null
  createdAt: string
  updatedAt: string
}

export type CreateEquipmentInput = {
  name: string
  type: EquipmentType
  description?: string
  condition: EquipmentCondition
  location: string
  dailyRate: number
  available: boolean
}

export type UpdateEquipmentInput = Partial<CreateEquipmentInput>

export type LeaseStatus =
  "requested" | "approved" | "active" | "completed" | "rejected" | "cancelled"

export type Lease = {
  id: string
  equipmentId: string
  renter: string
  startDate: string
  endDate: string
  status: LeaseStatus
  escrowId: string
  /** Total lease amount in stroops. */
  totalAmount: number
  paidAmount: number
  createdAt: string
  updatedAt: string
}

export type CreateLeaseInput = {
  equipmentId: string
  startDate: string
  endDate: string
}

export type ListLeasesParams = {
  renter?: string
  equipmentId?: string
  status?: LeaseStatus
  page?: number
  pageSize?: number
}

// ── FarmFund (docs/api/projects.md v1.0) ──

export type ProjectCategory = "crops" | "livestock" | "infrastructure" | "equipment"

export type ProjectStatus = "draft" | "published" | "funding" | "active" | "completed" | "cancelled"

export type MilestoneStatus = "pending" | "submitted" | "verified" | "approved"

export type Milestone = {
  index: number
  title: string
  description?: string | null
  proofHash?: string | null
  status: MilestoneStatus
  /** Allocated amount in stroops. */
  amount: number
  deadline: string
  createdAt: string
  updatedAt: string
}

export type Project = {
  id: string
  title: string
  description: string
  farmer: string
  category: ProjectCategory
  fundingTarget: number
  fundedAmount: number
  status: ProjectStatus
  milestones: Milestone[]
  createdAt: string
  updatedAt: string
}

/** GET /projects returns summaries; milestones may be absent on list items. */
export type ProjectSummary = Omit<Project, "milestones"> & { milestones?: Milestone[] }

export type FundingReceipt = {
  id: string
  projectId: string
  contributor: string
  amount: number
  status: "pending" | "confirmed" | "refunded"
  createdAt: string
}

export type CreateProjectInput = {
  title: string
  description: string
  category: ProjectCategory
  fundingTarget: number
}

export type UpdateProjectInput = Partial<
  Pick<Project, "title" | "description" | "category" | "fundingTarget">
>

/** POST /projects/:id/fund response ("updated project + funding receipt"). */
export type FundProjectResponse = {
  project: Project
  receipt: FundingReceipt
}

export type SubmitMilestoneInput = {
  proofHash: string
}

export type VerifyMilestoneInput = {
  status: "approved" | "rejected"
  decision?: string
}

/** Milestone submit/verify response ("updated milestone + project"). */
export type MilestoneMutationResponse = {
  milestone: Milestone
  project: Project
}

// ── LivestockPass (docs/api/livestock.md v1.0) ──

export type AnimalStatus = "active" | "transferred" | "deceased"

export type AnimalIdentification = {
  tag?: string
  microchip?: string
  brand?: string
} & Record<string, unknown>

export type Animal = {
  id: string
  species: string
  breed?: string | null
  name?: string | null
  farm?: string | null
  owner: string
  identification: AnimalIdentification
  dateOfBirth?: string | null
  status: AnimalStatus
  verificationId?: string | null
  createdAt: string
  updatedAt: string
}

export type AnimalEventType = "registration" | "health" | "movement" | "transfer" | "ownership"

export type AnimalEvent = {
  id: string
  animalId: string
  type: AnimalEventType
  data: Record<string, unknown>
  recordedBy: string
  proofId?: string | null
  createdAt: string
}

export type TransferStatus = "pending" | "accepted" | "completed" | "rejected"

export type OwnershipTransfer = {
  id: string
  from: string
  to: string
  animalId: string
  status: TransferStatus
  initiatedAt: string
  completedAt?: string | null
}

export type RegisterAnimalInput = {
  species: string
  breed?: string
  name?: string
  farm?: string
  identification: AnimalIdentification
  dateOfBirth?: string
}

export type UpdateAnimalInput = Partial<
  Pick<Animal, "breed" | "name" | "farm" | "identification" | "dateOfBirth" | "status">
>

export type RecordAnimalEventInput = {
  type: AnimalEventType
  data: Record<string, unknown>
}

export type TransferAnimalInput = {
  toOwner: string
  consent: boolean
}

/** PUT /livestock/:id/transfer/complete response ("animal + transfer"). */
export type CompleteTransferResponse = {
  animal: Animal
  transfer: OwnershipTransfer
}
