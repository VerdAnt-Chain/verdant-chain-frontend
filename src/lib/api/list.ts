import type { PaginationMeta } from "./types"

export interface ListResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

/**
 * Normalize a list-endpoint payload into { items, pagination }.
 *
 * The API contracts are inconsistent across domains: some list endpoints
 * return a paginated envelope ({ items, pagination }), others describe a bare
 * array. Accept either so UI components have one stable shape; when the
 * envelope pagination is missing, synthesize it from the request params.
 */
export function toListResponse<T>(
  data: unknown,
  params: { page?: number; pageSize?: number }
): ListResponse<T> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.max(1, params.pageSize ?? 20)

  if (Array.isArray(data)) {
    const total = data.length
    return {
      items: data as T[],
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    }
  }

  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    const items = (data as { items: T[] }).items
    const pagination = (data as { pagination?: PaginationMeta }).pagination ?? {
      page,
      pageSize,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    }
    return { items, pagination }
  }

  return {
    items: [],
    pagination: { page, pageSize, total: 0, totalPages: 1 },
  }
}

/** Build `path?key=value&…` skipping undefined/empty-string values. */
export function buildQueryPath(
  path: string,
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    sp.set(key, String(value))
  }
  const qs = sp.toString()
  return qs ? `${path}?${qs}` : path
}
