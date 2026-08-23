import type { NextRequest } from "next/server"
import { proxy } from "../../_demo/db"
import { demo } from "../../_demo/router"

/* Core workflow API ("equipment", params.id) — backend-first with demo fallback. */
type Ctx = { params: Promise<Record<string, string>> }

async function handle(req: NextRequest, ctx: Ctx) {
  const params = await ctx.params
  const response = await proxy(req, `equipment/${encodeURIComponent(params.id)}`)
  if (response) return response
  const res = await demo(req, ["equipment", params.id])
  return res ?? Response.json({ error: "not found" }, { status: 404 })
}

export const GET = handle
export const POST = handle
export const PUT = handle
