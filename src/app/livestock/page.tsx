import { FeatureLanding } from "@/components/feature-landing/feature-landing"

export default function LivestockPage() {
  return (
    <FeatureLanding
      title="LivestockPass — Livestock identity"
      description="Livestock identity & history — animal → breed → health → vaccination → ownership transfer, anchored on-chain. On-chain: ownership, identity tokens, transfer state (typed Address, AD-009 counters future). Off-chain: veterinary records, inspections, certificates referenced by hash (AD-004). INSTRUCTIONS.md 3.5 + docs/contracts/farmer-identity.md pattern."
      headerTone="info"
      headerLabel="LivestockPass · INSTRUCTIONS.md 3.5"
      items={[
        {
          name: "Cow LV-001 · Breed Holstein registered",
          meta: "Identity token va:livestock:<counter> (future, AD-009) — subject Address, breed, health/inspection refs hash-anchored. Leaf shape — organic identity.",
          tone: "success",
          label: "va:livestock:000000000021",
        },
        {
          name: "Goat GV-003 · Vaccination verified",
          meta: "Vaccination proof_hash sha256(vet-cert.pdf) submitted by clinic issuer, VerificationMarker-like issuer+ledger. Squircle — friendly health.",
          tone: "info",
          label: "Vaccinated @ ledger 1_245_000",
        },
        {
          name: "Cow LV-002 · Transfer pending signature",
          meta: "Transfer state: owner.require_auth() — on-chain transfer, off-chain veterinary record hash update. Field shape — terrace movement.",
          tone: "pending",
          label: "owner.require_auth()",
        },
        {
          name: "Bull LV-004 · Disputed — registry review",
          meta: "Ownership dispute: on-chain state vs off-chain docs. Future entrypoints: register_livestock, transfer, add_health_record, verify. Expressive flip — shelter dispute.",
          tone: "error",
          label: "disputed: not yet resolved",
        },
      ]}
      note="On-chain (planned): livestock ownership, identity tokens, transfer state. Off-chain: vet records, inspections, vaccinations by hash. Follows farmer-identity pattern (admin + self-registration) and verification marker vocabulary. Contract not yet deployed — surface shows expected projection."
    />
  )
}
