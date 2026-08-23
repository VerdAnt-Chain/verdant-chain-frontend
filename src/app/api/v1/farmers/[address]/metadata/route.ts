import { NextRequest, NextResponse } from "next/server"
import { demo } from "../../../_demo/router"
import type { FarmerProfileMetadata } from "@/lib/api/types"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params
  const backendUrl = process.env.VERDANT_BACKEND_URL
  if (backendUrl) {
    const body = await req.text()
    const headers: Record<string, string> = { "content-type": "application/json" }
    const auth = req.headers.get("authorization")
    if (auth) headers["authorization"] = auth
    const res = await fetch(
      `${backendUrl}/api/v1/farmers/${encodeURIComponent(address)}/metadata`,
      {
        method: "PUT",
        headers,
        body,
      }
    )
    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: { "content-type": "application/json" },
    })
  }

  // Dev mock — persist update so overview reflects profile input
  try {
    const body = (await req.json()) as { metadata?: FarmerProfileMetadata }
    if (!body.metadata?.name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }
    const auth = req.headers.get("authorization")
    if (!auth) return NextResponse.json({ error: "authorization required" }, { status: 401 })
    const store = getMockStore()
    const existing = store.get(address)
    if (!existing) return NextResponse.json({ error: "farmer not found" }, { status: 404 })
    const updated = {
      ...existing,
      updatedLedger: 1234601,
      metadata: {
        hash: "mockhash2",
        profile: {
          name: body.metadata.name.trim(),
          region: body.metadata.region?.trim() || undefined,
          district: body.metadata.district?.trim() || undefined,
          bio: body.metadata.bio?.trim() || undefined,
          profileImageHash: body.metadata.profileImageHash?.trim() || undefined,
        },
      },
    }
    store.set(address, updated)
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
}
