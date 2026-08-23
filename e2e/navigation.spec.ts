import { test, expect } from "@playwright/test"

test.describe("site navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("renders the shared header with primary navigation", async ({ page }) => {
    const header = page.getByRole("banner")
    await expect(header.getByText("VerdAnt")).toBeVisible()

    // Nav links are inside the Primary navigation landmark
    await expect(page.getByRole("navigation", { name: "Primary" }))
      .getByRole("link", { name: "Discover" })
      .toBeVisible()

    for (const label of ["Verification", "Equipment", "Financing", "Livestock", "Design system"]) {
      await expect(header.getByRole("link", { name: label })).toBeVisible()
    }
  })

  test("home page shows the five feature pillars", async ({ page }) => {
    const main = page.getByRole("main")
    await expect(main.getByRole("link", { name: /AgriScout/ })).toBeVisible()
    await expect(main.getByRole("link", { name: /AgroProof/ })).toBeVisible()
    await expect(main.getByRole("link", { name: /AgriLease/ })).toBeVisible()
    await expect(main.getByRole("link", { name: /FarmFund/ })).toBeVisible()
    await expect(main.getByRole("link", { name: /LivestockPass/ })).toBeVisible()
  })

  test("navigates from header to discovery", async ({ page }) => {
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Discover" })
      .click()
    await expect(page).toHaveURL(/\/discover$/)
    await expect(page.getByRole("heading", { name: "Discover farmers" })).toBeVisible()
  })

  test("pillar card links to its feature landing", async ({ page }) => {
    await page
      .getByRole("main")
      .getByRole("link", { name: /FarmFund/ })
      .click()
    await expect(page).toHaveURL(/\/financing$/)
  })

  test("theme toggle switches between light and dark", async ({ page }) => {
    const initial = await page.evaluate(() => document.documentElement.dataset.theme)
    await page.getByRole("button", { name: /switch to (light|dark) theme/i }).click()
    const after = await page.evaluate(() => document.documentElement.dataset.theme)
    expect(after).not.toBe(initial)
  })
})
