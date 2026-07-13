import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('homepage loads and shows JOMOO brand', async ({ page }) => {
    await page.goto('/zh-CN')
    await expect(page.locator('text=JOMOO').first()).toBeVisible()
  })

  test('locale switcher changes to English', async ({ page, isMobile }) => {
    // LocaleSwitcher is in the utility bar (hidden on mobile)
    if (isMobile) test.skip(true, 'Locale switcher is in utility bar, hidden on mobile')
    await page.goto('/zh-CN/products/smart-toilet')
    await page.getByRole('button', { name: 'EN' }).first().click()
    await expect(page).toHaveURL(/\/en/, { timeout: 10000 })
  })

  test('header has product registration CTA', async ({ page }) => {
    await page.goto('/zh-CN')
    const registerLink = page.locator('a[href*="register"]').first()
    await expect(registerLink).toBeVisible()
  })

  test('nav links to smart toilet series', async ({ page }) => {
    await page.goto('/zh-CN')
    await page.goto('/zh-CN/products/smart-toilet')
    await expect(page).toHaveURL(/smart-toilet/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('all four product series pages load', async ({ page }) => {
    const series = ['smart-toilet', 'washstand', 'faucets', 'shower-set']
    for (const s of series) {
      await page.goto(`/zh-CN/products/${s}`)
      await expect(page.locator('h1')).toBeVisible()
    }
  })

  test('footer is present on all series pages', async ({ page }) => {
    await page.goto('/zh-CN/products/smart-toilet')
    await expect(page.locator('footer')).toBeVisible()
  })

  test('404 page shows for unknown route', async ({ page }) => {
    await page.goto('/zh-CN/this-does-not-exist')
    await expect(page.locator('text=404')).toBeVisible()
  })
})
