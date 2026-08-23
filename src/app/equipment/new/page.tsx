"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Heading, Input, StatusPill, Text } from "@/components/ui"
import { createEquipment } from "@/lib/api/equipment"
import type { EquipmentType } from "@/lib/api/types"
import { formatStroops } from "@/lib/api/format"
import shared from "@/components/core/shared.module.css"

export default function NewEquipmentPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [type, setType] = useState<EquipmentType>("tractor")
  const [condition, setCondition] = useState("good")
  const [location, setLocation] = useState("")
  const [dailyRate, setDailyRate] = useState("")
  const [description, setDescription] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !location.trim()) {
      setError("Name and location are required")
      return
    }
    const rate = Number(dailyRate)
    if (!Number.isFinite(rate) || rate <= 0) {
      setError("Daily rate must be a positive number (XLM)")
      return
    }
    setBusy(true)
    try {
      // UI collects XLM; the API expects stroops.
      const stroops = BigInt(Math.round(rate * 100)) * BigInt(100000)
      const eq = await createEquipment({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        condition: condition as "good",
        location: location.trim(),
        dailyRate: Number(stroops),
        available: true,
      })
      router.push(`/equipment/${encodeURIComponent(eq.id)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not list equipment")
      setBusy(false)
    }
  }

  return (
    <div className={shared.page} style={{ maxWidth: "44rem" }}>
      <header className={shared.header}>
        <StatusPill tone="info" label="AgriLease" />
        <Heading as="h1">List equipment</Heading>
        <Text as="p" className={shared.lede}>
          Put a machine on the marketplace. Bookings are settled through escrowed leases.
        </Text>
      </header>

      <Card elevation={1} container className={shared.detailCard}>
        <form onSubmit={submit} className={shared.formGrid}>
          <Input
            label="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Deere 6R Tractor"
          />
          <div className={shared.formRow2}>
            <div>
              <Text
                size="body-sm"
                tone="muted"
                as="label"
                style={{ display: "block", marginBottom: 6 }}
              >
                Type
              </Text>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EquipmentType)}
                aria-label="Equipment type"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--va-shape-sm)",
                  border: "1px solid var(--va-outline-variant)",
                  background: "var(--va-surface)",
                  color: "var(--va-on-surface)",
                }}
              >
                <option value="tractor">Tractor</option>
                <option value="harvester">Harvester</option>
                <option value="irrigation">Irrigation</option>
                <option value="processing">Processing</option>
                <option value="transport">Transport</option>
                <option value="tools">Tools</option>
              </select>
            </div>
            <div>
              <Text
                size="body-sm"
                tone="muted"
                as="label"
                style={{ display: "block", marginBottom: 6 }}
              >
                Condition
              </Text>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                aria-label="Condition"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--va-shape-sm)",
                  border: "1px solid var(--va-outline-variant)",
                  background: "var(--va-surface)",
                  color: "var(--va-on-surface)",
                }}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <Input
            label="Location *"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Niger, Zinder"
          />
          <Input
            label="Daily rate (XLM) *"
            value={dailyRate}
            onChange={(e) => setDailyRate(e.target.value)}
            inputMode="decimal"
            placeholder="5.00"
          />
          {dailyRate && Number(dailyRate) > 0 && (
            <Text size="body-sm" tone="muted">
              ≈{" "}
              {formatStroops(BigInt(Math.round(Number(dailyRate) * 100)) * BigInt(100000), {
                decimals: 0,
              })}{" "}
              / day in stroops
            </Text>
          )}
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Horsepower, attachments…"
          />

          {error && (
            <Card
              elevation={0}
              className={`${shared.detailCard} ${shared.alertError}`}
              style={{ padding: 12 }}
            >
              <StatusPill tone="error" label="Failed" />
              <Text tone="error" size="body-sm" as="p" style={{ marginTop: 6 }}>
                {error}
              </Text>
            </Card>
          )}

          <div className={shared.actions}>
            <Button type="submit" loading={busy}>
              List equipment
            </Button>
            <Button type="button" variant="text" onClick={() => router.back()} disabled={busy}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
