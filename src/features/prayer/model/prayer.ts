import { DAY, HOUR, isoAgo } from '@/shared/lib/dates'

export interface PrayerGroup {
  id: string
  name: string
  church: string
  /** Max active requests a group's leaders follow up at once. Extra requests wait in line. */
  cap: number
  leaderIds: string[]
}

export interface PrayerUpdate {
  id: string
  at: string
  by: string
  text: string
  kind: 'checkin' | 'update' | 'answered'
}

export type PrayerStatus = 'active' | 'waitlisted' | 'answered'

export interface PrayerRequest {
  id: string
  groupId: string
  requesterId: string
  /** Shown to others; "Anonymous" when the requester chose it. */
  displayName: string
  anonymous: boolean
  text: string
  visibility: 'leaders' | 'group'
  status: PrayerStatus
  createdAt: string
  /** When it entered the current status (used for waitlist order). */
  statusAt: string
  lastUpdateAt: string
  updates: PrayerUpdate[]
  prayedBy: string[]
}

export const CHECK_IN_AFTER_DAYS = 3

export interface NewPrayerRequest {
  groupId: string
  requesterId: string
  name: string
  anonymous: boolean
  text: string
  visibility: 'leaders' | 'group'
}

const byStatusTime = (a: PrayerRequest, b: PrayerRequest) => a.statusAt.localeCompare(b.statusAt)

export const activeCount = (requests: PrayerRequest[], groupId: string) =>
  requests.filter((r) => r.groupId === groupId && r.status === 'active').length

export function waitlist(requests: PrayerRequest[], groupId: string): PrayerRequest[] {
  return requests
    .filter((r) => r.groupId === groupId && r.status === 'waitlisted')
    .sort(byStatusTime)
}

/** 1-based position in the group's waitlist, or undefined if not waitlisted. */
export function waitlistPosition(requests: PrayerRequest[], id: string): number | undefined {
  const req = requests.find((r) => r.id === id)
  if (!req || req.status !== 'waitlisted') return undefined
  return waitlist(requests, req.groupId).findIndex((r) => r.id === id) + 1
}

/** Adds a request: active if the group is under its cap, otherwise waitlisted. */
export function submitRequest(
  requests: PrayerRequest[],
  groups: PrayerGroup[],
  input: NewPrayerRequest,
  id: string,
  now = Date.now(),
): { requests: PrayerRequest[]; request: PrayerRequest } {
  const group = groups.find((g) => g.id === input.groupId)
  if (!group) throw new Error(`Unknown prayer group ${input.groupId}`)
  const at = new Date(now).toISOString()
  const request: PrayerRequest = {
    id,
    groupId: input.groupId,
    requesterId: input.requesterId,
    displayName: input.anonymous ? 'Anonymous' : input.name.trim() || 'Anonymous',
    anonymous: input.anonymous,
    text: input.text.trim(),
    visibility: input.visibility,
    status: activeCount(requests, group.id) < group.cap ? 'active' : 'waitlisted',
    createdAt: at,
    statusAt: at,
    lastUpdateAt: at,
    updates: [],
    prayedBy: [],
  }
  return { requests: [...requests, request], request }
}

/** Promotes waitlisted requests (oldest first) while the group is under its cap. */
export function promote(
  requests: PrayerRequest[],
  groups: PrayerGroup[],
  groupId: string,
  now = Date.now(),
): PrayerRequest[] {
  const group = groups.find((g) => g.id === groupId)
  if (!group) return requests
  const free = group.cap - activeCount(requests, groupId)
  if (free <= 0) return requests
  const at = new Date(now).toISOString()
  const promoted = new Set(
    waitlist(requests, groupId)
      .slice(0, free)
      .map((r) => r.id),
  )
  return requests.map((r) =>
    promoted.has(r.id) ? { ...r, status: 'active', statusAt: at, lastUpdateAt: at } : r,
  )
}

export function markAnswered(
  requests: PrayerRequest[],
  groups: PrayerGroup[],
  id: string,
  by: string,
  note: string,
  now = Date.now(),
): PrayerRequest[] {
  const req = requests.find((r) => r.id === id)
  if (!req || req.status === 'answered') return requests
  const at = new Date(now).toISOString()
  const updated = requests.map((r) =>
    r.id === id
      ? {
          ...r,
          status: 'answered' as const,
          statusAt: at,
          lastUpdateAt: at,
          updates: [...r.updates, { id: `u${now}`, at, by, text: note, kind: 'answered' as const }],
        }
      : r,
  )
  return promote(updated, groups, req.groupId, now)
}

