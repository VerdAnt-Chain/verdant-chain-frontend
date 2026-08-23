import { FeatureLanding } from "@/components/feature-landing/feature-landing"

export default function EquipmentPage() {
  return (
    <FeatureLanding
      title="AgriLease — Equipment"
      description="Equipment marketplace with programmable escrow — farmer books tractor/harvester, funds held on-chain until return, settled via SEP-41 TokenClient (XLM/USDC). Contract of record docs/contracts/escrow.md v1.0 — 14 tests, 7 entrypoints, ReleaseCondition {Manual, Milestone, Timeout}."
      headerTone="info"
      headerLabel="AgriLease · docs/contracts/escrow.md"
      items={[
        {
          name: "6R Tractor · Escrow 000000000007 created",
          meta: "create_escrow(depositor: farmer, beneficiary: owner, amount: 2_500_000 stroops, release_condition: Manual{releaser}, booking_ref: va:booking:<uuidv7>) — depositor.require_auth(), token.transfer_from. Squircle — friendly hold.",
          tone: "success",
          label: "va:escrow:000000000007",
        },
        {
          name: "Harvester · Milestone release pending",
          meta: "ReleaseCondition::Milestone{proof_verifier} — release(escrow_id, releaser, proof_hash) requires releaser.require_auth() + stored releaser match; proof_hash is sha256(delivery-note.pdf) (AD-004). Leaf flip — organic check.",
          tone: "pending",
          label: "release: proof_hash sha256",
        },
        {
          name: "Irrigation pivot · Timeout refund eligible",
          meta: "ReleaseCondition::Timeout{timeout_ledger} + EscrowRefunded — refund(escrow_id, depositor) after ledger, token.transfer back. Field shape — terrace hold.",
          tone: "info",
          label: "TimeoutNotElapsed vs Refunded",
        },
        {
          name: "Excavator · In maintenance — no escrow",
          meta: "Escrow state: Escrow {id, depositor, beneficiary, token, amount, released_amount, booking_ref, condition, ledgers}. Errors: NotInitialized, Unauthorized, EscrowNotFound, InsufficientBalance, ConditionNotMet. Expressive flip — shelter.",
          tone: "neutral",
          label: "Escrow(u64) empty",
        },
      ]}
      note="On-chain: Admin, Token (XLM/USDC), NextEscrowId, Escrow(u64), BookingEscrows(Bytes). Off-chain: indexer builds AgriLease booking state from EscrowCreated/Deposited/Released/Refunded. Reads require no auth; deposits/releases require depositor/releaser auth."
    />
  )
}
