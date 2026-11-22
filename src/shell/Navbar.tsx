import { Moon, Plus, Search, Sun } from 'lucide-react'
import type { Theme } from '@/shared/lib/theme'
import { MODULES, type Module } from './modules'

interface Props {
  module: Module
  setModule: (m: Module) => void
  search: string
  setSearch: (q: string) => void
  onCompose: () => void
  theme: Theme
  onToggleTheme: () => void
}

export default function Navbar({
  module,
  setModule,
  search,
  setSearch,
  onCompose,
  theme,
  onToggleTheme,
}: Props) {
  return (
    <header className="sticky top-0 z-30 bg-canvas/85 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-3 order-1">
          <span className="font-serif text-2xl font-semibold tracking-tight text-fg">Parable</span>
          <nav className="hidden sm:flex rounded-full bg-fg/5 border border-line p-0.5">
            {MODULES.map((m) => (
              <button
                key={m}
                onClick={() => setModule(m)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${module === m ? 'bg-emerald/20 text-accent font-medium' : 'text-sage hover:text-fg'}`}
              >
                {m}
              </button>
            ))}
          </nav>
        </div>
        <label className="order-3 md:order-2 w-full md:w-auto md:flex-1 md:max-w-md md:mx-auto relative">
          <span className="sr-only">Search</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, verses, reels, or articles..."
            className="w-full rounded-full bg-fg/5 border border-line pl-9 pr-4 py-2 text-sm placeholder:text-sage/60 focus:outline-hidden focus:border-emerald"
          />
        </label>
        <div className="order-2 md:order-3 ml-auto flex items-center gap-3">
          <button
            onClick={onCompose}
            className="flex items-center gap-1.5 rounded-full bg-emerald text-[#071917] text-sm font-semibold px-4 py-2 hover:brightness-110 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-white"
          >
            <Plus size={16} /> Ask / Post
          </button>
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-fg/5 border border-line pl-1 pr-3 py-1">
            <span className="grid place-items-center h-6 w-6 rounded-full bg-amber text-[#071917] text-xs font-semibold">
              K
            </span>
            <span className="text-sm text-fg/80">Kiko Mendoza</span>
          </div>
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid place-items-center h-9 w-9 rounded-full border border-line text-sage hover:text-fg hover:bg-fg/5 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-emerald"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  )
}
