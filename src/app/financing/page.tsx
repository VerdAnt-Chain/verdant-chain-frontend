import { FeatureLanding } from "@/components/feature-landing/feature-landing"

export default function FinancingPage() {
  return (
    <FeatureLanding
      title="Financing"
      description="Milestone-based agricultural financing with programmable escrow — funds released as proofs complete."
      headerTone="info"
      headerLabel="FarmFund"
      items={[
        {
          name: "Milestone 1 · Land prep",
          meta: "Escrow released after completion proof verified.",
          tone: "success",
          label: "Disbursed",
        },
        {
          name: "Milestone 2 · Planting",
          meta: "Awaiting completion proof from the field.",
          tone: "pending",
          label: "Pending",
        },
        {
          name: "Milestone 3 · Harvest",
          meta: "Not yet started; scheduled for the season.",
          tone: "neutral",
          label: "Not started",
        },
        {
          name: "Repayment schedule",
          meta: "Principal and interest tracked on-chain.",
          tone: "info",
          label: "Scheduled",
        },
      ]}
      note="The milestone and escrow workflows land after Agent #2's financing contract design is accepted."
    />
  )
}
