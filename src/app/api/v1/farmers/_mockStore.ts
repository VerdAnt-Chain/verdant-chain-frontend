import type { FarmerRecord } from "@/lib/api/types"

// Dev-only in-memory mock store. Uses globalThis so it persists across
// route handler reloads in dev (HMR). Not used when VERDANT_BACKEND_URL is set.

type GlobalWithStore = typeof globalThis & {
  __verdantMockFarmers?: Map<string, FarmerRecord>
}

function getMap(): Map<string, FarmerRecord> {
  const g = globalThis as GlobalWithStore
  if (!g.__verdantMockFarmers) {
    g.__verdantMockFarmers = new Map<string, FarmerRecord>()
    // Seed with the two demo farmers so search/discover has data
    const kofi: FarmerRecord = {
      address: "GCWXIWY5VLB5K5UZD5KS2M3SKG7H3RCVQ7YHBO32N44VD5XUU6HBVSXJ",
      id: "va:farmer:GCWXIWY5VLB5K5UZD5KS2M3SKG7H3RCVQ7YHBO32N44VD5XUU6HBVSXJ",
      registered: true,
      createdLedger: 1234567,
      updatedLedger: 1234590,
      metadata: {
        hash: "abc123",
        profile: {
          name: "Kofi Mensah",
          region: "Ashanti",
          district: "Ejisu",
          bio: "Organic cocoa and maize farmer.",
        },
      },
      verificationMarkers: [
        {
          kind: "kyc",
          issuer: "va:farmer:GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          issuedLedger: 1234568,
        },
        {
          kind: "organic_certified",
          issuer: "va:farmer:GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
          issuedLedger: 1234570,
        },
      ],
    }
    const amara: FarmerRecord = {
      address: "GBQWWK3DJ7DZQQ5EV3KY3G2CWNBZ2X6Q7YHBO32N44VD5XUU6HBVSXJ",
      id: "va:farmer:GBQWWK3DJ7DZQQ5EV3KY3G2CWNBZ2X6Q7YHBO32N44VD5XUU6HBVSXJ",
      registered: true,
      createdLedger: 1234601,
      updatedLedger: 1234601,
      metadata: {
        hash: "mockhash-amara",
        profile: {
          name: "Amara Okafor",
          region: "Central",
          district: "Cape Coast",
          bio: "Maize and cassava farmer, cooperative member.",
        },
      },
      verificationMarkers: [],
    }
    g.__verdantMockFarmers.set(kofi.address, kofi)
    g.__verdantMockFarmers.set(amara.address, amara)
  }
  return g.__verdantMockFarmers
}

export function getMockStore() {
  return getMap()
}

export function mockRecordToSearchItem(rec: FarmerRecord) {
  const profile =
    rec.metadata && "profile" in rec.metadata
      ? rec.metadata.profile
      : (rec.metadata as import("@/lib/api/types").FarmerProfileMetadata | undefined)
  return {
    address: rec.address,
    id: rec.id,
    name: profile?.name ?? rec.address.slice(0, 8),
    region: profile?.region,
    district: profile?.district,
    verificationCount: rec.verificationMarkers?.length ?? 0,
  }
}
