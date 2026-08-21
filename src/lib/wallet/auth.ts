import { signMessage } from "@stellar/freighter-api"
import { getAuthChallenge, getAuthSession, verifyAuth } from "@/lib/api/auth"
import { ApiError, getAuthToken, loadAuthToken, setAuthToken } from "@/lib/api/client"
import type { AuthChallenge, AuthVerifyResponse } from "@/lib/api/types"
import { WalletError, getWalletSnapshot } from "./wallet"

export type AuthStatus =
  | { state: "unknown" }
  | { state: "signed_out" }
  | { state: "signed_in"; address: string; roles: string[]; expiresAt: string }

let authStatus: AuthStatus = { state: "signed_out" }
const authListeners = new Set<() => void>()

const SERVER_AUTH_STATUS: AuthStatus = { state: "signed_out" }

/** Cached server snapshot so useSyncExternalStore doesn't loop on SSR. */
export function getAuthServerSnapshot(): AuthStatus {
  return SERVER_AUTH_STATUS
}

export function getAuthSnapshot(): AuthStatus {
  return authStatus
}

export function subscribeAuth(listener: () => void): () => void {
  authListeners.add(listener)
  return () => {
    authListeners.delete(listener)
  }
}

function setAuthStatus(next: AuthStatus): void {
  authStatus = next
  authListeners.forEach((listener) => listener())
}

/** Restore a persisted session on the client (safe on the server). */
export async function loadAuthSession(): Promise<void> {
  if (typeof window === "undefined") return
  loadAuthToken()
  const token = getAuthToken()
  if (!token) {
    setAuthStatus({ state: "signed_out" })
    return
  }
  setAuthStatus({ state: "unknown" })
  try {
    const session = await getAuthSession(token)
    setAuthStatus({
      state: "signed_in",
      address: session.address,
      roles: session.roles,
      expiresAt: session.expires_at,
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      setAuthToken(null)
    }
    setAuthStatus({ state: "signed_out" })
  }
}

/** Build the SEP-40 signed-payload message text per auth-flow.md v1.0. */
export function buildSep40Message(challenge: AuthChallenge): string {
  return `${challenge.domain} wants you to sign in with your Stellar account:\n${challenge.address}\n\nNonce: ${challenge.nonce}\nIssued At: ${challenge.timestamp}\n`
}

/** Normalize a Freighter signature to a base64 string. */
function toBase64(signedMessage: string | Uint8Array): string {
  if (typeof signedMessage === "string") return signedMessage
  let binary = ""
  for (const byte of signedMessage) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/**
 * Sign in with Freighter via the SEP-40 flow:
 * connect → challenge → sign message → verify → store bearer token.
 */
export async function signInWithFreighter(): Promise<AuthVerifyResponse> {
  const snapshot = getWalletSnapshot()
  if (snapshot.state !== "connected") {
    throw new WalletError("not_connected", "Connect your wallet before signing in")
  }
  const address = snapshot.address

  const challenge = await getAuthChallenge(address)
  const message = buildSep40Message(challenge)

  let signature: string
  try {
    const res = await signMessage(message, { address })
    if (res.error) throw new WalletError("sign_failed", res.error.message)
    if (!res.signedMessage)
      throw new WalletError("sign_failed", "Freighter did not return a signature")
    signature = toBase64(res.signedMessage)
  } catch (error) {
    if (error instanceof WalletError) throw error
    throw new WalletError("sign_failed", "Freighter could not sign the message")
  }

  const session = await verifyAuth({
    address,
    domain: challenge.domain,
    nonce: challenge.nonce,
    timestamp: challenge.timestamp,
    signature,
  })

  setAuthToken(session.token)
  setAuthStatus({
    state: "signed_in",
    address: session.address,
    roles: session.roles,
    expiresAt: session.expires_at,
  })
  return session
}

/** Clear the stored bearer token and session. */
export function signOut(): void {
  setAuthToken(null)
  setAuthStatus({ state: "signed_out" })
}
