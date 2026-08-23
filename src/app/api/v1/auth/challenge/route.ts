import { NextRequest, NextResponse } from "next/server"
export async function POST(req: NextRequest) {
  const backendUrl = process.env.VERDANT_BACKEND_URL
  if (backendUrl) {
    // Proxy to real backend if configured
    const body = await req.text()
    const res = await fetch(`${backendUrl}/api/v1/auth/challenge`, {
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

  // Dev mock — returns a fake challenge so UI can proceed without backend
  try {
    const { address } = (await req.json()) as { address?: string }
    if (!address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 })
    }
    return NextResponse.json({
      domain: "app.verdant.example",
      nonce: `mock-${Date.now()}`,
      timestamp: new Date().toISOString(),
      address,
    })
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
}
