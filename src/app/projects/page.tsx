"use client"

/* eslint-disable react-hooks/set-state-in-effect -- load on mount/filter change */
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button, Card, Heading, StatusPill, Text } from "@/components/ui"
import { EmptyState, FilterBar, SkeletonCards } from "@/components/core/primitives"
import { ProgressIndicator } from "@/components/core/workflow"
import { listProjects } from "@/lib/api/projects"
import { formatStroops } from "@/lib/api/format"
import type { ProjectCategory, ProjectStatus, ProjectSummary } from "@/lib/api/types"
import shared from "@/components/core/shared.module.css"

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "crops", label: "🌱 Crops" },
  { value: "livestock", label: "🐄 Livestock" },
  { value: "infrastructure", label: "🏗️ Infrastructure" },
  { value: "equipment", label: "🚜 Equipment" },
] satisfies { value: ProjectCategory | ""; label: string }[]

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "funding", label: "Funding" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
] satisfies { value: ProjectStatus | ""; label: string }[]

export default function ProjectsPage() {
  const [category, setCategory] = useState<ProjectCategory | "">("")
  const [status, setStatus] = useState<ProjectStatus | "">("")
  const [items, setItems] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listProjects({
        category: category || undefined,
        status: status || undefined,
      })
      setItems(res.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the VerdAnt API")
    } finally {
      setLoading(false)
    }
  }, [category, status])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className={shared.page}>
      <header className={shared.header}>
        <div className={shared.titleRow}>
          <StatusPill tone="info" label="FarmFund" />
          <Heading as="h1">Projects</Heading>
        </div>
        <Text as="p" size="body-lg" className={shared.lede}>
          Milestone-based agricultural financing — back a project, watch progress prove itself.
        </Text>
        <div className={shared.actions}>
          <Button as="a" href="/projects/create">
            Start a project
          </Button>
        </div>
      </header>

      <div className={shared.toolbar}>
        <FilterBar
          label="Filter by category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
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
          message="No projects here yet. Start one and let the ecosystem fund it milestone by milestone."
          actionLabel="Start the first project"
          actionHref="/projects/create"
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className={shared.grid}>
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${encodeURIComponent(p.id)}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card interactive elevation={1} container className={shared.card}>
                <div className={shared.row} style={{ justifyContent: "space-between" }}>
                  <StatusPill
                    tone={
                      p.status === "completed"
                        ? "success"
                        : p.status === "active" || p.status === "funding"
                          ? "info"
                          : "pending"
                    }
                    label={p.status}
                  />
                  <Text size="label-sm" tone="muted" as="span">
                    {p.category}
                  </Text>
                </div>
                <Heading as="h3" style={{ marginTop: 10 }}>
                  {p.title}
                </Heading>
                <div style={{ marginTop: 12 }}>
                  <ProgressIndicator
                    value={Number(p.fundedAmount ?? 0)}
                    max={Number(p.fundingTarget ?? 0)}
                    formatValue={(n) => formatStroops(n, { decimals: 0 })}
                    label="Funded"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
