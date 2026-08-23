"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Heading, Input, StatusPill, Text } from "@/components/ui"
import { createProject } from "@/lib/api/projects"
import type { ProjectCategory } from "@/lib/api/types"
import shared from "@/components/core/shared.module.css"

export default function CreateProjectPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ProjectCategory>("crops")
  const [targetXlm, setTargetXlm] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required")
      return
    }
    const xlm = Number(targetXlm)
    if (!Number.isFinite(xlm) || xlm <= 0) {
      setError("Funding target must be a positive number (XLM)")
      return
    }
    setBusy(true)
    try {
      // UI collects XLM; the API expects stroops (1 XLM = 10^7 stroops).
      const stroops = BigInt(Math.round(xlm * 100)) * BigInt(100000)
      const project = await createProject({
        title: title.trim(),
        description: description.trim(),
        category,
        fundingTarget: Number(stroops),
      })
      router.push(`/projects/${encodeURIComponent(project.id)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the project")
      setBusy(false)
    }
  }

  return (
    <div className={shared.page} style={{ maxWidth: "44rem" }}>
      <header className={shared.header}>
        <StatusPill tone="info" label="FarmFund" />
        <Heading as="h1">Start a project</Heading>
        <Text as="p" className={shared.lede}>
          Describe what you will grow or build. Backers fund it; milestones prove it.
        </Text>
      </header>

      <Card elevation={1} container className={shared.detailCard}>
        <form onSubmit={submit} className={shared.formGrid}>
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dry-season irrigation expansion"
          />
          <div>
            <Text
              size="body-sm"
              tone="muted"
              as="label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Description *
            </Text>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What will this project achieve, and how?"
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
          <div>
            <Text
              size="body-sm"
              tone="muted"
              as="label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Category
            </Text>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProjectCategory)}
              aria-label="Category"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--va-shape-sm)",
                border: "1px solid var(--va-outline-variant)",
                background: "var(--va-surface)",
                color: "var(--va-on-surface)",
              }}
            >
              <option value="crops">🌱 Crops</option>
              <option value="livestock">🐄 Livestock</option>
              <option value="infrastructure">🏗️ Infrastructure</option>
              <option value="equipment">🚜 Equipment</option>
            </select>
          </div>
          <Input
            label="Funding target (XLM) *"
            value={targetXlm}
            onChange={(e) => setTargetXlm(e.target.value)}
            inputMode="decimal"
            placeholder="5.00"
          />

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
