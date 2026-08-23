import { NextRequest, NextResponse } from "next/server"
import { demo } from "../../_demo/router"
export async function POST(req: NextRequest) {
  const backendUrl = process.env.VERDANT_BACKEND_URL
  if (backendUrl) {
    const body = await req.text()
    const res = await fetch(`${backendUrl}/api/v1/auth/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    })
    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: { "content-type": "application/json" },
    })
  }

  // Dev mock — accepts any signature and returns a fake session token
  try {
    const body = (await req.json()) as {
      address?: string
      domain?: string
      nonce?: string
      timestamp?: string
      signature?: string
    }
    if (!body.address || !body.signature) {
      return NextResponse.json({ error: "address and signature are required" }, { status: 400 })
    }
    return NextResponse.json({
      token: `mock-token-${body.address.slice(0, 8)}-${Date.now()}`,
      address: body.address,
      roles: ["farmer"],
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
}
