import { FeatureLanding } from "@/components/feature-landing/feature-landing"

export default function FinancingPage() {
  return (
    <FeatureLanding
      title="FarmFund — Financing"
      description="Milestone-based agricultural financing — funder ↔ farmer, drawdowns against proofs, repayments, refunds. Contract of record docs/contracts/financing.md v1.0 — financing_authority-gated, u64 counters (va:financing:<12-digit>), Milestone proof_amount i128, deadline enforcement."
      headerTone="info"
      headerLabel="FarmFund · docs/contracts/financing.md"
      items={[
        {
          name: "Financing 000000000003 · Land prep Milestone 1",
          meta: "create_financing(funder, beneficiary, total 50_000_000, 3 milestones) + deposit(financing_id, from, amount) — financing_authority.require_auth(), drawn_amount + amount ≤ total. Leaf — seed capital.",
          tone: "success",
          label: "FinancingCreated + Deposited",
        },
        {
          name: "Milestone 1 · Deadline ledger 1_240_000",
          meta: "Milestone{index:1, deadline_ledger, proof_hash sha256(deliverable), proof_amount 15_000_000} — release_on_milestone(financing_id, proof, index) checks deadline ≤ env.ledger.sequence(), proof non-empty. Squircle — gentle settle.",
          tone: "pending",
          label: "deadline not exceeded",
        },
        {
          name: "Harvest Milestone 2 · Release 15_000_000",
          meta: "release_on_milestone emits FinancingReleased(released_amount) — drawn_amount, drawn_ledger updated. Refund path: refund(financing_id, refundee) returns undrawn, may set defaulted. Field — wide drawdown.",
          tone: "info",
          label: "drawn_amount 15M → 30M",
        },
        {
          name: "Repayment & default tracking",
          meta: "Financing {id, funder, beneficiary, total, drawn, milestones, repaid, defaulted}. Errors: MilestoneDeadlineExceeded, InvalidInput, FinancingNotFound. Expressive — hero financing.",
          tone: "neutral",
          label: "repaid/defaulted",
        },
      ]}
      note="On-chain: Admin, FinancingAuthority, NextFinancingId, Financing(u64), FunderFinancings(Address). Off-chain: indexer builds outstanding balance & milestone status from FinancingCreated/Deposited/Released/Refunded. Reads no auth; writes require financing_authority."
    />
  )
}
