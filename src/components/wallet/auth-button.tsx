"use client"

import { useCallback, useState } from "react"
import { useSyncExternalStore } from "react"
import { shortAddress } from "@/lib/api/address"
import { Button } from "@/components/ui"
import {
  connectWallet,
  subscribeWallet,
  getWalletSnapshot,
  getWalletServerSnapshot,
  WalletStatus,
  WalletError,
} from "@/lib/wallet/wallet"
import {
  signInWithFreighter,
  signOut,
  subscribeAuth,
  getAuthSnapshot,
  getAuthServerSnapshot,
  AuthStatus,
} from "@/lib/wallet/auth"
import styles from "./auth-button.module.css"

/**
 * Wallet connect + SEP-40 sign-in control. Renders the appropriate action for
 * the wallet/auth state and exposes the signed-in identity for sign-out.
 */
export function AuthButton() {
  const wallet = useSyncExternalStore<WalletStatus>(
    subscribeWallet,
    getWalletSnapshot,
    getWalletServerSnapshot
  )
  const auth = useSyncExternalStore<AuthStatus>(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot
  )
  const [busy, setBusy] = useState(false)

  const handlePrimary = useCallback(async () => {
    if (busy) return
    setBusy(true)
    try {
      if (wallet.state !== "connected") {
        await connectWallet()
      } else if (auth.state === "signed_out" || auth.state === "unknown") {
        await signInWithFreighter()
      }
    } catch (error) {
      if (error instanceof WalletError) {
        console.error("Wallet authentication failed:", error.message)
      }
    } finally {
      setBusy(false)
    }
  }, [busy, wallet.state, auth.state])

  if (wallet.state === "unavailable") {
    return (
      <Button variant="text" disabled>
        Freighter not available
      </Button>
    )
  }

  if (auth.state === "signed_in") {
    return (
      <Button
        variant="outlined"
        className={styles.signedIn}
        onClick={() => signOut()}
        title={`Sign out ${auth.address}`}
      >
        <span className={styles.address}>{shortAddress(auth.address)}</span>
        <span className={styles.dot} aria-hidden="true" />
      </Button>
    )
  }

  if (wallet.state !== "connected") {
    return (
      <Button onClick={handlePrimary} loading={busy}>
        Connect Freighter
      </Button>
    )
  }

  return (
    <Button onClick={handlePrimary} loading={busy}>
      Sign in with Freighter
    </Button>
  )
}
