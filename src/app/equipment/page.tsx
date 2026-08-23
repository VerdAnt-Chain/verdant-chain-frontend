"use client"

/* eslint-disable react-hooks/set-state-in-effect -- load on mount/filter change */
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button, Card, Heading, StatusPill, Text } from "@/components/ui"
import { EmptyState, FilterBar, SkeletonCards } from "@/components/core/primitives"
import { listEquipment } from "@/lib/api/equipment"
import { formatStroops } from "@/lib/api/format"
import type { Equipment, EquipmentType } from "@/lib/api/types"
import shared from "@/components/core/shared.module.css"

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "tractor", label: "🚜 Tractors" },
  { value: "harvester", label: "🌾 Harvesters" },
  { value: "irrigation", label: "💧 Irrigation" },
  { value: "processing", label: "⚙️ Processing" },
  { value: "transport", label: "🚚 Transport" },
  { value: "tools", label: "🔧 Tools" },
] satisfies { value: EquipmentType | ""; label: string }[]

const AVAILABILITY: { value: "" | "true" | "false"; label: string }[] = [
  { value: "", label: "Any" },
  { value: "true", label: "Available" },
  { value: "false", label: "Booked" },
]

export default function EquipmentPage() {
  const [type, setType] = useState<EquipmentType | "">("")
  const [available, setAvailable] = useState<"" | "true" | "false">("")
  const [items, setItems] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listEquipment({
        type: type || undefined,
        available: available === "" ? undefined : available === "true",
      })
      setItems(res.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the VerdAnt API")
    } finally {
      setLoading(false)
    }
  }, [type, available])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className={shared.page}>
      <header className={shared.header}>
        <div className={shared.titleRow}>
          <StatusPill tone="info" label="AgriLease" />
          <Heading as="h1">Equipment</Heading>
        </div>
        <Text as="p" size="body-lg" className={shared.lede}>
          Tractors, harvesters and irrigation — booked with on-chain escrow. Owners list, renters
          lease.
        </Text>
        <div className={shared.actions}>
          <Button as="a" href="/equipment/new">
            List your equipment
          </Button>
        </div>
      </header>

      <div className={shared.toolbar}>
        <FilterBar label="Filter by type" options={TYPE_OPTIONS} value={type} onChange={setType} />
        <FilterBar
          label="Filter availability"
          options={AVAILABILITY}
          value={available}
          onChange={setAvailable}
        />
      </div>

      {loading && <SkeletonCards count={3} />}

      {!loading && error && (
        <Card elevation={1} className={`${shared.detailCard} ${shared.alertError}`}>
          <StatusPill tone="error" label="Error" />
          <Text tone="error" as="p" style={{ marginTop: 8 }}>
            {error}
          </Text>
        </Card>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          message="No equipment matches these filters. List a machine to get it booked with escrowed payments."
          actionLabel="List equipment"
          actionHref="/equipment/new"
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className={shared.grid}>
          {items.map((e) => (
            <Link
              key={e.id}
              href={`/equipment/${encodeURIComponent(e.id)}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card interactive elevation={1} container className={shared.card}>
                <div className={shared.row} style={{ justifyContent: "space-between" }}>
                  <StatusPill
                    tone={e.available ? "success" : "pending"}
                    label={e.available ? "Available" : "Booked"}
                  />
                  <Text size="label-sm" tone="muted" as="span">
                    {e.condition}
                  </Text>
                </div>
                <Heading as="h3" style={{ marginTop: 10 }}>
                  {e.name}
                </Heading>
                <Text tone="muted" as="p">
                  {e.type} · {e.location}
                </Text>
                <Text style={{ marginTop: 6, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {formatStroops(e.dailyRate)} / day
                </Text>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
