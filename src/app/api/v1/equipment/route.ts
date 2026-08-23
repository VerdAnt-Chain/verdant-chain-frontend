import type { NextRequest } from "next/server"
import { proxy } from "../_demo/db"
import { demo } from "../_demo/router"

/* Core workflow API ("equipment") — backend-first with demo fallback. */
async function handle(req: NextRequest) {
  const response = await proxy(req, "equipment")
  if (response) return response
  const res = await demo(req, ["equipment"])
  return res ?? Response.json({ error: "not found" }, { status: 404 })
}

export const GET = handle
export const POST = handle
export const PUT = handle
