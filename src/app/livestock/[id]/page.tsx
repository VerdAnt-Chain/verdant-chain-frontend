"use client"

/* eslint-disable react-hooks/set-state-in-effect -- load on mount */
import { useCallback, useEffect, useState } from "react"
import { Button, Card, Heading, Input, Spinner, StatusPill, Text } from "@/components/ui"
import { Timeline } from "@/components/core/workflow"
import shared from "@/components/core/shared.module.css"
import {
  acceptTransfer,
  completeTransfer,
  getAnimal,
  getAnimalHistory,
  initiateTransfer,
  recordAnimalEvent,
} from "@/lib/api/livestock"
import { isNotFound } from "@/lib/api/client"
import type { Animal, AnimalEvent, AnimalEventType, OwnershipTransfer } from "@/lib/api/types"
import { getAuthSnapshot } from "@/lib/wallet/auth"

const EVENT_FIELDS: Record<string, { key: string; label: string }[]> = {
  health: [
    { key: "symptoms", label: "Symptoms" },
    { key: "diagnosis", label: "Diagnosis" },
    { key: "treatment", label: "Treatment" },
    { key: "veterinarian", label: "Veterinarian" },
  ],
  movement: [
    { key: "fromFarm", label: "From farm" },
    { key: "toFarm", label: "To farm" },
    { key: "date", label: "Date" },
  ],
}

