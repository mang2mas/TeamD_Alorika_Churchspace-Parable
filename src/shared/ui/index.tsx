import { useEffect, useId, type ReactNode } from 'react'
import { NavLink } from 'react-router'
import { Lock, X } from 'lucide-react'
import { ROLE_LABEL, USERS, type Role } from '@/shared/demo/users'
import { useDemo } from '@/shared/store/demo'
import { btn, card } from './styles'

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-fg">{title}</h1>
        {subtitle && <p className="text-sm text-sage mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export interface SectionLink {
  to: string
  label: string
  /** Shown as a small tag so organizers know which role sees this section. */
  roleTag?: string
  end?: boolean
}

export function SectionTabs({ links }: { links: SectionLink[] }) {
  return (
    <nav aria-label="Sections" className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm border transition-colors ${
                isActive
                  ? 'bg-emerald text-[#071917] border-emerald font-medium'
                  : 'border-line text-fg/70 hover:bg-fg/5'
              }`
            }
          >
            {l.label}
            {l.roleTag && (
              <span className="rounded-full bg-fg/10 px-1.5 py-px text-[10px] uppercase tracking-wide">
                {l.roleTag}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export const Page = ({ children }: { children: ReactNode }) => (
  <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
)

/** Shows the page only to allowed roles; otherwise offers a one-click role switch (demo). */
export function RoleGate({
  allow,
  feature,
  children,
}: {
  allow: Role[]
  feature: string
  children: ReactNode
}) {
  const userId = useDemo((s) => s.userId)
  const setUser = useDemo((s) => s.setUser)
  const role = USERS.find((u) => u.id === userId)?.role
  if (role && allow.includes(role)) return <>{children}</>
  const options = USERS.filter((u) => allow.includes(u.role))
  return (
    <div className={`${card} max-w-lg mx-auto mt-10 p-8 text-center`}>
      <Lock className="mx-auto mb-3 text-sage" />
      <h2 className="font-serif text-2xl font-semibold text-fg">{feature}</h2>
      <p className="text-sm text-sage mt-2">
        This screen is for {allow.map((r) => ROLE_LABEL[r]).join(' or ')}. In the demo you can
        switch roles to see it.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {options.map((u) => (
          <button key={u.id} className={btn.primary} onClick={() => setUser(u.id)}>
            View as {u.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const titleId = useId()
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs overflow-y-auto p-4 grid place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`pop w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} ${card} p-6 sm:p-7`}
      >
        <div className="flex items-center justify-between mb-5 gap-4">
          <h2 id={titleId} className="font-serif text-2xl font-semibold text-fg">
            {title}
          </h2>
          <button onClick={onClose} aria-label="Close" className={btn.ghost}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="text-center py-14 text-sage">
      <p className="font-serif text-xl text-fg">{title}</p>
      {body && <p className="text-sm mt-1">{body}</p>}
    </div>
  )
}

export function Avatar({
  initials,
  color,
  size = 'md',
}: {
  initials: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const s =
    size === 'lg' ? 'h-14 w-14 text-xl' : size === 'sm' ? 'h-6 w-6 text-xs' : 'h-9 w-9 text-sm'
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full ${color} ${s} text-[#071917] font-semibold`}
    >
      {initials}
    </span>
  )
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-line bg-sunk px-4 py-2.5 text-xs text-sage">
      <span className="font-semibold text-fg/80">Demo: </span>
      {children}
    </p>
  )
}
