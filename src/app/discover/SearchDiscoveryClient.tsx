"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui"
import { Heading, Text, StatusPill, Button, Spinner, Input } from "@/components/ui"
import { searchFarmers } from "@/lib/api/farmers"
import { useRouter } from "next/navigation"
import { Grid } from "@/components/ui"
import styles from "./search-discovery.module.css"

export function SearchDiscoveryClient() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<
    | {
        address: string
        name: string
        region?: string
        district?: string
        verificationCount: number
      }[]
    | []
  >([])

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const normalized = query.trim()

  useEffect(() => {
    if (!normalized) {
      return
    }
    runSearch(1, 20)
  }, [normalized])

  function runSearch(page: number, pageSize: number) {
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
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setQuery(q)
    runSearch(1, 20)
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
        <div className={styles.resultsGrid}>
          {results.map((farmer) => (
            <Card
              key={farmer.address}
              elevation={1}
              className={styles.resultCard}
              onClick={() => router.push("/farmers/" + farmer.address)}
            >
              <div className={styles.header}>
                <StatusPill
                  tone={farmer.verificationCount > 0 ? "success" : "info"}
                  label={`Verified (${farmer.verificationCount})`}
                />
                <span className={styles.farmerId}>
                  {farmer.address.substring(0, 6)}…{farmer.address.substring(6)}
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
      )}

      {results.length === 0 && normalized && (
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
