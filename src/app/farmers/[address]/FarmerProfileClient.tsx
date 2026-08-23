"use client"

import { useCallback, useEffect, useState } from "react"
import { Card } from "@/components/ui"
import { Heading, Text, StatusPill, Button, Spinner } from "@/components/ui"
import { listEquipment } from "@/lib/api/equipment"
import { getFarmer, registerFarmer } from "@/lib/api/farmers"
import { listAnimals } from "@/lib/api/livestock"
import { listProofs } from "@/lib/api/proofs"
import { isNotFound } from "@/lib/api/client"
import { signInWithFreighter } from "@/lib/wallet/auth"
import {
  getWalletSnapshot,
  getWalletServerSnapshot,
  subscribeWallet,
  connectWallet,
} from "@/lib/wallet/wallet"
import { useSyncExternalStore } from "react"
import styles from "./farmer-profile.module.css"

// Verification marker kinds vocabulary (Agent #2 canonical vocabulary)
const markerKindToTone: Record<string, "yellow" | "green" | "blue" | "purple" | "teal" | "grey"> = {
  kyc: "yellow",
  registered_land: "green",
  coop_member: "blue",
  organic_certified: "purple",
  registered_animal: "teal",
  verified_proof: "grey",
}

function getMarkerTone(kind: string): "yellow" | "green" | "blue" | "purple" | "teal" | "grey" {
  return markerKindToTone[kind] || "grey"
}

interface FarmerProfileClientProps {
  address: string
}

type IdentityStats = {
  livestock: number | null
  equipmentOwned: number | null
  equipmentListed: number | null
  proofsOwned: number | null
}

const emptyIdentityStats: IdentityStats = {
  livestock: null,
  equipmentOwned: null,
  equipmentListed: null,
  proofsOwned: null,
}

