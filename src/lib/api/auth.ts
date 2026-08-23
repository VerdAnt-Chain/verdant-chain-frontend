import { api } from "./client"
import type { AuthChallenge, AuthSession, AuthVerifyPayload, AuthVerifyResponse } from "./types"

export async function getAuthChallenge(address: string): Promise<AuthChallenge> {
  return api.post<AuthChallenge>("/api/v1/auth/challenge", { address })
}

export async function verifyAuth(payload: AuthVerifyPayload): Promise<AuthVerifyResponse> {
  return api.post<AuthVerifyResponse>("/api/v1/auth/verify", payload)
}

export async function getAuthSession(token: string): Promise<AuthSession> {
  return api.get<AuthSession>(`/api/v1/auth/session?token=${encodeURIComponent(token)}`)
}
