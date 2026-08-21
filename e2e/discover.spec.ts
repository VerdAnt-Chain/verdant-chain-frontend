import { test, expect, type Page } from "@playwright/test"

const KEY = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ23456"

const searchResponse = {
  items: [
    {
      address: KEY,
      id: "va_01J_0001",
      name: "Kofi Mensah",
      region: "Ashanti",
      district: "Ejisu",
      verificationCount: 2,
    },
    {
      address: "GCBANANA1234567890BANANA1234567890BANANA1234567890BANANA1",
      id: "va_01J_0002",
      name: "Amara Okafor",
      region: "Central",
      district: "Cape Coast",
      verificationCount: 0,
    },
  ],
  pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
}

const profileResponse = {
  address: KEY,
  id: "va_01J_0001",
  registered: true,
  createdLedger: 1234567,
  updatedLedger: 1234590,
  metadata: {
    hash: "abc123",
    profile: {
      name: "Kofi Mensah",
      region: "Ashanti",
      district: "Ejisu",
      bio: "Organic cocoa and maize farmer.",
    },
  },
  verificationMarkers: [
    { kind: "kyc", issuer: "va_01J_0100", issuedLedger: 1234568 },
    { kind: "organic_certified", issuer: "va_01J_0101", issuedLedger: 1234570 },
  ],
}

async function mockFarmersApi(page: Page) {
  await page.route("**/api/v1/farmers?*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(searchResponse),
    })
  )
  await page.route("**/api/v1/farmers/*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(profileResponse),
    })
  )
}

test.describe("AgriScout discovery journey", () => {
  test.beforeEach(async ({ page }) => {
    await mockFarmersApi(page)
  })

  test("searches farmers and shows results", async ({ page }) => {
    await page.goto("/discover")

    await page.getByLabel("Search farmers").fill("kofi")
    await page.getByRole("button", { name: "Search" }).click()

    await expect(page.getByText("Kofi Mensah")).toBeVisible()
    await expect(page.getByText("Amara Okafor")).toBeVisible()
    await expect(page.getByText("Region: Ashanti")).toBeVisible()
    await expect(page.getByText("Verified (2)")).toBeVisible()
  })

  test("navigates from a result card to the farmer profile", async ({ page }) => {
    await page.goto("/discover")

    await page.getByLabel("Search farmers").fill("kofi")
    await page.getByRole("button", { name: "Search" }).click()

    await page.getByText("Kofi Mensah").click()

    await expect(page).toHaveURL(new RegExp(`/farmers/${KEY}$`))
    await expect(page.getByText("Registered")).toBeVisible()
    await expect(page.getByText("Kofi Mensah")).toBeVisible()
    await expect(page.getByText("Organic cocoa and maize farmer.")).toBeVisible()
  })

  test("shows the empty state before a search", async ({ page }) => {
    await page.goto("/discover")
    await expect(page.getByText("Enter a search term")).toBeVisible()
  })
})
