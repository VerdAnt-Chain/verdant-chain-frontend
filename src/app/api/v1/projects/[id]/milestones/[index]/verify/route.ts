import type { NextRequest } from "next/server"
import { demo } from "../../../../../_demo/router"

/* Core workflow API ("projects", params.id, "milestones", params.index, "verify") — backend-first with demo fallback. */
type Ctx = { params: Promise<Record<string, string>> }

async function handle(req: NextRequest, ctx: Ctx) {
  const params = await ctx.params
  const res = await demo(req, ["projects", params.id, "milestones", params.index, "verify"])
  return res ?? Response.json({ error: "not found" }, { status: 404 })
}

export const GET = handle
export const POST = handle
export const PUT = handle
