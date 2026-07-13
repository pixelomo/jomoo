import { test, expect } from '@playwright/test'

// These slugs must exist in Sanity — derived from modelCode via the slug field.
const SMART_TOILET_SLUG = 'x40-b'

test.describe('Product Series Pages', () => {
  test('smart toilet series lists products', async ({ page }) => {
    await page.goto('/zh-CN/products/smart-toilet')
    await expect(page.locator('h1')).toBeVisible()
    const productCards = page.locator('a[href*="/smart-toilet/"]')
    const count = await productCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('product cards are clickable and navigate', async ({ page }) => {
    await page.goto('/zh-CN/products/smart-toilet')
    const firstCard = page.locator('a[href*="/smart-toilet/"]').first()
    const href = await firstCard.getAttribute('href')
    await firstCard.click()
    await expect(page).toHaveURL(new RegExp('smart-toilet/.+'))
    expect(href).toBeTruthy()
  })
})

test.describe('Product Detail Pages', () => {
  test('smart toilet detail page renders', async ({ page }) => {
    await page.goto(`/zh-CN/products/smart-toilet/${SMART_TOILET_SLUG}`)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('spec table is present on detail page', async ({ page }) => {
    await page.goto(`/zh-CN/products/smart-toilet/${SMART_TOILET_SLUG}`)
    // Table has spec rows with two columns
    const table = page.locator('table, [role="table"]').first()
    await expect(table).toBeVisible()
  })

  test('image carousel renders at least one image or placeholder', async ({ page }) => {
    await page.goto(`/zh-CN/products/smart-toilet/${SMART_TOILET_SLUG}`)
    const imageArea = page.locator('img, canvas, [class*="carousel"], [class*="Carousel"]').first()
    await expect(imageArea).toBeVisible()
  })

  test('feature video slot is present', async ({ page }) => {
    await page.goto(`/zh-CN/products/smart-toilet/${SMART_TOILET_SLUG}`)
    const videoArea = page.locator('iframe, [class*="video"], [class*="Video"]')
    const count = await videoArea.count()
    if (count === 0) {
      test.skip(true, 'No video content in Sanity for this product yet')
      return
    }
    await expect(videoArea.first()).toBeVisible()
  })

  test('detail page 404s gracefully for unknown slug', async ({ page }) => {
    await page.goto('/zh-CN/products/smart-toilet/this-slug-does-not-exist')
    await expect(page.locator('text=404')).toBeVisible()
  })

  test('EN locale renders detail page', async ({ page }) => {
    await page.goto(`/en/products/smart-toilet/${SMART_TOILET_SLUG}`)
    await expect(page.locator('h1')).toBeVisible()
  })
})
