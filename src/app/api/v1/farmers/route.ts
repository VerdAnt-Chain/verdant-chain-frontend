import { NextRequest, NextResponse } from "next/server"
import { demo } from "../_demo/router"

export async function GET(req: NextRequest) {
  const backendUrl = process.env.VERDANT_BACKEND_URL
  if (backendUrl) {
    const qs = req.nextUrl.search
    const res = await fetch(`${backendUrl}/api/v1/farmers${qs}`)
    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: { "content-type": "application/json" },
    })
  }

  // Dev mock — substring search on name/region/district, includes dynamically registered farmers
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase()
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10) || 1)
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(req.nextUrl.searchParams.get("pageSize") ?? "20", 10) || 20)
  )

  const all = Array.from(getMockStore().values()).map(mockRecordToSearchItem)
  let items = all
  if (q) {
    items = all.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.region && f.region.toLowerCase().includes(q)) ||
        (f.district && f.district.toLowerCase().includes(q))
    )
  }

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const paged = items.slice(start, start + pageSize)

  return NextResponse.json({
    items: paged,
    pagination: { page, pageSize, total, totalPages },
  })
}
