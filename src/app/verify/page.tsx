import { FeatureLanding } from "@/components/feature-landing/feature-landing"

export default function VerifyPage() {
  return (
    <FeatureLanding
      title="Verification"
      description="Production and supply-chain verification from farmer to buyer — proofs anchored on-chain, documents referenced by hash."
      headerTone="info"
      headerLabel="AgroProof"
      items={[
        {
          name: "Harvest batch #B-1041",
          meta: "Field reports verified against on-chain records.",
          tone: "success",
          label: "Verified",
        },
        {
          name: "Soil report",
          meta: "Awaiting lab confirmation before proof issuance.",
          tone: "pending",
          label: "Pending",
        },
        {
          name: "Invoice #INV-23",
          meta: "Commercial invoice hash anchored at transfer.",
          tone: "success",
          label: "Verified",
        },
        {
          name: "Organic certificate",
          meta: "Certificate reviewed by the issuing authority.",
          tone: "purple",
          label: "In review",
        },
      ]}
      note="The AgroProof verification history surface lands in a later phase once the verification contract is implemented and indexed."
    />
  )
}
