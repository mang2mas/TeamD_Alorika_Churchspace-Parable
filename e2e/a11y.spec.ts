import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

/*
  Known accessibility debt that existed before Phase 0, pinned by rule AND element so any new
  violation (even of the same rule elsewhere) still fails. Phase 1 fixes these and empties
  this list. Never add an entry here to make new work pass.
*/
const KNOWN_VIOLATIONS_PHASE_1 = [
  // "Post Anonymously" switch in the composer has no accessible name.
  { id: 'button-name', target: '.w-11' },
  // Dark theme: active module chip (emerald on emerald/20) is 4.39:1, needs 4.5:1.
  { id: 'color-contrast', target: '.bg-emerald\\/20' },
]

const isKnown = (id: string, target: string) =>
  KNOWN_VIOLATIONS_PHASE_1.some((k) => k.id === id && k.target === target)

async function newViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  return results.violations.flatMap((v) =>
    v.nodes
      .map((n) => n.target.join(' '))
      .filter((target) => !isKnown(v.id, target))
      .map((target) => `${v.id} (${v.impact ?? 'n/a'}): ${v.help} -> ${target}`),
  )
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('parable-theme', t), theme)
    })

    test('feed has no new accessibility violations', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByRole('article').first()).toBeVisible()
      expect(await newViolations(page)).toEqual([])
    })

    test('reader has no new accessibility violations', async ({ page }) => {
      await page.goto('/')
      await page.getByText('Why does God feel silent when I pray the hardest?').click()
      await expect(page.getByRole('dialog')).toBeVisible()
      expect(await newViolations(page)).toEqual([])
    })

    test('composer has no new accessibility violations', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: /Ask \/ Post/ }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      expect(await newViolations(page)).toEqual([])
    })
  })
}
