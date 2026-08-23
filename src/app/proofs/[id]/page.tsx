"use client"

/* eslint-disable react-hooks/set-state-in-effect -- load on mount */
import { useCallback, useEffect, useState } from "react"
import { Button, Card, Heading, Input, Spinner, StatusPill, Text } from "@/components/ui"
import { EvidenceCard } from "@/components/core/workflow"
import { Timeline } from "@/components/core/workflow"
import shared from "@/components/core/shared.module.css"
import { addEvidence, getProof, submitProof, verifyProof } from "@/lib/api/proofs"
import { isNotFound } from "@/lib/api/client"
import type { ProofDetail } from "@/lib/api/types"
import { getAuthSnapshot } from "@/lib/wallet/auth"

function statusTone(status: string) {
  if (status === "verified") return "success" as const
  if (status === "rejected" || status === "revoked") return "error" as const
  if (status === "draft") return "neutral" as const
  return "pending" as const
}

export default function ProofDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [proof, setProof] = useState<ProofDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [busy, setBusy] = useState(false)

  const [evType, setEvType] = useState("document")
  const [evHash, setEvHash] = useState("")
  const [evUri, setEvUri] = useState("")
  const [decision, setDecision] = useState("")

  useEffect(() => {
    void params.then((p) => setId(decodeURIComponent(p.id)))
  }, [params])

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      setProof(await getProof(id))
    } catch (e) {
      if (isNotFound(e)) setNotFound(true)
      else setError(e instanceof Error ? e.message : "Could not load proof")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const run = async (fn: () => Promise<unknown>) => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await fn()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed")
    } finally {
      setBusy(false)
    }
  }

  if (loading)
    return (
      <div
        className={shared.page}
        style={{ display: "flex", justifyContent: "center", padding: 48 }}
      >
        <Spinner size="md" label="Loading proof…" />
      </div>
    )

  if (notFound)
    return (
      <div className={shared.page}>
        <Card elevation={1} className={shared.detailCard}>
          <StatusPill tone="error" label="Not found" />
          <Heading as="h2" style={{ marginTop: 8 }}>
            Proof not found
          </Heading>
          <Button as="a" href="/proofs" variant="outlined" style={{ marginTop: 12 }}>
            Back to proofs
          </Button>
        </Card>
      </div>
    )

  if (!proof) return null

  const evidence = Array.isArray(proof.evidence) ? proof.evidence : []
  const snap = getAuthSnapshot()
  const authed = snap.state === "signed_in"
  const isVerifier = authed && snap.roles.includes("verifier")

  return (
    <div className={shared.page}>
      <Card elevation={1} container className={shared.detailCard}>
        <div className={shared.row} style={{ justifyContent: "space-between" }}>
          <div className={shared.titleRow}>
            <StatusPill tone={statusTone(proof.status)} label={proof.status.replace("_", " ")} />
            <Text size="label-sm" tone="muted" className={shared.mono}>
              {proof.id}
            </Text>
          </div>
          <Text size="label-sm" tone="muted">
            updated {new Date(proof.updatedAt).toLocaleDateString()}
          </Text>
        </div>

        <Heading as="h1" style={{ marginTop: 12 }}>
          {proof.claim}
        </Heading>

        <div className={shared.metaGrid}>
          <div className={shared.metaItem}>
            <span>Subject</span>
            <Text as="p">
              {proof.subjectType} — <span className={shared.mono}>{proof.subjectId}</span>
            </Text>
          </div>
          <div className={shared.metaItem}>
            <span>Creator</span>
            <Text as="p" className={shared.mono}>
              {proof.creator}
            </Text>
          </div>
          {proof.verificationId && (
            <div className={shared.metaItem}>
              <span>On-chain record</span>
              <Text as="p" className={shared.mono}>
                {proof.verificationId}
              </Text>
            </div>
          )}
        </div>

        {error && (
          <Card
            elevation={0}
            className={`${shared.detailCard} ${shared.alertError}`}
            style={{ padding: 12, marginTop: 12 }}
          >
            <Text tone="error" size="body-sm" as="p">
              {error}
            </Text>
          </Card>
        )}

        <div className={shared.actions}>
          {authed && proof.status === "draft" && (
            <Button
              onClick={() => void run(async () => void (await submitProof(proof.id)))}
              loading={busy}
            >
              Submit for verification
            </Button>
          )}
          {!authed && proof.status === "draft" && (
            <Text size="body-sm" tone="muted">
              Sign in with Freighter to submit this proof.
            </Text>
          )}
        </div>
      </Card>

      <Card elevation={1} container className={shared.detailCard}>
        <div className={shared.sectionTitle}>
          <Heading as="h3">Evidence ({evidence.length})</Heading>
        </div>

        {evidence.length === 0 ? (
          <Text tone="muted">No evidence attached yet.</Text>
        ) : (
          evidence.map((ev) => (
            <EvidenceCard
              key={ev.id}
              filename={(ev.metadata as { filename?: string } | null)?.filename}
              type={ev.type}
              contentHash={ev.contentHash}
              uri={ev.uri}
              submittedBy={ev.submittedBy}
              createdAt={ev.createdAt}
            />
          ))
        )}

        {proof.status === "draft" && (
          <form
            className={shared.formGrid}
            onSubmit={(e) => {
              e.preventDefault()
              if (!evHash.trim()) return
              void run(async () => {
                await addEvidence(proof.id, {
                  type: evType as "document",
                  contentHash: evHash.trim(),
                  uri: evUri.trim() || null,
                })
                setEvHash("")
                setEvUri("")
              })
            }}
          >
            <Heading as="h4">Attach evidence</Heading>
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
                  value={evType}
                  onChange={(e) => setEvType(e.target.value)}
                  aria-label="Evidence type"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--va-shape-sm)",
                    border: "1px solid var(--va-outline-variant)",
                    background: "var(--va-surface)",
                    color: "var(--va-on-surface)",
                  }}
                >
                  <option value="document">Document</option>
                  <option value="image">Image</option>
                  <option value="hash">Hash</option>
                  <option value="link">Link</option>
                </select>
              </div>
              <Input
                label="URI (optional)"
                value={evUri}
                onChange={(e) => setEvUri(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <Input
              label="Content hash (sha256) *"
              value={evHash}
              onChange={(e) => setEvHash(e.target.value)}
              placeholder="a3f9c1b2…"
            />
            <div className={shared.actions}>
              <Button type="submit" variant="outlined" loading={busy}>
                Attach evidence
              </Button>
            </div>
          </form>
        )}
      </Card>

      {(proof.status === "submitted" || proof.status === "under_review") && isVerifier && (
        <Card elevation={1} container className={shared.detailCard}>
          <Heading as="h3">Verification decision</Heading>
          <Text tone="muted" size="body-sm" as="p" style={{ marginTop: 4 }}>
            You hold the verifier role. Approve anchors an on-chain verification record; reject
            closes the proof.
          </Text>
          <Input
            label="Decision notes (optional)"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            style={{ marginTop: 8 }}
          />
          <div className={shared.actions}>
            <Button
              onClick={() =>
                void run(async () => {
                  await verifyProof(proof.id, { status: "approved", decision })
                })
              }
              loading={busy}
            >
              Approve & anchor
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                void run(async () => {
                  await verifyProof(proof.id, { status: "rejected", decision })
                })
              }
              disabled={busy}
            >
              Reject
            </Button>
          </div>
        </Card>
      )}
      {(proof.status === "submitted" || proof.status === "under_review") && !isVerifier && (
        <Card elevation={1} container className={shared.detailCard}>
          <Heading as="h3">Under review</Heading>
          <Text tone="muted" as="p" style={{ marginTop: 4 }}>
            A verifier is reviewing this proof. The decision will appear here.
          </Text>
        </Card>
      )}

      <Card elevation={1} container className={shared.detailCard}>
        <Heading as="h3">Lifecycle</Heading>
        <div style={{ marginTop: 10 }}>
          <Timeline
            label="Proof lifecycle"
            entries={[
              ...evidence.map((ev, i) => ({
                key: ev.id,
                title: `Evidence ${i + 1} attached (${ev.type})`,
                meta: new Date(ev.createdAt).toLocaleString(),
                muted: true,
              })),
              ...(proof.status !== "draft"
                ? [{ key: "submitted", title: "Submitted for verification" }]
                : []),
              ...(proof.status === "verified" || proof.status === "rejected"
                ? [
                    {
                      key: "decided",
                      title:
                        proof.status === "verified" ? "Verified — anchored on-chain" : "Rejected",
                      meta: proof.verificationId ?? undefined,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </Card>
    </div>
  )
}
