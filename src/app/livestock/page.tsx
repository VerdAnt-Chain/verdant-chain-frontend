import { FeatureLanding } from "@/components/feature-landing/feature-landing"

export default function LivestockPage() {
  return (
    <FeatureLanding
      title="Livestock"
      description="Identity and history for livestock — ownership, breed, vaccinations, and transfers anchored on-chain."
      headerTone="info"
      headerLabel="LivestockPass"
      items={[
        {
          name: "Cow #LV-001",
          meta: "Registered with breed and vaccination records.",
          tone: "success",
          label: "Registered",
        },
        {
          name: "Cow #LV-002",
          meta: "Ownership transfer pending signature.",
          tone: "pending",
          label: "Transfer pending",
        },
        {
          name: "Goat #GV-003",
          meta: "Vaccination record verified by the clinic.",
          tone: "info",
          label: "Vaccinated",
        },
        {
          name: "Bull #LV-004",
          meta: "Ownership dispute under review by registry.",
          tone: "error",
          label: "Disputed",
        },
      ]}
      note="The livestock identity surface lands in a later phase once the livestock contract and event indexing are in place."
    />
  )
}
