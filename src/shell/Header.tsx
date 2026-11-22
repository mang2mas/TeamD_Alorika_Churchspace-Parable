import { Moon, Sun } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { useTheme } from '@/shared/lib/theme'
import { APPS, ME } from './nav'
import RoleSwitcher from './RoleSwitcher'

export default function Header() {
  const [theme, toggleTheme] = useTheme()
  return (
    <header className="sticky top-0 z-30 bg-canvas/85 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/forum" className="font-serif text-2xl font-semibold tracking-tight text-fg">
          Parable
        </Link>
        <nav
          aria-label="Apps"
          className="hidden md:flex rounded-full bg-fg/5 border border-line p-0.5"
        >
          {[...APPS, ME].map((a) => (
            <NavLink
              key={a.to}
              to={a.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-1 text-xs transition-colors ${
                  isActive ? 'bg-emerald/20 text-accent font-medium' : 'text-sage hover:text-fg'
                }`
              }
            >
              {a.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <RoleSwitcher />
          <button
            onClick={toggleTheme}
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
