import { NextRequest, NextResponse } from "next/server"
import { demo } from "../../_demo/router"

export async function GET(req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params
  const backendUrl = process.env.VERDANT_BACKEND_URL
  if (backendUrl) {
    const res = await fetch(`${backendUrl}/api/v1/farmers/${encodeURIComponent(address)}`)
    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: { "content-type": "application/json" },
    })
  }

  // Dev mock — serve from in-memory store so overview reflects profile input
  const rec = getMockStore().get(address)
  if (rec) return NextResponse.json(rec)

  // Unknown farmer — 404 is expected and handled as "Farmer not found" in UI
  return NextResponse.json({ error: "farmer not found" }, { status: 404 })
}

export async function POST() {
  // Farmers register endpoint: /api/v1/farmers/register is handled separately,
  // but also allow POST to /api/v1/farmers/[address]/metadata for updates
  return NextResponse.json({ error: "use /api/v1/farmers/register" }, { status: 404 })
}
