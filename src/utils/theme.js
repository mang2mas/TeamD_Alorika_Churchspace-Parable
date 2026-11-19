import { useEffect, useState } from 'react'

// Light by default; dark only if the user explicitly saved it.
const read = () => { try { return localStorage.getItem('parable-theme') === 'dark' ? 'dark' : 'light' } catch { return 'light' } }

export function useTheme() {
  const [theme, setTheme] = useState(read)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('parable-theme', theme) } catch { /* storage may be blocked */ }
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}
