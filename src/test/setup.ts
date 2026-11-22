import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { useThemeStore } from '@/shared/lib/theme'
import { createSeed, useDemo } from '@/shared/store/demo'

// jsdom has no matchMedia. Report "no media query matches" (the 1-column mobile layout).
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

// Every test starts from fresh seed data, light theme, at "/".
beforeEach(() => {
  localStorage.clear()
  useDemo.setState(createSeed())
  useThemeStore.setState({ theme: 'light' })
  window.history.pushState({}, '', '/')
})

afterEach(() => {
  cleanup()
})
