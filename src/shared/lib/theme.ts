import { create } from 'zustand'

export type Theme = 'light' | 'dark'
export const THEME_STORAGE_KEY = 'parable-theme'

// Light by default; dark only if the user explicitly saved it.
export const readTheme = (): Theme => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const apply = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* storage may be blocked */
  }
}

interface ThemeState {
  theme: Theme
  toggle: () => void
}

/** Shared so every theme control (header, settings) stays in sync. */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readTheme(),
  toggle: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark'
    apply(theme)
    set({ theme })
  },
}))

export function useTheme(): [Theme, () => void] {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)
  return [theme, toggle]
}
