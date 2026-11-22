import { expect, test } from './fixtures'

test('loads the feed', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Parable/)
  await expect(page.getByRole('article')).toHaveCount(10)
})

test('search narrows the feed using synonyms', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('textbox', { name: 'Search' }).fill('finances')
  await expect(page.getByRole('article')).toHaveCount(2)
})

test('theme choice persists across a reload', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible()
})

test('reader opens from a card and closes with Escape', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Why does God feel silent when I pray the hardest?').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
})
