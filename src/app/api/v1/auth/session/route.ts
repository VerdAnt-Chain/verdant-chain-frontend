import { NextRequest, NextResponse } from "next/server"
export async function GET(req: NextRequest) {
  const backendUrl = process.env.VERDANT_BACKEND_URL
  if (backendUrl) {
    const token = req.nextUrl.searchParams.get("token")
    const url = `${backendUrl}/api/v1/auth/session?token=${encodeURIComponent(token ?? "")}`
    const res = await fetch(url)
    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: { "content-type": "application/json" },
    })
  }

  // Dev mock — valid token returns a fake session, otherwise 401
  const token = req.nextUrl.searchParams.get("token")
  if (!token || !token.startsWith("mock-token-")) {
    return NextResponse.json({ error: "invalid or expired token" }, { status: 401 })
  }
  // Extract address from mock token format: mock-token-<addr8>-<ts>
  // We don't have the full address, so return a generic one; client will use its own address
  return NextResponse.json({
    token,
    address: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    roles: ["farmer"],
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })
}
