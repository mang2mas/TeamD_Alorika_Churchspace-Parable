// Demo identities. The "View as" switcher lets organizers see every role in one browser.
export type Role = 'member' | 'leader' | 'media' | 'admin' | 'moderator'

export interface DemoUser {
  id: string
  name: string
  role: Role
  church: string
  initials: string
  /** Tailwind background class for the avatar. */
  color: string
}

export const ROLE_LABEL: Record<Role, string> = {
  member: 'Youth / Member',
  leader: 'Discipler / Leader',
  media: 'Media Volunteer',
  admin: 'Church Admin',
  moderator: 'Moderator',
}

export const HOME_CHURCH = 'Grace Fellowship Calamba'

export const USERS: DemoUser[] = [
  {
    id: 'u-jessa',
    name: 'Jessa',
    role: 'member',
    church: HOME_CHURCH,
    initials: 'J',
    color: 'bg-amber',
  },
  {
    id: 'u-rina',
    name: 'Ate Rina',
    role: 'leader',
    church: HOME_CHURCH,
    initials: 'R',
    color: 'bg-emerald',
  },
  {
    id: 'u-migs',
    name: 'Kuya Migs',
    role: 'media',
    church: HOME_CHURCH,
    initials: 'M',
    color: 'bg-sky-400',
  },
  {
    id: 'u-daniel',
    name: 'Ptr. Daniel',
    role: 'admin',
    church: HOME_CHURCH,
    initials: 'D',
    color: 'bg-rose-300',
  },
  {
    id: 'u-paolo',
    name: 'Paolo (Moderator)',
    role: 'moderator',
    church: 'Parable Team',
    initials: 'P',
    color: 'bg-violet-300',
  },
]

export const userById = (id: string): DemoUser => USERS.find((u) => u.id === id) ?? USERS[0]!

/** What each role is allowed to do in the demo. Mirrors docs/SAFETY_AND_PRIVACY.md §3.2. */
export const can = {
  markAnswered: (r: Role) => r === 'leader' || r === 'admin',
  postTask: (r: Role) => r === 'admin' || r === 'leader',
  confirmTask: (r: Role) => r === 'admin',
  claimTask: (r: Role) => r === 'member' || r === 'media' || r === 'leader',
  discipleDashboard: (r: Role) => r === 'leader',
  sundayCards: (r: Role) => r === 'media' || r === 'admin',
  prayerLeader: (r: Role) => r === 'leader',
  partnerInbox: (r: Role) => r === 'admin',
  requestPartner: (r: Role) => r === 'admin' || r === 'leader',
  moderate: (r: Role) => r === 'moderator',
}
