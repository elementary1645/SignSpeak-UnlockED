import { expect, test } from '@playwright/test'

test('loads the live dashboard and navigates all main routes', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Skill Without Barriers' })).toBeVisible()
  await expect(page.getByText('Backend connected')).toBeVisible()
  const nav = page.getByRole('navigation')
  for (const [label, heading, path] of [
    ['Learn', 'Learn', '/learn'],
    ['Practice', 'Recognition practice', '/recognition'],
    ['Assessment', 'Assessment', '/assessment'],
    ['Credentials', 'Credentials', '/credentials'],
    ['Employment', 'Employment', '/jobs'],
    ['Settings', 'Settings', '/settings'],
    ['Diagnostics', 'Diagnostics', '/diagnostics'],
    ['Overview', 'Skill Without Barriers', '/'],
  ]) {
    await nav.getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
  }
})

test('supports the keyboard skip link on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360)
})

test('reports a lost backend and recovers on retry', async ({ page }) => {
  await page.route('**/api/v1/status', route => route.abort())
  await page.goto('/')
  await expect(page.getByRole('alert')).toHaveText('Backend unavailable')
  await page.unroute('**/api/v1/status')
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByText('Backend connected')).toBeVisible()
})

test('exchanges a live recognition handshake and heartbeat through Vite', async ({ page }) => {
  await page.goto('/recognition')
  await page.getByRole('button', { name: 'Check connection' }).click()
  await expect(page.getByText('Handshake and heartbeat verified. Sign recognition is unavailable.')).toBeVisible()
})
