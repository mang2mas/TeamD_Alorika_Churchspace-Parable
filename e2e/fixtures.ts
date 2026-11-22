import { test as base } from '@playwright/test'

// Cover images are hot-linked from Unsplash in the seed data. Block them so tests don't
// depend on a third-party network; the UI already hides images that fail to load.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**/images.unsplash.com/**', (route) => route.abort())
    await use(page)
  },
})

export { expect } from '@playwright/test'
