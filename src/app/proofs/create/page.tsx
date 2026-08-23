"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Heading, Input, StatusPill, Text } from "@/components/ui"
import { createProof } from "@/lib/api/proofs"
import type { ProofSubjectType } from "@/lib/api/types"
import shared from "@/components/core/shared.module.css"

export default function CreateProofPage() {
  const router = useRouter()
  const [subjectType, setSubjectType] = useState<ProofSubjectType>("batch")
  const [subjectId, setSubjectId] = useState("")
  const [claim, setClaim] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!subjectId.trim() || !claim.trim()) {
      setError("Subject ID and claim are required")
      return
    }
    setBusy(true)
    try {
      const proof = await createProof({
        subjectType,
        subjectId: subjectId.trim(),
        claim: claim.trim(),
      })
      router.push(`/proofs/${encodeURIComponent(proof.id)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the proof")
      setBusy(false)
    }
  }

  return (
    <div className={shared.page} style={{ maxWidth: "44rem" }}>
      <header className={shared.header}>
        <StatusPill tone="info" label="AgroProof" />
        <Heading as="h1">Create a proof</Heading>
        <Text as="p" className={shared.lede}>
          State a claim about a subject, attach evidence, then submit it for verification.
        </Text>
      </header>

      <Card elevation={1} container className={shared.detailCard}>
        <form onSubmit={submit} className={shared.formGrid}>
          <div>
            <Text
              size="body-sm"
              tone="muted"
              as="label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Subject type
            </Text>
            <select
              value={subjectType}
              onChange={(e) => setSubjectType(e.target.value as ProofSubjectType)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--va-shape-sm)",
                border: "1px solid var(--va-outline-variant)",
                background: "var(--va-surface)",
                color: "var(--va-on-surface)",
                fontFamily: "inherit",
              }}
              aria-label="Subject type"
            >
              <option value="farmer">Farmer</option>
              <option value="batch">Batch</option>
              <option value="equipment">Equipment</option>
              <option value="animal">Animal</option>
              <option value="project">Project</option>
            </select>
          </div>

          <Input
            label="Subject ID *"
            placeholder="va:farmer:G… or va:batch:<uuid>"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          />

          <div>
            <Text
              size="body-sm"
              tone="muted"
              as="label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Claim *
            </Text>
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              rows={4}
              placeholder="e.g. Organic certification for harvest batch B-1041"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--va-shape-sm)",
                border: "1px solid var(--va-outline-variant)",
                background: "var(--va-surface)",
                color: "var(--va-on-surface)",
                fontFamily: "inherit",
                fontSize: "0.9375rem",
              }}
            />
          </div>

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
              Create draft
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
