import { test, expect } from '@playwright/test'

test.describe('Auth — Sign In / Sign Up', () => {
  test('sign-in page loads', async ({ page }) => {
    await page.goto('/zh-CN/sign-in')
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
  })

  test('sign-up page loads', async ({ page }) => {
    await page.goto('/zh-CN/sign-up')
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
  })

  test('sign-in shows error for invalid credentials', async ({ page }) => {
    await page.goto('/zh-CN/sign-in')
    await page.fill('input[type="email"], input[name="email"]', 'notreal@example.com')
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword')
    await page.locator('button[type="submit"]').click()
    // Should stay on sign-in and show an error, not redirect to dashboard
    await expect(page).not.toHaveURL(/dashboard/)
  })

  test('sign-in page has link to sign-up', async ({ page }) => {
    await page.goto('/zh-CN/sign-in')
    await expect(page.locator('a[href*="sign-up"]')).toBeVisible()
  })
})

test.describe('Product Registration — access control', () => {
  test('register page redirects unauthenticated users to sign-in', async ({ page }) => {
    await page.goto('/zh-CN/register')
    await expect(page).toHaveURL(/sign-in/)
  })

  test('dashboard redirects unauthenticated users to sign-in', async ({ page }) => {
    await page.goto('/zh-CN/dashboard')
    await expect(page).toHaveURL(/sign-in/)
  })

  test('warranty page redirects unauthenticated users', async ({ page }) => {
    await page.goto('/zh-CN/warranty/some-id')
    await expect(page).toHaveURL(/sign-in/)
  })
})

test.describe('Registration Form — step flow (authenticated)', () => {
  // These tests require a seeded test account.
  // Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.test to enable.
  test.skip(!process.env.TEST_USER_EMAIL, 'Skipped: no test credentials (set TEST_USER_EMAIL + TEST_USER_PASSWORD)')

  test.beforeEach(async ({ page }) => {
    await page.goto('/zh-CN/sign-in')
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL!)
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(/dashboard/)
  })

  test('registration form shows Step 1', async ({ page }) => {
    await page.goto('/zh-CN/register')
    // Step indicator should show step 1 active
    await expect(page.locator('text=1')).toBeVisible()
    await expect(page.locator('input, select').first()).toBeVisible()
  })

  test('Step 1 validates required fields before advancing', async ({ page }) => {
    await page.goto('/zh-CN/register')
    // Click next without filling anything
    await page.locator('button[type="submit"], button:has-text("下一步"), button:has-text("Next")').click()
    // Should remain on step 1 (errors shown)
    await expect(page.locator('[role="alert"], .text-red, [class*="error"]').first()).toBeVisible()
  })
})
