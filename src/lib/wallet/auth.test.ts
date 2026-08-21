import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { buildSep40Message } from "./auth"
import { WalletError } from "./wallet"

const KEY = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ23456"

const mocks = vi.hoisted(() => ({
  mockIsConnected: vi.fn(),
  mockGetAddress: vi.fn(),
  mockRequestAccess: vi.fn(),
  mockSignMessage: vi.fn(),
}))

vi.mock("@stellar/freighter-api", () => ({
  isConnected: mocks.mockIsConnected,
  getAddress: mocks.mockGetAddress,
  requestAccess: mocks.mockRequestAccess,
  signMessage: mocks.mockSignMessage,
  WatchWalletChanges: vi.fn(),
}))

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return { ...actual, setAuthToken: vi.fn() }
})

let authModule: typeof import("./auth")
let walletModule: typeof import("./wallet")
let clientModule: typeof import("@/lib/api/client")

async function importModules() {
  return {
    auth: await import("./auth"),
    wallet: await import("./wallet"),
    client: await import("@/lib/api/client"),
  }
}

const challenge = {
  domain: "app.verdant.example",
  nonce: "abc123",
  timestamp: "2026-08-18T00:00:00Z",
  address: KEY,
}

function mockFetchJson(responses: unknown[], status = 200): void {
  const queue = [...responses]
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(() => {
      const body = queue.shift() ?? {}
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status,
          headers: { "content-type": "application/json" },
        })
      )
    })
  )
}

beforeEach(async () => {
  vi.restoreAllMocks()
  mocks.mockIsConnected.mockReset()
  mocks.mockGetAddress.mockReset()
  mocks.mockRequestAccess.mockReset()
  mocks.mockSignMessage.mockReset()
  vi.stubGlobal("window", {
    freighter: {},
    localStorage: { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() },
  })
  const mods = await importModules()
  authModule = mods.auth
  walletModule = mods.wallet
  clientModule = mods.client
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("buildSep40Message", () => {
  it("builds the SEP-40 signed-payload message text", () => {
    const msg = buildSep40Message(challenge)
    expect(msg).toBe(
      "app.verdant.example wants you to sign in with your Stellar account:\nGABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ23456\n\nNonce: abc123\nIssued At: 2026-08-18T00:00:00Z\n"
    )
  })
})

describe("signInWithFreighter", () => {
  it("throws WalletError when wallet is not connected", async () => {
    await expect(authModule.signInWithFreighter()).rejects.toThrow(WalletError)
  })

  it("completes the SEP-40 flow and stores the bearer token", async () => {
    mocks.mockIsConnected.mockResolvedValue({ isConnected: true })
    mocks.mockGetAddress.mockResolvedValue({ address: KEY })
    mocks.mockRequestAccess.mockResolvedValue({ address: KEY })
    await walletModule.connectWallet()

    mocks.mockSignMessage.mockResolvedValue({
      signedMessage: "c2lnbmF0dXJl",
      signerAddress: KEY,
    })
    const session = {
      token: "token-123",
      address: KEY,
      roles: ["farmer"],
      expires_at: "2026-08-25T00:00:00Z",
    }
    mockFetchJson([
      {
        domain: challenge.domain,
        nonce: challenge.nonce,
        timestamp: challenge.timestamp,
        address: KEY,
      },
      session,
    ])

    const result = await authModule.signInWithFreighter()
    expect(result.token).toBe("token-123")
    expect(result.roles).toEqual(["farmer"])
    expect(clientModule.setAuthToken).toHaveBeenCalledWith("token-123")
    expect(mocks.mockSignMessage).toHaveBeenCalledWith(expect.any(String), { address: KEY })

    const snapshot = authModule.getAuthSnapshot()
    expect(snapshot.state).toBe("signed_in")
    if (snapshot.state === "signed_in") {
      expect(snapshot.address).toBe(KEY)
      expect(snapshot.roles).toEqual(["farmer"])
      expect(snapshot.expiresAt).toBe("2026-08-25T00:00:00Z")
    }
  })
})

describe("auth session store", () => {
  it("signOut clears the session and token", async () => {
    mocks.mockIsConnected.mockResolvedValue({ isConnected: true })
    mocks.mockGetAddress.mockResolvedValue({ address: KEY })
    mocks.mockRequestAccess.mockResolvedValue({ address: KEY })
    await walletModule.connectWallet()
    mocks.mockSignMessage.mockResolvedValue({ signedMessage: "c2lnbmF0dXJl" })
    mockFetchJson([
      {
        domain: challenge.domain,
        nonce: challenge.nonce,
        timestamp: challenge.timestamp,
        address: KEY,
      },
      { token: "token-123", address: KEY, roles: ["farmer"], expires_at: "2026-08-25T00:00:00Z" },
    ])
    await authModule.signInWithFreighter()

    authModule.signOut()

    expect(authModule.getAuthSnapshot()).toEqual({ state: "signed_out" })
    expect(clientModule.setAuthToken).toHaveBeenLastCalledWith(null)
  })

  it("loadAuthSession hydrates a signed-in session from a stored token", async () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue("token-123")
    mockFetchJson([
      { token: "token-123", address: KEY, roles: ["farmer"], expires_at: "2026-08-25T00:00:00Z" },
    ])

    await authModule.loadAuthSession()

    const snapshot = authModule.getAuthSnapshot()
    expect(snapshot.state).toBe("signed_in")
    if (snapshot.state === "signed_in") {
      expect(snapshot.address).toBe(KEY)
      expect(snapshot.roles).toEqual(["farmer"])
    }
  })

  it("loadAuthSession clears an expired token (401)", async () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue("stale-token")
    mockFetchJson([], 401)

    await authModule.loadAuthSession()

    expect(authModule.getAuthSnapshot()).toEqual({ state: "signed_out" })
    expect(clientModule.setAuthToken).toHaveBeenCalledWith(null)
  })

  it("loadAuthSession without a token stays signed out", async () => {
    await authModule.loadAuthSession()
    expect(authModule.getAuthSnapshot()).toEqual({ state: "signed_out" })
  })
})