export default function AnimalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [history, setHistory] = useState<AnimalEvent[]>([])
  const [transfer, setTransfer] = useState<OwnershipTransfer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [busy, setBusy] = useState(false)

  const [eventType, setEventType] = useState<AnimalEventType>("health")
  const [fields, setFields] = useState<Record<string, string>>({})
  const [toOwner, setToOwner] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    void params.then((p) => setId(decodeURIComponent(p.id)))
  }, [params])

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const a = await getAnimal(id)
      setAnimal(a)
      setHistory(await getAnimalHistory(id))
    } catch (e) {
      if (isNotFound(e)) setNotFound(true)
      else setError(e instanceof Error ? e.message : "Could not load animal")
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
  const myAddress = snap.state === "signed_in" ? snap.address : ""

  if (loading)
    return (
      <div
        className={shared.page}
        style={{ display: "flex", justifyContent: "center", padding: 48 }}
      >
        <Spinner size="md" label="Loading animal…" />
      </div>
    )

  if (notFound)
    return (
      <div className={shared.page}>
        <Card elevation={1} className={shared.detailCard}>
          <StatusPill tone="error" label="Not found" />
          <Heading as="h2" style={{ marginTop: 8 }}>
            Animal not found
          </Heading>
          <Button as="a" href="/livestock" variant="outlined" style={{ marginTop: 12 }}>
            Back to livestock
          </Button>
        </Card>
      </div>
    )

  if (!animal) return null

  const identification = animal.identification as { tag?: string; microchip?: string }

  return (
    <div className={shared.page}>
      <Card elevation={1} container className={shared.detailCard}>
        <div className={shared.row} style={{ justifyContent: "space-between" }}>
          <StatusPill
            tone={
              animal.status === "active"
                ? "success"
                : animal.status === "deceased"
                  ? "error"
                  : "pending"
            }
            label={animal.status}
          />
          <span className={shared.mono}>{identification.tag ?? animal.id}</span>
        </div>
        <Heading as="h1" style={{ marginTop: 12 }}>
          {animal.name ?? `${animal.species}`}
        </Heading>
        <div className={shared.metaGrid}>
          <div className={shared.metaItem}>
            <span>Species / breed</span>
            <Text as="p">
              {animal.species}
              {animal.breed ? ` · ${animal.breed}` : ""}
            </Text>
          </div>
          <div className={shared.metaItem}>
            <span>Farm</span>
            <Text as="p">{animal.farm ?? "—"}</Text>
          </div>
          <div className={shared.metaItem}>
            <span>Owner</span>
            <Text as="p" className={shared.mono}>
              {animal.owner}
              {myAddress && animal.owner === myAddress ? " (you)" : ""}
            </Text>
          </div>
          {animal.dateOfBirth && (
            <div className={shared.metaItem}>
              <span>Born</span>
              <Text as="p">{animal.dateOfBirth}</Text>
            </div>
          )}
        </div>

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
      </Card>

      {/* Pending transfer banner — recipient accepts here */}
      {transfer?.status === "pending" && transfer.to === myAddress && (
        <Card elevation={1} container className={`${shared.detailCard} ${shared.alertSuccess}`}>
          <Heading as="h3">Transfer pending your acceptance</Heading>
          <Text tone="muted" size="body-sm" as="p" style={{ marginTop: 4 }}>
            From {transfer.from.slice(0, 8)}… Accept to take ownership, then the sender completes
            it.
          </Text>
          <div className={shared.actions}>
            <Button
              onClick={() =>
                void run(
                  () => acceptTransfer(animal.id),
                  "Transfer accepted — owner can now complete it."
                )
              }
              loading={busy}
            >
              Accept transfer
            </Button>
          </div>
        </Card>
      )}

      <Card elevation={1} container className={shared.detailCard}>
        <div className={shared.sectionTitle}>
          <Heading as="h3">Provenance history</Heading>
          <Text size="body-sm" tone="muted">
            {history.length} event{history.length === 1 ? "" : "s"} · append-only
          </Text>
        </div>
        {history.length === 0 ? (
          <Text tone="muted">No events recorded yet.</Text>
        ) : (
          <Timeline
            label="Animal provenance"
            entries={[...history].reverse().map((ev) => ({
              key: ev.id,
              title: `${ev.type.charAt(0).toUpperCase()}${ev.type.slice(1)} event`,
              meta: `${new Date(ev.createdAt).toLocaleString()} · by ${ev.recordedBy.slice(0, 8)}…`,
              body:
                ev.data && Object.keys(ev.data).length > 0 ? (
                  <Text size="body-sm" tone="muted" as="p">
                    {Object.entries(ev.data)
                      .map(([k, v]) => `${k}: ${String(v)}`)
                      .join(" · ")}
                  </Text>
                ) : undefined,
            }))}
          />
        )}

        {authed && animal.status === "active" && (
          <form
            className={shared.formGrid}
            onSubmit={(e) => {
              e.preventDefault()
              void run(async () => {
                await recordAnimalEvent(animal.id, { type: eventType, data: fields })
                setFields({})
              }, "Event recorded.")
            }}
          >
            <Heading as="h4">Record an event</Heading>
            <div className={shared.formRow2}>
              <div>
                <Text
                  size="body-sm"
                  tone="muted"
                  as="label"
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Event type
                </Text>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as AnimalEventType)}
                  aria-label="Event type"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--va-shape-sm)",
                    border: "1px solid var(--va-outline-variant)",
                    background: "var(--va-surface)",
                    color: "var(--va-on-surface)",
                  }}
                >
                  <option value="health">Health</option>
                  <option value="movement">Movement</option>
                </select>
              </div>
            </div>
            {(EVENT_FIELDS[eventType] ?? []).map((f) => (
              <Input
                key={f.key}
                label={f.label}
                value={fields[f.key] ?? ""}
                onChange={(e) => setFields((s) => ({ ...s, [f.key]: e.target.value }))}
              />
            ))}
            <div className={shared.actions}>
              <Button type="submit" variant="outlined" loading={busy}>
                Record event
              </Button>
            </div>
          </form>
        )}
      </Card>

      {authed && animal.owner === myAddress && animal.status === "active" && (
        <Card elevation={1} container className={shared.detailCard}>
          <Heading as="h3">Transfer ownership</Heading>
          <Text tone="muted" size="body-sm" as="p" style={{ marginTop: 4 }}>
            Initiate a transfer. The recipient must accept before you complete it.
          </Text>
          <div className={shared.formRow2} style={{ marginTop: 10, alignItems: "end" }}>
            <Input
              label="New owner address *"
              value={toOwner}
              onChange={(e) => setToOwner(e.target.value)}
              placeholder="G…"
            />
            <Button
              onClick={() =>
                void run(async () => {
                  const t = await initiateTransfer(animal.id, {
                    toOwner: toOwner.trim(),
                    consent: true,
                  })
                  setTransfer(t)
                }, "Transfer initiated — waiting for recipient acceptance.")
              }
              loading={busy}
            >
              Initiate transfer
            </Button>
          </div>
        </Card>
      )}

      {transfer && transfer.to === myAddress && transfer.status === "accepted" && (
        <Card elevation={1} container className={shared.detailCard}>
          <Heading as="h3">Complete the transfer</Heading>
          <Text tone="muted" size="body-sm" as="p" style={{ marginTop: 4 }}>
            Recipient has accepted. Completing moves ownership on-chain and records an ownership
            event.
          </Text>
          <div className={shared.actions}>
            <Button
              onClick={() => void run(() => completeTransfer(animal.id), "Ownership transferred.")}
              loading={busy}
            >
              Complete transfer
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
