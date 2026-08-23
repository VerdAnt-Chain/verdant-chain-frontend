import type { ReactNode } from "react"
import { Heading, Text } from "@/components/ui"
import shared from "@/components/core/shared.module.css"

export type TimelineEntry = {
  key: string
  title: ReactNode
  meta?: ReactNode
  body?: ReactNode
  muted?: boolean
}

/** Vertical expressive timeline for provenance / evidence / milestones. */
export function Timeline({ entries, label }: { entries: TimelineEntry[]; label: string }) {
  if (entries.length === 0) return null
  return (
    <div className={shared.timeline} role="list" aria-label={label}>
      {entries.map((e) => (
        <div
          key={e.key}
          role="listitem"
          className={`${shared.timelineItem} ${e.muted ? shared.timelineMuted : ""}`}
        >
          <span className={shared.timelineDot} aria-hidden="true" />
          <Heading as="h4">{e.title}</Heading>
          {e.meta && (
            <Text size="body-sm" tone="muted" as="p">
              {e.meta}
            </Text>
          )}
          {e.body && <div style={{ marginTop: 4 }}>{e.body}</div>}
        </div>
      ))}
    </div>
  )
}

/** Tonal funding progress with percentage + amounts. */
export function ProgressIndicator({
  value,
  max,
  formatValue,
  label = "Progress",
}: {
  value: number
  max: number
  formatValue?: (n: number) => string
  label?: string
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const fmt = formatValue ?? ((n: number) => String(n))
  return (
    <div>
      <div className={shared.row} style={{ justifyContent: "space-between", marginBottom: 6 }}>
        <Text size="body-sm" tone="muted" as="span">
          {label}
        </Text>
        <Text
          size="body-sm"
          as="span"
          style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
        >
          {fmt(value)} / {fmt(max)} · {pct}%
        </Text>
      </div>
      <div
        className={shared.progressTrack}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={shared.progressBar} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Evidence surface: metadata/hash/reference — no document rendering yet. */
export function EvidenceCard({
  filename,
  type,
  contentHash,
  uri,
  submittedBy,
  createdAt,
}: {
  filename?: string
  type: string
  contentHash: string
  uri?: string | null
  submittedBy: string
  createdAt: string
}) {
  return (
    <div
      className={shared.detailCard}
      style={{ padding: "var(--va-space-4)", marginBottom: "var(--va-space-2)" }}
    >
      <div className={shared.row} style={{ justifyContent: "space-between" }}>
        <Text as="strong">{filename ?? `${type} evidence`}</Text>
        <Text size="label-sm" tone="muted" as="span">
          {type}
        </Text>
      </div>
      {uri && (
        <Text size="body-sm" as="p" style={{ marginTop: 4, wordBreak: "break-all" }}>
          <a href={uri} target="_blank" rel="noreferrer">
            {uri}
          </a>
        </Text>
      )}
      <Text size="body-sm" tone="muted" as="p" className={shared.mono} style={{ marginTop: 4 }}>
        sha256: {contentHash.slice(0, 24)}…{contentHash.slice(-8)}
      </Text>
      <Text size="body-sm" tone="muted" as="p" style={{ marginTop: 2 }}>
        by {submittedBy.slice(0, 8)}… · {new Date(createdAt).toLocaleDateString()}
      </Text>
    </div>
  )
}
