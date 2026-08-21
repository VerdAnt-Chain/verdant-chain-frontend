import { test, expect } from "@playwright/test"

test.describe("site navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("renders the shared header with primary navigation", async ({ page }) => {
    const header = page.getByRole("banner")
    await expect(header.getByText("VerdAnt")).toBeVisible()

    for (const label of [
      "AgriScout",
      "Verification",
      "Equipment",
      "Financing",
      "Livestock",
      "Design system",
    ]) {
      await expect(header.getByRole("link", { name: label })).toBeVisible()
    }
  })

  test("home page shows the five feature pillars", async ({ page }) => {
    for (const name of ["AgriScout", "AgroProof", "AgriLease", "FarmFund", "LivestockPass"]) {
      await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible()
    }
  })

  test("navigates from header to AgriScout discovery", async ({ page }) => {
    await page.getByRole("banner").getByRole("link", { name: "AgriScout" }).click()
    await expect(page).toHaveURL(/\/discover$/)
    await expect(page.getByRole("heading", { name: "AgriScout Discovery" })).toBeVisible()
  })

  test("pillar card links to its feature landing", async ({ page }) => {
    await page
      .getByRole("link", { name: /FarmFund/ })
      .first()
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
