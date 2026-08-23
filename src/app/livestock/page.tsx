"use client"

/* eslint-disable react-hooks/set-state-in-effect -- load on mount/filter change */
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button, Card, Heading, StatusPill, Text } from "@/components/ui"
import { EmptyState, FilterBar, SkeletonCards } from "@/components/core/primitives"
import { listAnimals } from "@/lib/api/livestock"
import type { Animal, AnimalStatus } from "@/lib/api/types"
import { shortAddress } from "@/lib/api/address"
import shared from "@/components/core/shared.module.css"

const SPECIES_OPTIONS = [
  { value: "", label: "All species" },
  { value: "cattle", label: "🐄 Cattle" },
  { value: "goat", label: "🐐 Goats" },
  { value: "sheep", label: "🐑 Sheep" },
  { value: "pig", label: "🐖 Pigs" },
  { value: "poultry", label: "🐔 Poultry" },
] satisfies { value: string; label: string }[]

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "transferred", label: "Transferred" },
] satisfies { value: AnimalStatus | ""; label: string }[]

export default function LivestockPage() {
  const [species, setSpecies] = useState("")
  const [status, setStatus] = useState<AnimalStatus | "">("")
  const [items, setItems] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listAnimals({ species: species || undefined, status: status || undefined })
      setItems(res.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the VerdAnt API")
    } finally {
      setLoading(false)
    }
  }, [species, status])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className={shared.page}>
      <header className={shared.header}>
        <div className={shared.titleRow}>
          <StatusPill tone="info" label="LivestockPass" />
          <Heading as="h1">Livestock</Heading>
        </div>
        <Text as="p" size="body-lg" className={shared.lede}>
          Identity and provenance for animals — breed, health records, ownership history.
        </Text>
        <div className={shared.actions}>
          <Button as="a" href="/livestock/register">
            Register an animal
          </Button>
        </div>
      </header>

      <div className={shared.toolbar}>
        <FilterBar
          label="Filter by species"
          options={SPECIES_OPTIONS}
          value={species}
          onChange={setSpecies}
        />
        <FilterBar
          label="Filter by status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
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
          message="No animals registered yet. Give your first animal a verifiable identity."
          actionLabel="Register an animal"
          actionHref="/livestock/register"
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className={shared.grid}>
          {items.map((a) => (
            <Link
              key={a.id}
              href={`/livestock/${encodeURIComponent(a.id)}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card interactive elevation={1} container className={shared.card}>
                <div className={shared.row} style={{ justifyContent: "space-between" }}>
                  <StatusPill
                    tone={
                      a.status === "active"
                        ? "success"
                        : a.status === "deceased"
                          ? "error"
                          : "pending"
                    }
                    label={a.status}
                  />
                  <span className={shared.mono}>
                    {String((a.identification as { tag?: string }).tag ?? "")}
                  </span>
                </div>
                <Heading as="h3" style={{ marginTop: 10 }}>
                  {a.name ?? `${a.species} #${shortAddress(a.id)}`}
                </Heading>
                <Text tone="muted" as="p">
                  {a.breed ?? a.species}
                  {a.farm ? ` · ${a.farm}` : ""}
                </Text>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
