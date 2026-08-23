import { FeatureLanding } from "@/components/feature-landing/feature-landing"

export default function VerifyPage() {
  return (
    <FeatureLanding
      title="AgroProof — Verification"
      description="Supply-chain verification from farmer to buyer — farmer → harvest → processor → distributor → buyer. On-chain verification state with proof hashes (sha256, AD-004) and counter-issued IDs (va:verification:<12-digit>, va:batch:<uuidv7>, AD-009). Contract of record docs/contracts/verification.md v1.0 — 14 unit tests, 5 entrypoints."
      headerTone="info"
      headerLabel="AgroProof · docs/contracts/verification.md"
      items={[
        {
          name: "Batch B-1041 · Harvest verified",
          meta: "batch va:batch:<uuidv7> → VerificationCreated(000000000001) — subject G…Cocoa, proof_hash sha256(field-report.pdf), issuer verification_authority, issued_ledger 124000. Leaf shape — organic batch.",
          tone: "success",
          label: "va:verification:000000000001",
        },
        {
          name: "Soil lab · Pending authority signature",
          meta: "create_verification(batch, subject, proof_hash, issuer) — requires verification_authority.require_auth(). Awaiting lab proof_hash before counter increments. Squircle — friendly check.",
          tone: "pending",
          label: "proof_hash: sha256 pending",
        },
        {
          name: "Invoice INV-23 · Hash anchored at transfer",
          meta: "get_batch_verifications(batch) → Vec<u64> — all verifications for batch retrieved read-only. Invoice proof_hash anchored; Invoice transfer triggers new verification per stage. Field shape — wide terrace.",
          tone: "success",
          label: "BatchVerifications(Bytes)",
        },
        {
          name: "Organic cert · Revocable, not deletable",
          meta: "revoke_verification(000000000004, reason_hash) — verification_authority marks revoked=true, emits VerificationRevoked. 4 errors: NotInitialized, Unauthorized, VerificationNotFound, InvalidInput. Arch shape — shelter.",
          tone: "purple",
          label: "revoked: false → true",
        },
      ]}
      note="On-chain: Admin, VerificationAuthority, NextVerificationId(u64), Verification(u64), BatchVerifications(Bytes). Off-chain: backend indexer ingests VerificationCreated/Revoked for AgroProof projection and AgriScout verified-history. Events mirror state; reads require no auth."
    />
  )
}
