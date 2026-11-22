import { NavLink } from 'react-router'
import { APPS, ME } from './nav'

/** Mobile navigation: every app is one tap away (the desktop header nav is hidden on phones). */
export default function BottomTabs() {
  return (
    <nav
      aria-label="Apps"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-canvas/95 backdrop-blur-md border-t border-line pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5">
        {[...APPS, ME].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[11px] ${
                isActive ? 'text-accent font-medium' : 'text-sage'
              }`
            }
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
