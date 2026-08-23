const DEFAULT_BASE_URL = ""

export function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL
  // Strip trailing slash to avoid double slashes when concatenating with /api/v1/...
  return base.replace(/\/$/, "")
}
