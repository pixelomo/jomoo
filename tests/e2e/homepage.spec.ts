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
    expect(count).toBeGreaterThanOrEqual(4)
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
    await expect(page.locator('text=JOMOO')).toBeVisible()
  })

  test('mobile: hamburger menu opens', async ({ page, isMobile }) => {
    if (!isMobile) test.skip()
    const burger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .jm-mobile-trigger').first()
    await burger.click()
    // mobile menu should appear
    await expect(page.locator('.jm-mobile-menu, [data-mobile-menu]')).toBeVisible()
  })
})
