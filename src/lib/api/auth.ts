import { api } from "./client"
import type { AuthChallenge, AuthSession, AuthVerifyPayload, AuthVerifyResponse } from "./types"

export async function getAuthChallenge(address: string): Promise<AuthChallenge> {
  return api.post<AuthChallenge>("/auth/challenge", { address })
}

export async function verifyAuth(payload: AuthVerifyPayload): Promise<AuthVerifyResponse> {
  return api.post<AuthVerifyResponse>("/auth/verify", payload)
}

export async function getAuthSession(token: string): Promise<AuthSession> {
  return api.get<AuthSession>(`/auth/session?token=${encodeURIComponent(token)}`)
}
