"use client"

/* eslint-disable react-hooks/set-state-in-effect -- search sync intentional */
import { useCallback, useEffect, useState } from "react"
import { Card } from "@/components/ui"
import { Heading, Text, StatusPill, Button, Spinner, Input } from "@/components/ui"
import { searchFarmers } from "@/lib/api/farmers"
import { shortAddress } from "@/lib/api/address"
import { playModernClick } from "@/lib/ui/sound"
import { useRouter } from "next/navigation"
import { Grid } from "@/components/ui"
import styles from "./search-discovery.module.css"

export function SearchDiscoveryClient() {
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [results, setResults] = useState<
    {
      address: string
      name: string
      region?: string
      district?: string
      verificationCount: number
    }[]
  >([])

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  type SplashOrigin = { cx: number; cy: number; w: number; h: number; scale: number }
  const [splash, setSplash] = useState<SplashOrigin | null>(null)
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent, address: string) => {
    if (splash) return
    // Splash expands from the selected result itself — match the card's bounds
    const el = e.currentTarget as HTMLElement
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const needed = Math.hypot(window.innerWidth, window.innerHeight) * 1.15
    const scale = Math.max(needed / Math.min(r.width, r.height), 8)
    setSplash({ cx, cy, w: r.width, h: r.height, scale })
    playModernClick("select")
    window.setTimeout(() => {
      router.push("/farmers/" + address)
    }, 420)
  }

  const normalized = submittedQuery.trim()

  const runSearch = useCallback(
    (page: number, pageSize: number) => {
      if (!normalized) return
      setLoading(true)
      searchFarmers({ q: normalized, page, pageSize })
        .then((resp) => {
          setResults(
            resp.items.map((item) => ({
              address: item.address,
              name: item.name,
              region: item.region,
              district: item.district,
              verificationCount: item.verificationCount,
            }))
          )
          setPagination({
            page: resp.pagination.page,
            pageSize: resp.pagination.pageSize,
            total: resp.pagination.total,
            totalPages: resp.pagination.totalPages,
          })
          setError(null)
        })
        .catch((e) => {
          setError(e instanceof Error ? e.message : "Could not reach the VerdAnt API")
          setResults([])
          setPagination({
            page: 1,
            pageSize: 20,
            total: 0,
            totalPages: 0,
          })
        })
        .finally(() => setLoading(false))
    },
    [normalized]
  )

  useEffect(() => {
    if (!normalized) {
      setResults([])
      setPagination({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
      setError(null)
      return
    }
    runSearch(1, 20)
  }, [normalized, runSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setSubmittedQuery(q)
  }

  const handlePageChange = (page: number) => {
    if (!normalized) return
    runSearch(page, pagination.pageSize)
  }

  return (
    <div className={styles.container}>
      <Heading as="h2">AgriScout Discovery</Heading>
      <Text as="p" tone="muted" className={styles.subtitle}>
        Substring search on farmer name, region, or district. Use the form below.
      </Text>

      <form onSubmit={handleSearch} className={styles.form}>
        <Input
          label="Search farmers"
          placeholder="Name, region, or district..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" loading={loading}>
          Search
        </Button>
      </form>

      {error && (
        <Card elevation={1} className={styles.errorCard}>
          <StatusPill tone="error" label="Error" />
          <Text as="p" tone="error">
            {error}
          </Text>
        </Card>
      )}

      {loading && <Spinner size="md" label="Searching farmers…" className={styles.spinner} />}

      {results.length > 0 && (
        <>
          <div className={styles.resultsGrid}>
            {results.map((farmer) => (
              <Card
                key={farmer.address}
                elevation={1}
                className={styles.resultCard}
                data-sound="none"
                onClick={(e) => handleCardClick(e, farmer.address)}
              >
                <div className={styles.header}>
                  <StatusPill
                    tone={farmer.verificationCount > 0 ? "success" : "info"}
                    label={`Verified (${farmer.verificationCount})`}
                  />
                  <span className={styles.farmerId} title={farmer.address}>
                    {shortAddress(farmer.address)}
                  </span>
                </div>
                <div className={styles.meta}>
                  <p>
                    <strong>Name:</strong> {farmer.name}
                  </p>
                  {farmer.region && (
                    <p>
                      <strong>Region:</strong> {farmer.region}
                    </p>
                  )}
                  {farmer.district && (
                    <p>
                      <strong>District:</strong> {farmer.district}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {splash && (
            <div
              className={`${styles.splash} ${styles.splashActive}`}
              style={
                {
                  left: splash.cx,
                  top: splash.cy,
                  width: splash.w,
                  height: splash.h,
                  "--splash-scale": splash.scale,
                } as React.CSSProperties
              }
              aria-hidden="true"
            >
              <span className={styles.splashInner} />
              <span className={styles.splashRipple} />
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 16,
                justifyContent: "center",
              }}
            >
              <Button
                variant="outlined"
                size="sm"
                disabled={pagination.page <= 1 || loading}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <Text size="body-sm" tone="muted">
                Page {pagination.page} of {pagination.totalPages} — {pagination.total} farmers
              </Text>
              <Button
                variant="outlined"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {results.length === 0 && normalized && !loading && !error && (
        <Card elevation={1} className={styles.emptyState}>
          <StatusPill tone="info" label="No farmers found" />
          <Text>
            No farmers matched <code>{normalized}</code> — try adjusting your search terms.
          </Text>
        </Card>
      )}

      {!normalized && (
        <Card elevation={1} className={styles.emptyState}>
          <StatusPill tone="info" label="Enter a search term" />
          <Text>Enter a name, region, or district to search the farmer directory.</Text>
        </Card>
      )}

      <section className={styles.future} aria-labelledby="future-heading">
        <Heading as="h3" id="future-heading">
          Directory & reputation
        </Heading>
        <Grid cols={3} gap={4} responsive className={styles.futureGrid}>
          <Card elevation={1} container>
            <Heading as="h4">Verified farmers</Heading>
            <Text tone="muted">Directory of farmers with on-chain verification markers.</Text>
          </Card>
          <Card elevation={1} container>
            <Heading as="h4">Reputation scores</Heading>
            <Text tone="muted">Aggregated scores from verification history and activity.</Text>
          </Card>
          <Card elevation={1} container>
            <Heading as="h4">Opportunity matching</Heading>
            <Text tone="muted">Connect farmers with buyers, equipment, and financing.</Text>
          </Card>
        </Grid>
        <Text tone="muted" className={styles.note}>
          Search the directory above for registered farmers. Reputation and verified history
          surfaces will be available in a future Phase 4b increment after the verification contract
          documented in /docs/architecture/integration.md is implemented and indexed.
        </Text>
      </section>
    </div>
  )
}
