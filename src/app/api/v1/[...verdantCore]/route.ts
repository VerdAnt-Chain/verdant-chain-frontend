import { NextRequest, NextResponse } from "next/server"
import { demo } from "../_demo/router"
import { demo } from "../../_demo/router"

/**
 * Catch-all for the four new cores: proofs | equipment | leases | projects | livestock.
 * Real backend first (VERDANT_BACKEND_URL); upstream 404 falls back to the
 * in-memory demo store so these surfaces stay usable pre-Phase-1-completion.
 * Set VERDANT_DISABLE_MOCK_FALLBACK=1 to force pure proxy behaviour.
 */
type Ctx = { params: Promise<{ verdantCore: string[] }> }

const DOMAINS = ["proofs", "equipment", "leases", "projects", "livestock"]

export async function GET(req: NextRequest, ctx: Ctx) {
  return handle(req, ctx)
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return handle(req, ctx)
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return handle(req, ctx)
}

async function handle(req: NextRequest, ctx: Ctx): Promise<Response> {
  const segments = (await ctx.params).verdantCore ?? []
  if (!DOMAINS.includes(segments[0] ?? "")) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }
  const proxied = await proxy(req, segments.join("/"))
  if (proxied) return proxied
  const result = await demo(req, segments)
  return result ?? NextResponse.json({ error: "not found" }, { status: 404 })
}
