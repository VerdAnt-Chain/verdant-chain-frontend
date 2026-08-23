import { NextRequest, NextResponse } from "next/server"
import { demo } from "../../_demo/router"
import type { FarmerProfileMetadata } from "@/lib/api/types"

export async function POST(req: NextRequest) {
  const backendUrl = process.env.VERDANT_BACKEND_URL
  if (backendUrl) {
    const body = await req.text()
    const headers: Record<string, string> = { "content-type": "application/json" }
    const auth = req.headers.get("authorization")
    if (auth) headers["authorization"] = auth
    const res = await fetch(`${backendUrl}/api/v1/farmers/register`, {
      method: "POST",
      headers,
      body,
    })
    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: { "content-type": "application/json" },
    })
  }

  // Dev mock — persist so GET /farmers/[address] and overview reflect profile input
  try {
    const body = (await req.json()) as { address?: string; metadata?: FarmerProfileMetadata }
    if (!body.address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 })
    }
    if (!body.metadata?.name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }
    const auth = req.headers.get("authorization")
    if (!auth) {
      return NextResponse.json({ error: "authorization required" }, { status: 401 })
    }
    const store = getMockStore()
    if (store.has(body.address)) {
      return NextResponse.json({ error: "already registered" }, { status: 409 })
    }
    const record = {
      address: body.address,
      id: `va:farmer:${body.address}`,
      registered: true,
      createdLedger: 1234600,
      updatedLedger: 1234600,
      metadata: {
        hash: "mockhash",
        profile: {
          name: body.metadata.name.trim(),
          region: body.metadata.region?.trim() || undefined,
          district: body.metadata.district?.trim() || undefined,
          bio: body.metadata.bio?.trim() || undefined,
          profileImageHash: body.metadata.profileImageHash?.trim() || undefined,
        },
      },
      verificationMarkers: [],
    }
    store.set(body.address, record as import("@/lib/api/types").FarmerRecord)
    return NextResponse.json(record)
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
}
