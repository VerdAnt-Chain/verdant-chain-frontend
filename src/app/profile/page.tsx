"use client"

/* eslint-disable react-hooks/set-state-in-effect -- intentional load on wallet change */
import { useCallback, useEffect, useState } from "react"
import { useSyncExternalStore } from "react"
import Link from "next/link"
import { Card, Heading, Text, Button, Input, Spinner, StatusPill } from "@/components/ui"
import { getFarmer, registerFarmer, updateFarmerMetadata } from "@/lib/api/farmers"
import { isNotFound, ApiError } from "@/lib/api/client"
import {
  getWalletSnapshot,
  getWalletServerSnapshot,
  subscribeWallet,
  connectWallet,
} from "@/lib/wallet/wallet"
import { getAuthSnapshot, getAuthServerSnapshot, subscribeAuth } from "@/lib/wallet/auth"
import { signInWithFreighter } from "@/lib/wallet/auth"
import type { FarmerRecord } from "@/lib/api/types"

type FormState = {
  name: string
  region: string
  district: string
  bio: string
  profileImageHash: string
}

export default function ProfilePage() {
  const wallet = useSyncExternalStore(subscribeWallet, getWalletSnapshot, getWalletServerSnapshot)
  const auth = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot)

  const [farmer, setFarmer] = useState<FarmerRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    name: "",
    region: "",
    district: "",
    bio: "",
    profileImageHash: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const loadFarmer = useCallback(async () => {
    if (wallet.state !== "connected") {
      setFarmer(null)
      setNotFound(false)
      return
    }
    setLoading(true)
    setFetchError(null)
    setNotFound(false)
    try {
      const rec = await getFarmer(wallet.address)
      setFarmer(rec)
      // Backend returns flat FarmerProfileMetadata as `metadata`; docs contract nests as metadata.profile
      const p =
        (rec.metadata as unknown as { profile?: typeof rec.metadata })?.profile ??
        (rec.metadata as unknown as typeof form)
      const flat = p as unknown as FormState
      setForm({
        name: flat?.name ?? "",
        region: flat?.region ?? "",
        district: flat?.district ?? "",
        bio: flat?.bio ?? "",
        profileImageHash:
          (flat as unknown as { profileImageHash?: string })?.profileImageHash ?? "",
      })
      setSubmitSuccess(null)
    } catch (e) {
      if (isNotFound(e)) {
        setNotFound(true)
        setFarmer(null)
        setForm({ name: "", region: "", district: "", bio: "", profileImageHash: "" })
      } else {
        setFetchError(e instanceof Error ? e.message : "Could not load profile")
      }
    } finally {
      setLoading(false)
    }
  }, [wallet])

  useEffect(() => {
    void loadFarmer()
  }, [loadFarmer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (wallet.state !== "connected") {
      setSubmitError("Connect your wallet first")
      return
    }
    if (!form.name.trim()) {
      setSubmitError("Name is required")
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    try {
      // Ensure signed in before mutating
      if (auth.state !== "signed_in") {
        try {
          await signInWithFreighter()
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : "Sign-in failed")
        }
      }
      const metadata = {
        name: form.name.trim(),
        region: form.region.trim() || undefined,
        district: form.district.trim() || undefined,
        bio: form.bio.trim() || undefined,
        profileImageHash: form.profileImageHash.trim() || undefined,
      }
      let rec: FarmerRecord
      if (notFound || !farmer?.registered) {
        rec = await registerFarmer({ address: wallet.address, metadata })
        setSubmitSuccess("Farmer profile created on-chain")
      } else {
        rec = await updateFarmerMetadata(wallet.address, metadata)
        setSubmitSuccess("Profile updated")
      }
      setFarmer(rec)
      setNotFound(false)
      const p2 =
        (rec.metadata as unknown as { profile?: typeof rec.metadata })?.profile ??
        (rec.metadata as unknown as typeof form)
      const flat2 = p2 as unknown as FormState
      if (flat2) {
        setForm({
          name: flat2.name ?? "",
          region: flat2.region ?? "",
          district: flat2.district ?? "",
          bio: flat2.bio ?? "",
          profileImageHash:
            (flat2 as unknown as { profileImageHash?: string })?.profileImageHash ?? "",
        })
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setSubmitError("Already registered — try updating instead")
        else if (err.status === 401) setSubmitError("Not authorized — sign in with Freighter first")
        else setSubmitError(err.message)
      } else {
        setSubmitError(err instanceof Error ? err.message : "Submission failed")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (wallet.state !== "connected") {
    return (
      <div style={{ padding: 24, maxWidth: 720 }}>
        <Heading as="h1">Profile</Heading>
        <Text tone="muted" as="p" style={{ marginTop: 8 }}>
          Create and manage your farmer profile — name, region, district, bio and image hash
          (AD-004).
        </Text>
        <Card style={{ marginTop: 16 }}>
          <Heading as="h3">Connect wallet</Heading>
          <Text tone="muted" as="p" style={{ marginTop: 8 }}>
            Your farmer identity is anchored to your Stellar public key. Connect Freighter to create
            or edit your profile.
          </Text>
          <div style={{ marginTop: 12 }}>
            <Button onClick={() => void connectWallet()}>Connect Freighter</Button>
          </div>
          <Text tone="muted" as="p" style={{ marginTop: 8, fontSize: "0.875rem" }}>
            Or <Link href="/discover">browse farmers</Link> without connecting.
          </Text>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <Heading as="h1">Profile</Heading>
      <Text tone="muted" as="p" style={{ marginTop: 8 }}>
        {notFound || !farmer?.registered
          ? "Create your farmer profile"
          : "Edit your farmer profile"}{" "}
        — signed in as <code style={{ wordBreak: "break-all" }}>{wallet.address}</code>
      </Text>

      {loading && (
        <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
          <Spinner size="md" label="Loading profile…" />
        </div>
      )}

      {fetchError && (
        <Card elevation={1} style={{ marginTop: 16, borderColor: "var(--va-error)" }}>
          <StatusPill tone="error" label="Error" />
          <Text tone="error" as="p" style={{ marginTop: 8 }}>
            {fetchError}
          </Text>
          <div style={{ marginTop: 12 }}>
            <Button variant="outlined" onClick={() => void loadFarmer()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!loading && !fetchError && (
        <Card elevation={1} style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <StatusPill
              tone={notFound ? "pending" : "success"}
              label={notFound ? "Not registered" : "Registered"}
            />
            {auth.state !== "signed_in" && (
              <StatusPill tone="info" label="Sign-in required to save" />
            )}
            {farmer?.id && (
              <Text size="label-sm" tone="muted">
                {farmer.id}
              </Text>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, marginTop: 16 }}>
            <Input
              label="Name *"
              placeholder="Ada Farm Cooperative"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input
                label="Region"
                placeholder="Niger"
                value={form.region}
                onChange={(e) => setForm((s) => ({ ...s, region: e.target.value }))}
              />
              <Input
                label="District"
                placeholder="Zinder"
                value={form.district}
                onChange={(e) => setForm((s) => ({ ...s, district: e.target.value }))}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: 6,
                  color: "var(--va-on-surface-variant)",
                }}
              >
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
                placeholder="Short biography, crops, practices…"
                rows={4}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--va-shape-sm)",
                  border: "1px solid var(--va-outline-variant)",
                  background: "var(--va-surface)",
                  color: "var(--va-on-surface)",
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                }}
              />
            </div>
            <Input
              label="Profile image hash (sha256, AD-004)"
              placeholder="a3f9c1… (optional)"
              value={form.profileImageHash}
              onChange={(e) => setForm((s) => ({ ...s, profileImageHash: e.target.value }))}
            />
            <Text size="body-sm" tone="muted" as="p">
              Name is required. Other fields are optional free text in this phase. Hash is stored
              off-chain; only <code>metadata_hash</code> is submitted on-chain.
            </Text>

            {submitError && (
              <Card elevation={0} style={{ padding: 12, borderColor: "var(--va-error)" }}>
                <StatusPill tone="error" label="Failed" />
                <Text tone="error" size="body-sm" as="p" style={{ marginTop: 8 }}>
                  {submitError}
                </Text>
              </Card>
            )}
            {submitSuccess && (
              <Card
                elevation={0}
                style={{ padding: 12, borderColor: "var(--va-success, #2e7d32)" }}
              >
                <StatusPill tone="success" label="Saved" />
                <Text size="body-sm" as="p" style={{ marginTop: 8 }}>
                  {submitSuccess}
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Button as="a" href={`/farmers/${wallet.address}`} variant="outlined" size="sm">
                    View on-chain record
                  </Button>
                </div>
              </Card>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button type="submit" loading={submitting}>
                {notFound || !farmer?.registered ? "Create profile" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => void loadFarmer()}
                disabled={submitting}
              >
                Reset
              </Button>
              {farmer?.registered && (
                <Button as="a" href={`/farmers/${wallet.address}`} variant="text">
                  View profile →
                </Button>
              )}
            </div>

            {auth.state !== "signed_in" && (
              <Text size="body-sm" tone="muted" as="p">
                You will be asked to sign a SEP-40 message with Freighter before the transaction is
                submitted.
              </Text>
            )}
          </form>
        </Card>
      )}

      <Card elevation={1} style={{ marginTop: 16 }}>
        <Heading as="h4">Tips</Heading>
        <Text size="body-sm" tone="muted" as="p" style={{ marginTop: 8 }}>
          Profile changes update off-chain metadata and the on-chain <code>metadata_hash</code>.
          Verification markers (kyc, organic_certified, etc.) are managed by verifiers, not here.
        </Text>
      </Card>
    </div>
  )
}
