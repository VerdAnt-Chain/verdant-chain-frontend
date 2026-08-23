"use client"

/* eslint-disable react-hooks/set-state-in-effect -- intentional sync of wallet/farmer state on mount/change */
import { useCallback, useEffect, useState } from "react"
import { useSyncExternalStore } from "react"
import Link from "next/link"
import { Card, Heading, Text, Button, Spinner, StatusPill, Grid } from "@/components/ui"
import { getFarmer } from "@/lib/api/farmers"
import { isNotFound } from "@/lib/api/client"
import { getWalletSnapshot, getWalletServerSnapshot, subscribeWallet } from "@/lib/wallet/wallet"
import type { FarmerRecord } from "@/lib/api/types"
import { shortAddress } from "@/lib/api/address"

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card elevation={1} style={{ padding: 16 }}>
      <Text size="label-sm" tone="muted" as="p">
        {label}
      </Text>
      <Heading as="h3" style={{ marginTop: 4 }}>
        {value}
      </Heading>
      {sub && (
        <Text size="body-sm" tone="muted" as="p" style={{ marginTop: 4 }}>
          {sub}
        </Text>
      )}
    </Card>
  )
}

export default function AccountPage() {
  const wallet = useSyncExternalStore(subscribeWallet, getWalletSnapshot, getWalletServerSnapshot)
  const [farmer, setFarmer] = useState<FarmerRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    if (wallet.state !== "connected") {
      setFarmer(null)
      setNotFound(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const rec = await getFarmer(wallet.address)
      setFarmer(rec)
    } catch (e) {
      if (isNotFound(e)) {
        setNotFound(true)
        setFarmer(null)
      } else {
        setError(e instanceof Error ? e.message : "Could not load account")
      }
    } finally {
      setLoading(false)
    }
  }, [wallet])

  useEffect(() => {
    void load()
  }, [load])

  const isRegistered = farmer?.registered ?? false
  const markers = farmer?.verificationMarkers ?? []
  const profile = (() => {
    const m = farmer?.metadata
    if (!m) return undefined
    return "profile" in m ? m.profile : (m as import("@/lib/api/types").FarmerProfileMetadata)
  })()
  const completeness = (() => {
    if (!profile) return 0
    const fields = [
      profile.name,
      profile.region,
      profile.district,
      profile.bio,
      profile.profileImageHash,
    ]
    const filled = fields.filter((v) => typeof v === "string" && v.trim().length > 0).length
    return Math.round((filled / fields.length) * 100)
  })()

  return (
    <div style={{ padding: 24, maxWidth: 960 }}>
      <Heading as="h1">Account Overview</Heading>
      <Text tone="muted" as="p" style={{ marginTop: 8 }}>
        Biodata and on-chain stats for your VerdAnt account.
      </Text>

      {wallet.state !== "connected" && (
        <Card elevation={1} style={{ marginTop: 16 }}>
          <Heading as="h3">No wallet connected</Heading>
          <Text tone="muted" as="p" style={{ marginTop: 8 }}>
            Connect Freighter via the header to load your biodata and stats.
          </Text>
          <div style={{ marginTop: 12 }}>
            <Button as="a" href="/profile">
              Go to Profile
            </Button>
          </div>
        </Card>
      )}

      {wallet.state === "connected" && loading && (
        <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
          <Spinner size="md" label="Loading account…" />
        </div>
      )}

      {wallet.state === "connected" && !loading && notFound && (
        <>
          <Card elevation={1} style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <StatusPill tone="pending" label="Not registered" />
              <Text size="label-sm" tone="muted">
                {shortAddress(wallet.address)} — {wallet.address}
              </Text>
            </div>
            <Heading as="h3" style={{ marginTop: 12 }}>
              No farmer profile yet
            </Heading>
            <Text tone="muted" as="p" style={{ marginTop: 8 }}>
              Your wallet is connected but no on-chain farmer record exists. Create your profile to
              get verified and appear in AgriScout.
            </Text>
            <div style={{ marginTop: 12 }}>
              <Button as="a" href="/profile">
                Create farmer profile
              </Button>
            </div>
          </Card>
          <Grid cols={3} gap={4} responsive style={{ marginTop: 16 }}>
            <StatCard label="Verifications" value="0" sub="No markers yet" />
            <StatCard label="Profile" value="0%" sub="Incomplete" />
            <StatCard label="Status" value="Not registered" sub="On-chain" />
          </Grid>
        </>
      )}

      {wallet.state === "connected" && !loading && error && (
        <Card elevation={1} style={{ marginTop: 16, borderColor: "var(--va-error)" }}>
          <StatusPill tone="error" label="Error" />
          <Text tone="error" as="p" style={{ marginTop: 8 }}>
            {error}
          </Text>
          <div style={{ marginTop: 12 }}>
            <Button variant="outlined" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {wallet.state === "connected" && !loading && farmer && !notFound && !error && (
        <>
          <Card elevation={1} style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <StatusPill
                tone={isRegistered ? "success" : "pending"}
                label={isRegistered ? "Registered" : "Pending"}
              />
              {farmer.id && (
                <Text size="label-sm" tone="muted">
                  {farmer.id}
                </Text>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr",
                gap: 16,
                marginTop: 16,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--va-primary-container)",
                  color: "var(--va-on-primary-container)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                {(profile?.name ?? wallet.address).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <Heading as="h3">{profile?.name ?? shortAddress(wallet.address)}</Heading>
                <Text size="label-sm" tone="muted" as="p" style={{ wordBreak: "break-all" }}>
                  {wallet.address}
                </Text>
                {(profile?.region || profile?.district) && (
                  <Text size="body-sm" tone="muted" as="p" style={{ marginTop: 4 }}>
                    {[profile?.region, profile?.district].filter(Boolean).join(" · ")}
                  </Text>
                )}
                {profile?.bio && (
                  <Text as="p" style={{ marginTop: 8 }}>
                    {profile.bio}
                  </Text>
                )}
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button as="a" href={`/farmers/${wallet.address}`} variant="outlined" size="sm">
                    View on-chain record
                  </Button>
                  <Button as="a" href="/profile" size="sm">
                    Edit profile
                  </Button>
                </div>
              </div>
            </div>
            {markers.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {markers.map((m, i) => (
                  <StatusPill key={`${m.kind}-${i}`} tone="info" label={m.kind} />
                ))}
              </div>
            )}
          </Card>

          <Grid cols={3} gap={4} responsive style={{ marginTop: 16 }}>
            <StatCard
              label="Verifications"
              value={`${markers.length}`}
              sub={`${markers.length} marker${markers.length === 1 ? "" : "s"}`}
            />
            <StatCard
              label="Profile"
              value={`${completeness}%`}
              sub={completeness === 100 ? "Complete" : "Incomplete"}
            />
            <StatCard
              label="Ledger"
              value={farmer.createdLedger ? `#${farmer.createdLedger.toLocaleString()}` : "—"}
              sub={
                farmer.updatedLedger && farmer.updatedLedger !== farmer.createdLedger
                  ? `Updated #${farmer.updatedLedger.toLocaleString()}`
                  : "On-chain"
              }
            />
          </Grid>

          <Card elevation={1} style={{ marginTop: 16 }}>
            <Heading as="h4">Quick actions</Heading>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <Button as="a" href="/profile" variant="outlined" size="sm">
                Edit profile
              </Button>
              <Button as="a" href="/settings" variant="outlined" size="sm">
                Settings
              </Button>
              <Button as="a" href="/discover" variant="outlined" size="sm">
                Browse farmers
              </Button>
            </div>
          </Card>
        </>
      )}

      <Card elevation={1} style={{ marginTop: 24 }}>
        <Heading as="h4">More</Heading>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <Link href="/profile" style={{ textDecoration: "none" }}>
            <Button variant="text" size="sm">
              Profile →
            </Button>
          </Link>
          <Link href="/settings" style={{ textDecoration: "none" }}>
            <Button variant="text" size="sm">
              Settings →
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
