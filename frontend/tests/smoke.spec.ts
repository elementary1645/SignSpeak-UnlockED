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

test('completes the lesson and scores the quiz after camera permission denial', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: async () => { throw new DOMException('Denied by test', 'NotAllowedError') },
    })
  })
  await page.goto('/')
  await page.getByRole('link', { name: 'Try gesture camera' }).click()
  await page.getByRole('button', { name: 'Start camera' }).click()
  await expect(page.getByRole('alert')).toContainText('Camera permission was denied')
  await page.getByRole('link', { name: 'Open workplace safety lesson' }).click()
  await expect(page.getByRole('heading', { name: 'Personal protective equipment' })).toBeVisible()
  await page.getByRole('button', { name: 'Next section' }).click()
  await expect(page.getByRole('heading', { name: 'Recognizing workplace hazards' })).toBeFocused()
  await page.getByRole('button', { name: 'Next section' }).press('Enter')
  await expect(page.getByRole('heading', { name: 'Emergency reporting' })).toBeVisible()
  await page.getByRole('link', { name: 'Start assessment' }).click()

  await page.getByRole('radio', { name: /ask for a replacement/i }).check()
  await page.getByRole('button', { name: 'Confirm answer' }).click()
  await expect(page.getByText('Correct.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Next question' }).click()
  await page.getByRole('radio', { name: /leave it/i }).check()
  await page.getByRole('button', { name: 'Confirm answer' }).click()
  await expect(page.getByText('Incorrect.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Next question' }).click()
  await page.getByRole('radio', { name: /the exact location/i }).check()
  await page.getByRole('button', { name: 'Confirm answer' }).click()
  await page.getByRole('button', { name: 'View score' }).click()
  await expect(page.getByText('2 out of 3 correct')).toBeVisible()
  await expect(page.getByText(/knowledge check completed/i)).toBeVisible()
})
