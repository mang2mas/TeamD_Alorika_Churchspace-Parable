import { ChevronDown } from 'lucide-react'
import { ROLE_LABEL, USERS } from '@/shared/demo/users'
import { Avatar } from '@/shared/ui'
import { useCurrentUser, useDemo } from '@/shared/store/demo'

/** "View as" switcher: lets organizers see every role's view in one browser. */
export default function RoleSwitcher() {
  const user = useCurrentUser()
  const setUser = useDemo((s) => s.setUser)
  return (
    <label className="relative flex items-center gap-2 rounded-full bg-fg/5 border border-line pl-1 pr-2 py-1 hover:bg-fg/10 cursor-pointer">
      <Avatar initials={user.initials} color={user.color} size="sm" />
      <span className="hidden lg:flex flex-col leading-tight">
        <span className="text-sm text-fg/90">{user.name}</span>
        <span className="text-[10px] uppercase tracking-wide text-sage">
          {ROLE_LABEL[user.role]}
        </span>
      </span>
      <ChevronDown size={14} className="text-sage" />
      <span className="sr-only">View as</span>
      <select
        value={user.id}
        onChange={(e) => setUser(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      >
        {USERS.map((u) => (
          <option key={u.id} value={u.id}>
            View as {u.name} ({ROLE_LABEL[u.role]})
          </option>
        ))}
      </select>
    </label>
  )
}
