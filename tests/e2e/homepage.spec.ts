import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh-CN')
  })

  test('hero section is visible', async ({ page }) => {
    const hero = page.locator('.jm-hero, [class*="hero"], canvas').first()
    await expect(hero).toBeVisible()
  })

  test('product series grid links are present', async ({ page }) => {
    const seriesLinks = page.locator('a[href*="/products/"]')
    await expect(seriesLinks.first()).toBeVisible()
    const count = await seriesLinks.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/)
  })

  test('has no broken images (all load or have alt text)', async ({ page }) => {
    const images = page.locator('img')
    const count = await images.count()
    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      // Either has alt text (accessible) or is loaded
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      expect(naturalWidth > 0 || alt !== null, `Image at index ${i} has no alt and failed to load`).toBe(true)
    }
  })

  test('homepage is bilingual — EN version loads', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('text=JOMOO').first()).toBeVisible()
  })

  test('mobile: hamburger menu opens', async ({ page, isMobile }) => {
    // jm-hamburger is in the (site) layout header, not the X40 homepage nav
    if (!isMobile) test.skip()
    await page.goto('/zh-CN/products/smart-toilet')
    await page.locator('button.jm-hamburger').click()
    await expect(page.locator('button.jm-hamburger[aria-expanded="true"]')).toBeVisible()
  })
})
