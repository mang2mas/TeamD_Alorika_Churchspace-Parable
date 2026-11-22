import { DAY, daysAgoKey, daysBetween, isoAgo } from '@/shared/lib/dates'

export interface Disciple {
  /** Matches a key in the activity map (and a demo user id for Jessa). */
  id: string
  name: string
  joinedOn: string
  disciplerId: string
  lastNudgeAt?: string
  repliedAt?: string
}

export interface Nudge {
  id: string
  discipleId: string
  disciplerId: string
  message: string
  at: string
}

export type DiscipleGroup = 'quiet' | 'new' | 'active'

export const QUIET_AFTER_DAYS = 3

export interface DiscipleStatus {
  group: DiscipleGroup
  /** Days since they last read a card (or since joining, if they never have). */
  daysSinceActive: number
  lastActive?: string
  replied: boolean
  nudgedToday: boolean
}

export function discipleStatus(
  d: Disciple,
  activity: readonly string[],
  today: string,
  now = Date.now(),
): DiscipleStatus {
  const lastActive = [...activity]
    .filter((k) => k <= today)
    .sort()
    .at(-1)
  const daysSinceActive = daysBetween(lastActive ?? d.joinedOn, today)
  const isNew = daysBetween(d.joinedOn, today) <= 7
  const group: DiscipleGroup =
    daysSinceActive >= QUIET_AFTER_DAYS ? 'quiet' : isNew ? 'new' : 'active'
  const replied = Boolean(d.repliedAt && (!d.lastNudgeAt || d.repliedAt >= d.lastNudgeAt))
  const nudgedToday = Boolean(d.lastNudgeAt && now - new Date(d.lastNudgeAt).getTime() < DAY)
  return { group, daysSinceActive, lastActive, replied, nudgedToday }
}

export const nudgeTemplate = (name: string, verseRef: string) =>
  `Hi ${name}! Missed you this week 🙂 Today's verse is ${verseRef}. Want to read it together later? No pressure, just checking in.`

export function createDiscipleship(now = Date.now()) {
  /** Days (relative to now) on which each seeded person read a card. */
  const ranges = (...spans: [number, number][]) =>
    spans.flatMap(([from, to]) =>
      Array.from({ length: from - to + 1 }, (_, i) => daysAgoKey(from - i, now)),
    )

  const disciples: Disciple[] = [
    { id: 'u-jessa', name: 'Jessa', joinedOn: daysAgoKey(60, now), disciplerId: 'u-rina' },
    {
      id: 'p-carlo',
      name: 'Carlo',
      joinedOn: daysAgoKey(35, now),
      disciplerId: 'u-rina',
      lastNudgeAt: isoAgo(2 * DAY, now),
    },
    { id: 'p-bea', name: 'Bea', joinedOn: daysAgoKey(4, now), disciplerId: 'u-rina' },
    {
      id: 'p-mark',
      name: 'Mark',
      joinedOn: daysAgoKey(50, now),
      disciplerId: 'u-rina',
      lastNudgeAt: isoAgo(3 * DAY, now),
      repliedAt: isoAgo(1 * DAY, now),
    },
    { id: 'p-lyka', name: 'Lyka', joinedOn: daysAgoKey(20, now), disciplerId: 'u-rina' },
    { id: 'p-joshua', name: 'Joshua', joinedOn: daysAgoKey(28, now), disciplerId: 'u-rina' },
  ]

  // Jessa: 9-day streak ending yesterday (so "I read it" today makes it 10), plus older history.
  const activity: Record<string, string[]> = {
    'u-jessa': ranges([40, 30], [27, 22], [18, 12], [9, 1]),
    'p-carlo': ranges([20, 5]),
    'p-bea': ranges([3, 1]),
    'p-mark': ranges([30, 9], [1, 1]),
    'p-lyka': ranges([15, 0]),
    'p-joshua': ranges([12, 3]),
    'u-rina': ranges([80, 0]),
    'u-migs': ranges([10, 2]),
    'u-daniel': ranges([5, 0]),
  }

  return { disciples, activity, nudges: [] as Nudge[] }
}
