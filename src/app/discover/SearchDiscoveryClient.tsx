"use client"

/* eslint-disable react-hooks/set-state-in-effect -- search sync intentional */
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Heading, Input, StatusPill, Text } from "@/components/ui"
import { EmptyState, SkeletonCards } from "@/components/core/primitives"
import { searchFarmers } from "@/lib/api/farmers"
import { shortAddress } from "@/lib/api/address"
import { playModernClick } from "@/lib/ui/sound"
import shared from "@/components/core/shared.module.css"
import styles from "./search-discovery.module.css"

type FarmerResult = {
  address: string
  name: string
  region?: string
  district?: string
  verificationCount: number
}

type SplashOrigin = { cx: number; cy: number; w: number; h: number; scale: number }

export function SearchDiscoveryClient() {
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [results, setResults] = useState<FarmerResult[]>([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [splash, setSplash] = useState<SplashOrigin | null>(null)
  const router = useRouter()

  const handleCardClick = (event: React.MouseEvent, address: string) => {
    if (splash) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const needed = Math.hypot(window.innerWidth, window.innerHeight) * 1.15
    setSplash({
      cx: bounds.left + bounds.width / 2,
      cy: bounds.top + bounds.height / 2,
      w: bounds.width,
      h: bounds.height,
      scale: Math.max(needed / Math.min(bounds.width, bounds.height), 8),
    })
    playModernClick("select")
    window.setTimeout(() => router.push(`/farmers/${address}`), 1440)
  }

  const normalized = submittedQuery.trim()
  const runSearch = useCallback(
    (page: number, pageSize: number) => {
      if (!normalized) return
      setLoading(true)
      searchFarmers({ q: normalized, page, pageSize })
        .then((response) => {
          setResults(
            response.items.map((item) => ({
              address: item.address,
              name: item.name,
              region: item.region,
              district: item.district,
              verificationCount: item.verificationCount,
            }))
          )
          setPagination(response.pagination)
          setError(null)
        })
        .catch((reason) => {
          setError(reason instanceof Error ? reason.message : "Could not reach the VerdAnt API")
          setResults([])
          setPagination({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
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

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const value = query.trim()
    if (value) setSubmittedQuery(value)
  }

  return (
    <div className={shared.page}>
      <header className={shared.header}>
        <div className={shared.titleRow}>
          <StatusPill tone="info" label="AgriScout" />
          <Heading as="h1">Discover farmers</Heading>
        </div>
        <Text as="p" size="body-lg" className={shared.lede}>
          Find verified farmers and agricultural partners by name, region, or district.
        </Text>
        <div className={shared.actions}>
          <Button as="a" href="/profile">
            Create your farmer profile
          </Button>
        </div>
      </header>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <Input
          label="Search the farmer directory"
          placeholder="Name, region, or district..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button type="submit" loading={loading}>
          Search
        </Button>
      </form>

      {loading && <SkeletonCards count={3} />}

      {!loading && error && (
        <Card elevation={1} className={`${shared.detailCard} ${shared.alertError}`}>
          <StatusPill tone="error" label="Error" />
          <Text tone="error" as="p" style={{ marginTop: 8 }}>
            {error}
          </Text>
          <div className={shared.actions}>
            <Button
              variant="outlined"
              onClick={() => runSearch(pagination.page, pagination.pageSize)}
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && !normalized && (
        <EmptyState
          title="Discover your agricultural network"
          message="Search by a farmer’s name, region, or district to explore registered profiles and verification history."
        />
      )}

      {!loading && !error && normalized && results.length === 0 && (
        <EmptyState
          message={`No farmers matched “${normalized}”. Try a different name, region, or district.`}
          actionLabel="Clear search"
          onAction={() => {
            setQuery("")
            setSubmittedQuery("")
          }}
        />
      )}

      {!loading && !error && results.length > 0 && (
        <>
          <div className={shared.grid}>
            {results.map((farmer) => (
              <Card
                key={farmer.address}
                interactive
                container
                elevation={1}
                className={`${shared.card} ${styles.resultCard}`}
                data-sound="none"
                onClick={(event) => handleCardClick(event, farmer.address)}
              >
                <div className={shared.row} style={{ justifyContent: "space-between" }}>
                  <StatusPill
                    tone={farmer.verificationCount > 0 ? "success" : "info"}
                    label={`${farmer.verificationCount} verified`}
                  />
                  <span className={shared.mono} title={farmer.address}>
                    {shortAddress(farmer.address)}
                  </span>
                </div>
                <Heading as="h3" style={{ marginTop: 10 }}>
                  {farmer.name}
                </Heading>
                <Text tone="muted" as="p" style={{ marginTop: 4 }}>
                  {[farmer.region, farmer.district].filter(Boolean).join(" · ") ||
                    "Location not listed"}
                </Text>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className={shared.actions} style={{ justifyContent: "center" }}>
              <Button
                variant="outlined"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => runSearch(pagination.page - 1, pagination.pageSize)}
              >
                Previous
              </Button>
              <Text size="body-sm" tone="muted">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} farmers
              </Text>
              <Button
                variant="outlined"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => runSearch(pagination.page + 1, pagination.pageSize)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

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
    </div>
  )
}
