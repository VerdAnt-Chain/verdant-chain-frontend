import { FeatureLanding } from "@/components/feature-landing/feature-landing"

export default function EquipmentPage() {
  return (
    <FeatureLanding
      title="Equipment"
      description="Discover and book tractors, harvesters, and irrigation systems — availability tracked on-chain with escrowed bookings."
      headerTone="info"
      headerLabel="AgriLease"
      items={[
        {
          name: "John Deere 6R Tractor",
          meta: "Available for booking in the Northern region.",
          tone: "success",
          label: "Available",
        },
        {
          name: "Claas Harvester",
          meta: "Reserved with an escrowed booking deposit.",
          tone: "pending",
          label: "Booked",
        },
        {
          name: "Irrigation pivot",
          meta: "In service; utilization reported per season.",
          tone: "info",
          label: "In service",
        },
        {
          name: "Kubota excavator",
          meta: "Undergoing maintenance before re-listing.",
          tone: "neutral",
          label: "Maintenance",
        },
      ]}
      note="The equipment booking flow lands after the AgriLease escrow contract is designed and accepted."
    />
  )
}