export function FarmerProfileClient({ address }: FarmerProfileClientProps) {
  const [data, setData] = useState<{
    farmer: Awaited<ReturnType<typeof getFarmer>> | null
    error: Error | null
    loading: boolean
  }>({ farmer: null, error: null, loading: true })
  const [identityStats, setIdentityStats] = useState<IdentityStats>(emptyIdentityStats)

  const walletStatus = useSyncExternalStore(
    subscribeWallet,
    getWalletSnapshot,
    getWalletServerSnapshot
  )

  const loadFarmer = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }))
    setIdentityStats(emptyIdentityStats)
    try {
      const farmer = await getFarmer(address)
      setData({ farmer, error: null, loading: false })

      const [livestock, equipment, proofs] = await Promise.allSettled([
        listAnimals({ owner: address, pageSize: 100 }),
        listEquipment({ owner: address, pageSize: 100 }),
        listProofs({ creator: address, pageSize: 100 }),
      ])

      const equipmentItems = equipment.status === "fulfilled" ? equipment.value.items : null
      setIdentityStats({
        livestock: livestock.status === "fulfilled" ? livestock.value.items.length : null,
        equipmentOwned: equipmentItems?.length ?? null,
        equipmentListed: equipmentItems?.filter((item) => item.available).length ?? null,
        proofsOwned: proofs.status === "fulfilled" ? proofs.value.items.length : null,
      })
    } catch (error) {
      setIdentityStats(emptyIdentityStats)
      setData({ farmer: null, error: error as Error, loading: false })
    }
  }, [address])

  useEffect(() => {
    // schedule the fetch to avoid synchronous setState in effect (react-hooks v7 lint)
    const id = setTimeout(() => void loadFarmer(), 0)
    return () => clearTimeout(id)
  }, [loadFarmer])

  const handleRegister = async () => {
    if (walletStatus.state !== "connected") {
      try {
        await connectWallet()
      } catch {
        // Error handled by wallet
        return
      }
    }
    try {
      await signInWithFreighter()
      await registerFarmer({
        address,
        metadata: { name: address },
      })
      await loadFarmer()
    } catch {
      alert("Registration failed - ensure the wallet is signed in")
    }
  }

  if (data.loading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" label="Loading farmer profile…" />
      </div>
    )
  }

  if (data.error) {
    if (isNotFound(data.error)) {
      return (
        <Card elevation={1} className={styles.card}>
          <div className={styles.empty}>
            <Heading as="h2">Farmer not found</Heading>
            <Text as="p" tone="muted">
              No farmer registered at this address.
            </Text>
            {walletStatus.state === "connected" ? (
              <Button onClick={handleRegister} className={styles.registerBtn}>
                Register this address
              </Button>
            ) : (
              <div className={styles.walletPrompt}>
                <Text as="p" tone="muted">
                  Connect your wallet to register this address.
                </Text>
                <Button onClick={() => connectWallet()}>Connect Freighter</Button>
              </div>
            )}
          </div>
        </Card>
      )
    }

    return (
      <Card elevation={1} className={styles.card}>
        <div className={styles.error}>
          <Heading as="h2">Could not load profile</Heading>
          <Text as="p" tone="error">
            {data.error.message}
          </Text>
          <Button onClick={loadFarmer}>Retry</Button>
        </div>
      </Card>
    )
  }

  const farmer = data.farmer!
  const isRegistered = farmer.registered

  return (
    <Card elevation={1} className={styles.card} container>
      <div className={styles.header}>
        <div className={styles.idRow}>
          <StatusPill
            tone={isRegistered ? "success" : "pending"}
            label={isRegistered ? "Registered" : "Not registered"}
          />
          {farmer.id && (
            <Text as="span" size="label-md" className={styles.farmerId}>
              {farmer.id}
            </Text>
          )}
        </div>
        {farmer.address && (
          <Text as="p" size="label-md" className={styles.address}>
            {farmer.address}
          </Text>
        )}
      </div>

      {isRegistered ? (
        <>
          <div className={styles.section}>
            <Heading as="h3">On-chain identity</Heading>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <Text as="span" size="label-sm" tone="muted">
                  Created ledger
                </Text>
                <Text as="p">{farmer.createdLedger?.toLocaleString() ?? "—"}</Text>
              </div>
              <div className={styles.metaItem}>
                <Text as="span" size="label-sm" tone="muted">
                  Updated ledger
                </Text>
                <Text as="p">{farmer.updatedLedger?.toLocaleString() ?? "—"}</Text>
              </div>
            </div>
            <div className={styles.infoBubbles} aria-label="Identity-linked farm stats">
              <div className={styles.infoBubble}>
                <span>{identityStats.livestock?.toLocaleString() ?? "—"}</span>
                <small>Livestock</small>
              </div>
              <div className={styles.infoBubble}>
                <span>{identityStats.equipmentOwned?.toLocaleString() ?? "—"}</span>
                <small>Equipment owned</small>
              </div>
              <div className={styles.infoBubble}>
                <span>{identityStats.equipmentListed?.toLocaleString() ?? "—"}</span>
                <small>Listed</small>
              </div>
              <div className={styles.infoBubble}>
                <span>{identityStats.proofsOwned?.toLocaleString() ?? "—"}</span>
                <small>Proofs owned</small>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <Heading as="h3">Profile</Heading>
            {(() => {
              const p =
                (farmer.metadata as unknown as { profile?: Record<string, unknown> })?.profile ??
                farmer.metadata
              const profile = p as unknown as
                | { name?: string; region?: string; district?: string; bio?: string }
                | null
                | undefined
              return profile?.name ? (
                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <Text as="span" size="label-sm" tone="muted">
                      Name
                    </Text>
                    <Text as="p">{profile.name ?? "—"}</Text>
                  </div>
                  {profile.region && (
                    <div className={styles.metaItem}>
                      <Text as="span" size="label-sm" tone="muted">
                        Region
                      </Text>
                      <Text as="p">{profile.region}</Text>
                    </div>
                  )}
                  {profile.district && (
                    <div className={styles.metaItem}>
                      <Text as="span" size="label-sm" tone="muted">
                        District
                      </Text>
                      <Text as="p">{profile.district}</Text>
                    </div>
                  )}
                  {profile.bio && (
                    <div className={styles.metaItem} style={{ gridColumn: "1 / -1" }}>
                      <Text as="span" size="label-sm" tone="muted">
                        Bio
                      </Text>
                      <Text as="p">{profile.bio}</Text>
                    </div>
                  )}
                </div>
              ) : (
                <Text as="p" tone="muted">
                  No off-chain profile metadata available.
                </Text>
              )
            })()}
          </div>

          {farmer.verificationMarkers && farmer.verificationMarkers.length > 0 && (
            <div className={styles.section}>
              <Heading as="h3">Verification markers</Heading>
              <div className={styles.markers}>
                {farmer.verificationMarkers.map((marker, i) => (
                  <div key={i} className={styles.marker}>
                    <StatusPill tone={getMarkerTone(marker.kind)} label={marker.kind} />
                    <Text as="span" size="body-sm" tone="muted">
                      Issuer: {marker.issuer}
                    </Text>
                    <Text as="span" size="label-sm" tone="muted">
                      Ledger {marker.issuedLedger}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.unregistered}>
          <Text as="p" tone="muted">
            This address is not yet registered as a farmer on-chain.
          </Text>
          {walletStatus.state === "connected" ? (
            <Button onClick={handleRegister} className={styles.registerBtn}>
              Register this address
            </Button>
          ) : (
            <div className={styles.walletPrompt}>
              <Text as="p" tone="muted">
                Connect your wallet to register this address.
              </Text>
              <Button onClick={() => connectWallet()}>Connect Freighter</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