export function checkIn(
  requests: PrayerRequest[],
  id: string,
  by: string,
  text: string,
  now = Date.now(),
): PrayerRequest[] {
  const at = new Date(now).toISOString()
  return requests.map((r) =>
    r.id === id
      ? {
          ...r,
          lastUpdateAt: at,
          updates: [...r.updates, { id: `u${now}`, at, by, text, kind: 'checkin' as const }],
        }
      : r,
  )
}

export function needsCheckIn(r: PrayerRequest, now = Date.now()): boolean {
  return (
    r.status === 'active' && now - new Date(r.lastUpdateAt).getTime() >= CHECK_IN_AFTER_DAYS * DAY
  )
}

export const daysWithoutUpdate = (r: PrayerRequest, now = Date.now()) =>
  Math.floor((now - new Date(r.lastUpdateAt).getTime()) / DAY)

export function createPrayer(now = Date.now()) {
  const groups: PrayerGroup[] = [
    {
      id: 'g-youth',
      name: 'Calamba Youth',
      church: 'Grace Fellowship Calamba',
      cap: 5,
      leaderIds: ['u-rina'],
    },
    {
      id: 'g-pros',
      name: 'Young Professionals',
      church: 'Grace Fellowship Calamba',
      cap: 4,
      leaderIds: ['u-rina'],
    },
  ]

  const req = (
    id: string,
    groupId: string,
    displayName: string,
    text: string,
    status: PrayerStatus,
    ageMs: number,
    lastUpdateMs: number,
    extra: Partial<PrayerRequest> = {},
  ): PrayerRequest => ({
    id,
    groupId,
    requesterId: `p-${id}`,
    displayName,
    anonymous: displayName === 'Anonymous',
    text,
    visibility: 'group',
    status,
    createdAt: isoAgo(ageMs, now),
    statusAt: isoAgo(ageMs, now),
    lastUpdateAt: isoAgo(lastUpdateMs, now),
    updates: [],
    prayedBy: [],
    ...extra,
  })

  const requests: PrayerRequest[] = [
    req(
      'pr1',
      'g-youth',
      'Carlo',
      'For my Lola, who is in the hospital in San Pablo. Pray for healing and for my mom who is taking care of her.',
      'active',
      6 * DAY,
      5 * DAY,
      { prayedBy: ['u-jessa', 'p-bea'] },
    ),
    req(
      'pr2',
      'g-youth',
      'Anonymous',
      'Please pray for my board exam next month. I am really scared I will fail again.',
      'active',
      4 * DAY,
      4 * DAY,
      { visibility: 'leaders' },
    ),
    req(
      'pr3',
      'g-youth',
      'Bea',
      'For my family. My parents are fighting a lot and I do not know what to do.',
      'active',
      2 * DAY,
      1 * DAY,
      {
        updates: [
          {
            id: 'u-pr3',
            at: isoAgo(1 * DAY, now),
            by: 'Ate Rina',
            text: 'Talked with Bea after service. Praying with her this week.',
            kind: 'checkin',
          },
        ],
      },
    ),
    req(
      'pr4',
      'g-youth',
      'Jessa',
      'Pray that I can invite my barkada to Youth Night without being awkward.',
      'active',
      1 * DAY,
      1 * DAY,
      { requesterId: 'u-jessa', prayedBy: ['u-rina'] },
    ),
    req(
      'pr5',
      'g-youth',
      'Mark',
      'Job interview on Thursday at a BPO in Santa Rosa.',
      'active',
      30 * HOUR,
      30 * HOUR,
    ),
    req(
      'pr6',
      'g-youth',
      'Lyka',
      'For wisdom choosing my college course.',
      'waitlisted',
      20 * HOUR,
      20 * HOUR,
    ),
    req(
      'pr7',
      'g-youth',
      'Anonymous',
      'For strength to stop a bad habit I keep going back to.',
      'waitlisted',
      8 * HOUR,
      8 * HOUR,
      { visibility: 'leaders' },
    ),
    req(
      'pr8',
      'g-pros',
      'Joshua',
      'For our small business. Sales have been slow since the rainy season.',
      'active',
      3 * DAY,
      3 * DAY,
    ),
    req('pr9', 'g-youth', 'Joshua', 'For my scholarship renewal.', 'answered', 14 * DAY, 2 * DAY, {
      updates: [
        {
          id: 'u-pr9',
          at: isoAgo(2 * DAY, now),
          by: 'Ate Rina',
          text: 'Scholarship renewed! Thank you, Lord.',
          kind: 'answered',
        },
      ],
    }),
  ]

  return { groups, requests }
}
