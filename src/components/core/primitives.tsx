import { Button, Heading, Text } from "@/components/ui"
import shared from "@/components/core/shared.module.css"

type EmptyStateProps = {
  title?: string
  message: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

/** Playful, actionable empty state. Never a bare "no data". */
export function EmptyState({
  title = "Nothing has grown here yet",
  message,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className={shared.detailCard}
      style={{ textAlign: "center", padding: "var(--va-space-8) var(--va-space-6)" }}
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ color: "var(--va-accent-moss)", marginBottom: 8 }}
      >
        <path d="M12 22v-9" />
        <path d="M12 13c0-3 2-5 6-5 0 3-2 5-6 5z" />
        <path d="M12 13c0-4-2.5-7-7-7 0 4 2.5 7 7 7z" />
      </svg>
      <Heading as="h3">{title}</Heading>
      <Text tone="muted" as="p" style={{ marginTop: 6, maxWidth: "34rem", marginInline: "auto" }}>
        {message}
      </Text>
      {actionLabel && actionHref && (
        <div style={{ marginTop: 14 }}>
          <Button as="a" href={actionHref}>
            {actionLabel}
          </Button>
        </div>
      )}
      {actionLabel && !actionHref && onAction && (
        <div style={{ marginTop: 14 }}>
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  )
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className={shared.grid} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={shared.skeletonCard} />
      ))}
    </div>
  )
}

export type ChipOption<T extends string> = { value: T | ""; label: string }

export function FilterBar<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ChipOption<T>[]
  value: T | ""
  onChange: (v: T | "") => void
  label: string
}) {
  return (
    <div className={shared.chips} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value || "all"}
          type="button"
          className={`${shared.chip} ${value === o.value ? shared.chipActive : ""}`}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
