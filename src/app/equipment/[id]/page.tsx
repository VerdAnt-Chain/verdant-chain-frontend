"use client"

/* eslint-disable react-hooks/set-state-in-effect -- load on mount */
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button, Card, Heading, Input, Spinner, StatusPill, Text } from "@/components/ui"
import { Timeline } from "@/components/core/workflow"
import shared from "@/components/core/shared.module.css"
import {
  approveLease,
  cancelLease,
  completeLease,
  createLease,
  getEquipment,
  listLeases,
} from "@/lib/api/equipment"
import { isNotFound } from "@/lib/api/client"
import { formatStroops } from "@/lib/api/format"
import type { Equipment, Lease } from "@/lib/api/types"
import { getAuthSnapshot } from "@/lib/wallet/auth"

function leaseTone(status: string) {
  if (status === "active") return "success" as const
  if (status === "completed") return "info" as const
  if (status === "rejected" || status === "cancelled") return "error" as const
  return "pending" as const
}

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [eq, setEq] = useState<Equipment | null>(null)
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [busy, setBusy] = useState(false)

  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    void params.then((p) => setId(decodeURIComponent(p.id)))
  }, [params])

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const equipment = await getEquipment(id)
      setEq(equipment)
      const res = await listLeases({ equipmentId: id })
      setLeases(res.items)
    } catch (e) {
      if (isNotFound(e)) setNotFound(true)
      else setError(e instanceof Error ? e.message : "Could not load equipment")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const days = useMemo(() => {
    if (!start || !end) return 0
    return Math.max(0, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
  }, [start, end])

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

  const requestLease = () => {
    if (!eq) return
    void run(async () => {
      await createLease({ equipmentId: eq.id, startDate: start, endDate: end })
    }, "Lease requested — the owner has been notified.")
  }

  const authed = getAuthSnapshot().state === "signed_in"

  if (loading)
    return (
      <div
        className={shared.page}
        style={{ display: "flex", justifyContent: "center", padding: 48 }}
      >
        <Spinner size="md" label="Loading equipment…" />
      </div>
    )

  if (notFound)
    return (
      <div className={shared.page}>
        <Card elevation={1} className={shared.detailCard}>
          <StatusPill tone="error" label="Not found" />
          <Heading as="h2" style={{ marginTop: 8 }}>
            Equipment not found
          </Heading>
          <Button as="a" href="/equipment" variant="outlined" style={{ marginTop: 12 }}>
            Back to marketplace
          </Button>
        </Card>
      </div>
    )

  if (!eq) return null

  return (
    <div className={shared.page}>
      <Card elevation={1} container className={shared.detailCard}>
        <div className={shared.row} style={{ justifyContent: "space-between" }}>
          <StatusPill
            tone={eq.available ? "success" : "pending"}
            label={eq.available ? "Available" : "Booked"}
          />
          <Text size="label-sm" tone="muted" className={shared.mono}>
            {eq.id}
          </Text>
        </div>
        <Heading as="h1" style={{ marginTop: 12 }}>
          {eq.name}
        </Heading>
        <div className={shared.metaGrid}>
          <div className={shared.metaItem}>
            <span>Type</span>
            <Text as="p">{eq.type}</Text>
          </div>
          <div className={shared.metaItem}>
            <span>Condition</span>
            <Text as="p">{eq.condition}</Text>
          </div>
          <div className={shared.metaItem}>
            <span>Location</span>
            <Text as="p">{eq.location}</Text>
          </div>
          <div className={shared.metaItem}>
            <span>Daily rate</span>
            <Text as="p" style={{ fontWeight: 600 }}>
              {formatStroops(eq.dailyRate)}
            </Text>
          </div>
          {eq.verificationId && (
            <div className={shared.metaItem}>
              <span>Verification</span>
              <Text as="p" className={shared.mono}>
                {eq.verificationId}
              </Text>
            </div>
          )}
        </div>
        {eq.description && (
          <Text as="p" style={{ marginTop: 10 }}>
            {eq.description}
          </Text>
        )}
      </Card>

      {successMsg && (
        <Card elevation={1} className={`${shared.detailCard} ${shared.alertSuccess}`}>
          <StatusPill tone="success" label="Done" />
          <Text as="p" style={{ marginTop: 6 }}>
            {successMsg}
          </Text>
        </Card>
      )}
      {actionError && (
        <Card elevation={1} className={`${shared.detailCard} ${shared.alertError}`}>
          <StatusPill tone="error" label="Failed" />
          <Text tone="error" as="p" style={{ marginTop: 6 }}>
            {actionError}
          </Text>
        </Card>
      )}

      {eq.available && (
        <Card elevation={1} container className={shared.detailCard}>
          <Heading as="h3">Request a lease</Heading>
          {!authed && (
            <Text tone="muted" size="body-sm" as="p" style={{ marginTop: 4 }}>
              Sign in with Freighter to request this equipment.
            </Text>
          )}
          {authed && (
            <>
              <div className={shared.formRow2} style={{ marginTop: 10 }}>
                <Input
                  label="Start date *"
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
                <Input
                  label="End date *"
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
              {days > 0 && eq && (
                <Text size="body-sm" tone="muted">
                  {days} day{days === 1 ? "" : "s"} ≈{" "}
                  <strong>{formatStroops(BigInt(days) * BigInt(eq.dailyRate))}</strong> total
                  (escrowed on approval)
                </Text>
              )}
              <div className={shared.actions}>
                <Button
                  onClick={requestLease}
                  loading={busy}
                  disabled={!start || !end || days <= 0}
                >
                  Request lease
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      <Card elevation={1} container className={shared.detailCard}>
        <div className={shared.sectionTitle}>
          <Heading as="h3">Lease history</Heading>
          <Text size="body-sm" tone="muted">
            {leases.length} lease{leases.length === 1 ? "" : "s"}
          </Text>
        </div>

        {leases.length === 0 ? (
          <Text tone="muted">No leases yet.</Text>
        ) : (
          <Timeline
            label="Lease history"
            entries={leases.map((l) => ({
              key: l.id,
              title: `${l.status.replace("_", " ")} — ${formatStroops(l.totalAmount)}`,
              meta: `${l.startDate} → ${l.endDate}`,
              body: (
                <div className={shared.actions}>
                  {l.status === "requested" && (
                    <>
                      <Button
                        size="sm"
                        variant="outlined"
                        disabled={busy}
                        onClick={() =>
                          void run(
                            () => approveLease(l.id),
                            `Lease approved — escrow ${l.escrowId} released on completion.`
                          )
                        }
                      >
                        Approve (owner)
                      </Button>
                      <Button
                        size="sm"
                        variant="text"
                        disabled={busy}
                        onClick={() => void run(() => cancelLease(l.id))}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {l.status === "active" && (
                    <>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void run(() => completeLease(l.id), "Lease completed — payment settled.")
                        }
                      >
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="text"
                        disabled={busy}
                        onClick={() => void run(() => cancelLease(l.id))}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  )
}
