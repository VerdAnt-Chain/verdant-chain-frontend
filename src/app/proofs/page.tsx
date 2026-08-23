"use client"

/* eslint-disable react-hooks/set-state-in-effect -- load on mount/filter change */
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button, Card, Heading, StatusPill, Text } from "@/components/ui"
import { EmptyState, FilterBar, SkeletonCards } from "@/components/core/primitives"
import { listProofs } from "@/lib/api/proofs"
import type { ProofListItem, ProofStatus } from "@/lib/api/types"
import { shortAddress } from "@/lib/api/address"
import shared from "@/components/core/shared.module.css"

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "revoked", label: "Revoked" },
] satisfies { value: ProofStatus | ""; label: string }[]

function statusTone(status: string) {
  if (status === "verified") return "success"
  if (status === "rejected" || status === "revoked") return "error"
  if (status === "draft") return "neutral"
  return "pending"
}

export default function ProofsPage() {
  const [status, setStatus] = useState<ProofStatus | "">("")
  const [items, setItems] = useState<ProofListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listProofs({ status: status || undefined })
      setItems(res.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the VerdAnt API")
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className={shared.page}>
      <header className={shared.header}>
        <div className={shared.titleRow}>
          <StatusPill tone="info" label="AgroProof" />
          <Heading as="h1">Proofs</Heading>
        </div>
        <Text as="p" size="body-lg" className={shared.lede}>
          Claim → evidence → verification → on-chain record. Browse what has been proven across the
          ecosystem.
        </Text>
        <div className={shared.actions}>
          <Button as="a" href="/proofs/create">
            New proof
          </Button>
        </div>
      </header>

      <FilterBar
        label="Filter proofs by status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
      />

      <div style={{ height: 16 }} />

      {loading && <SkeletonCards count={3} />}

      {!loading && error && (
        <Card elevation={1} className={`${shared.detailCard} ${shared.alertError}`}>
          <StatusPill tone="error" label="Error" />
          <Text tone="error" as="p" style={{ marginTop: 8 }}>
            {error}
          </Text>
          <div className={shared.actions}>
            <Button variant="outlined" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          message="No proofs match this filter yet. Create a claim, attach evidence, and submit it for verification."
          actionLabel="Create the first proof"
          actionHref="/proofs/create"
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className={shared.grid}>
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/proofs/${encodeURIComponent(p.id)}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card interactive elevation={1} container className={shared.card}>
                <div className={shared.row} style={{ justifyContent: "space-between" }}>
                  <StatusPill tone={statusTone(p.status)} label={p.status.replace("_", " ")} />
                  <span className={shared.mono} title={p.id}>
                    {shortAddress(p.id)}
                  </span>
                </div>
                <Heading as="h3" style={{ marginTop: 10 }}>
                  {p.claim}
                </Heading>
                <Text tone="muted" as="p" style={{ marginTop: 4 }}>
                  {p.subjectType} · {p.evidenceCount} evidence ·{" "}
                  {new Date(p.updatedAt).toLocaleDateString()}
                </Text>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
