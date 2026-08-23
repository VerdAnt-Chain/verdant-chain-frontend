"use client"

/* eslint-disable react-hooks/set-state-in-effect -- search sync intentional */
import { useCallback, useEffect, useState } from "react"
import { Card } from "@/components/ui"
import { Heading, Text, StatusPill, Button, Spinner, Input } from "@/components/ui"
import { searchFarmers } from "@/lib/api/farmers"
import { shortAddress } from "@/lib/api/address"
import { useRouter } from "next/navigation"
import { Grid } from "@/components/ui"
import styles from "./search-discovery.module.css"

function playGoopyDroplet() {
  try {
    if (typeof window === "undefined") return
    const AudioCtx =
      (
        window as unknown as {
          AudioContext: typeof AudioContext
          webkitAudioContext: typeof AudioContext
        }
      ).AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    // Respect reduced motion: softer sound
    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const volume = isReduced ? 0.12 : 0.32

    const now = ctx.currentTime

    // Main plop — sine with exponential drop 880 -> 140 Hz, lowpass for goopy
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    const filt1 = ctx.createBiquadFilter()
    filt1.type = "lowpass"
    filt1.frequency.value = 1100
    filt1.Q.value = 1
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(880, now)
    osc1.frequency.exponentialRampToValueAtTime(140, now + 0.32)
    gain1.gain.setValueAtTime(volume, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
    osc1.connect(filt1).connect(gain1).connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.38)

    // Secondary blop — delayed, slightly higher for goopy bounce
    const t2 = now + 0.07
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    const filt2 = ctx.createBiquadFilter()
    filt2.type = "lowpass"
    filt2.frequency.value = 900
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(520, t2)
    osc2.frequency.exponentialRampToValueAtTime(110, t2 + 0.18)
    gain2.gain.setValueAtTime(volume * 0.55, t2)
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.22)
    osc2.connect(filt2).connect(gain2).connect(ctx.destination)
    osc2.start(t2)
    osc2.stop(t2 + 0.22)

    // Tiny bubble pop — short high plink for cartoony feel
    const t3 = now + 0.14
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = "triangle"
    osc3.frequency.setValueAtTime(1200, t3)
    osc3.frequency.exponentialRampToValueAtTime(1800, t3 + 0.06)
    gain3.gain.setValueAtTime(volume * 0.22, t3)
    gain3.gain.exponentialRampToValueAtTime(0.001, t3 + 0.09)
    osc3.connect(gain3).connect(ctx.destination)
    osc3.start(t3)
    osc3.stop(t3 + 0.09)

    setTimeout(() => void ctx.close(), 700)
  } catch {
    // ignore — audio not available
  }
}

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
  const [splash, setSplash] = useState<{ x: number; y: number } | null>(null)
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent, address: string) => {
    if (splash) return
    const x = e.clientX
    const y = e.clientY
    setSplash({ x, y })
    playGoopyDroplet()
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
              style={{ left: splash.x, top: splash.y } as React.CSSProperties}
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
