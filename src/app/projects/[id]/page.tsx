"use client"

/* eslint-disable react-hooks/set-state-in-effect -- load on mount */
import { useCallback, useEffect, useState } from "react"
import { Button, Card, Heading, Input, Spinner, StatusPill, Text } from "@/components/ui"
import { ProgressIndicator, Timeline } from "@/components/core/workflow"
import shared from "@/components/core/shared.module.css"
import {
  fundProject,
  getProject,
  publishProject,
  submitMilestone,
  verifyMilestone,
} from "@/lib/api/projects"
import { isNotFound } from "@/lib/api/client"
import { formatStroops } from "@/lib/api/format"
import type { Milestone, Project } from "@/lib/api/types"
import { getAuthSnapshot } from "@/lib/wallet/auth"

function statusTone(s: string) {
  if (s === "completed" || s === "approved" || s === "verified") return "success" as const
  if (s === "cancelled" || s === "rejected") return "error" as const
  if (s === "funding" || s === "active") return "info" as const
  return "pending" as const
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [busy, setBusy] = useState(false)

  const [fundXlm, setFundXlm] = useState("")
  const [proofHash, setProofHash] = useState("")
  const [decision, setDecision] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    void params.then((p) => setId(decodeURIComponent(p.id)))
  }, [params])

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      setProject(await getProject(id))
    } catch (e) {
      if (isNotFound(e)) setNotFound(true)
      else setError(e instanceof Error ? e.message : "Could not load project")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const run = async (fn: () => Promise<unknown>, successMessage?: string) => {
    if (busy) return
    setBusy(true)
    setActionError(null)
    setSuccessMsg(null)
    try {
      await fn()
      await load()
      if (successMessage) setSuccessMsg(successMessage)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed")
    } finally {
      setBusy(false)
    }
  }

  const snap = getAuthSnapshot()
  const authed = snap.state === "signed_in"
  const isVerifier = authed && snap.roles.includes("verifier")

  if (loading)
    return (
      <div
        className={shared.page}
        style={{ display: "flex", justifyContent: "center", padding: 48 }}
      >
        <Spinner size="md" label="Loading project…" />
      </div>
    )

  if (notFound)
    return (
      <div className={shared.page}>
        <Card elevation={1} className={shared.detailCard}>
          <StatusPill tone="error" label="Not found" />
          <Heading as="h2" style={{ marginTop: 8 }}>
            Project not found
          </Heading>
          <Button as="a" href="/projects" variant="outlined" style={{ marginTop: 12 }}>
            Back to projects
          </Button>
        </Card>
      </div>
    )

  if (!project) return null

  const milestones = Array.isArray(project.milestones) ? project.milestones : []
  const remaining = Number(project.fundingTarget) - Number(project.fundedAmount)

  return (
    <div className={shared.page}>
      <Card elevation={1} container className={shared.detailCard}>
        <div className={shared.row} style={{ justifyContent: "space-between" }}>
          <StatusPill tone={statusTone(project.status)} label={project.status} />
          <Text size="label-sm" tone="muted">
            {project.category} · by {project.farmer.slice(0, 8)}…
          </Text>
        </div>
        <Heading as="h1" style={{ marginTop: 12 }}>
          {project.title}
        </Heading>
        <Text as="p" style={{ marginTop: 8 }}>
          {project.description}
        </Text>
        <div style={{ marginTop: 16 }}>
          <ProgressIndicator
            value={Number(project.fundedAmount)}
            max={Number(project.fundingTarget)}
            formatValue={(n) => formatStroops(n, { decimals: 0 })}
            label="Funded"
          />
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
        {successMsg && (
          <Card
            elevation={0}
            className={`${shared.detailCard} ${shared.alertSuccess}`}
            style={{ padding: 12, marginTop: 12 }}
          >
            <StatusPill tone="success" label="Done" />
            <Text size="body-sm" as="p" style={{ marginTop: 6 }}>
              {successMsg}
            </Text>
          </Card>
        )}
        {actionError && (
          <Card
            elevation={0}
            className={`${shared.detailCard} ${shared.alertError}`}
            style={{ padding: 12, marginTop: 12 }}
          >
            <StatusPill tone="error" label="Failed" />
            <Text tone="error" size="body-sm" as="p" style={{ marginTop: 6 }}>
              {actionError}
            </Text>
          </Card>
        )}

        <div className={shared.actions}>
          {!authed &&
            (project.status === "draft" ||
              project.status === "published" ||
              project.status === "funding") && (
              <Text size="body-sm" tone="muted">
                Sign in with Freighter to act on this project.
              </Text>
            )}
          {authed && project.status === "draft" && (
            <Button
              onClick={() =>
                void run(
                  () => publishProject(project.id),
                  "Project published — it is now open for funding."
                )
              }
              loading={busy}
            >
              Publish for funding
            </Button>
          )}
        </div>
      </Card>

      {authed &&
        (project.status === "funding" || project.status === "published") &&
        remaining > 0 && (
          <Card elevation={1} container className={shared.detailCard}>
            <Heading as="h3">Fund this project</Heading>
            <div className={shared.formRow2} style={{ marginTop: 10, alignItems: "end" }}>
              <Input
                label={`Amount (XLM) — ${formatStroops(remaining, { decimals: 0 })} remaining`}
                value={fundXlm}
                onChange={(e) => setFundXlm(e.target.value)}
                inputMode="decimal"
                placeholder="1.00"
              />
              <Button
                onClick={() => {
                  const stroops = Number(BigInt(Math.round(Number(fundXlm) * 100)) * BigInt(100000))
                  void run(
                    () => fundProject(project.id, stroops),
                    "Contribution confirmed — thank you!"
                  )
                }}
                loading={busy}
              >
                Fund
              </Button>
            </div>
          </Card>
        )}

      <Card elevation={1} container className={shared.detailCard}>
        <div className={shared.sectionTitle}>
          <Heading as="h3">Milestones</Heading>
          <Text size="body-sm" tone="muted">
            Funds release as milestones are proven.
          </Text>
        </div>

        {milestones.length === 0 ? (
          <Text tone="muted">No milestones defined yet.</Text>
        ) : (
          <Timeline
            label="Milestone timeline"
            entries={milestones.map((m: Milestone) => ({
              key: String(m.index),
              title: `${m.index}. ${m.title}`,
              meta: `${formatStroops(m.amount)} · deadline ${m.deadline}`,
              body: (
                <div>
                  <StatusPill
                    tone={
                      m.status === "approved"
                        ? "success"
                        : m.status === "verified"
                          ? "info"
                          : m.status === "submitted"
                            ? "pending"
                            : "neutral"
                    }
                    label={m.status}
                  />
                  {m.proofHash && (
                    <Text
                      size="body-sm"
                      tone="muted"
                      className={shared.mono}
                      as="p"
                      style={{ marginTop: 4 }}
                    >
                      proof: {String(m.proofHash).slice(0, 20)}…
                    </Text>
                  )}
                  <div className={shared.actions}>
                    {authed && m.status === "pending" && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          if (!proofHash.trim()) return
                          const hash = proofHash.trim()
                          void run(
                            () => submitMilestone(project.id, m.index, { proofHash: hash }),
                            `Milestone ${m.index} submitted for verification.`
                          )
                          setProofHash("")
                        }}
                      >
                        <Input
                          aria-label={`Proof hash for milestone ${m.index}`}
                          placeholder="proof hash (sha256)"
                          value={proofHash}
                          onChange={(e) => setProofHash(e.target.value)}
                        />
                        <Button
                          size="sm"
                          type="submit"
                          variant="outlined"
                          disabled={busy}
                          style={{ marginLeft: 8 }}
                        >
                          Submit proof
                        </Button>
                      </form>
                    )}
                    {isVerifier && m.status === "submitted" && (
                      <>
                        <Input
                          aria-label={`Verify note for milestone ${m.index}`}
                          placeholder="decision note"
                          value={decision}
                          onChange={(e) => setDecision(e.target.value)}
                        />
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            void run(
                              () =>
                                verifyMilestone(project.id, m.index, {
                                  status: "approved",
                                  decision,
                                }),
                              `Milestone ${m.index} verified.`
                            )
                          }
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="text"
                          disabled={busy}
                          onClick={() =>
                            void run(async () => {
                              await verifyMilestone(project.id, m.index, {
                                status: "rejected",
                                decision,
                              })
                            })
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  )
}
