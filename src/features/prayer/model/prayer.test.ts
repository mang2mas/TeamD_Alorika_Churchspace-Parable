import { describe, expect, it } from 'vitest'
import {
  activeCount,
  checkIn,
  markAnswered,
  needsCheckIn,
  promote,
  submitRequest,
  waitlistPosition,
  type PrayerGroup,
  type PrayerRequest,
} from './prayer'

const DAY = 24 * 60 * 60 * 1000
const t0 = new Date('2026-11-01T08:00:00Z').getTime()
const groups: PrayerGroup[] = [
  { id: 'g', name: 'Youth', church: 'Grace', cap: 2, leaderIds: ['l'] },
]

function fill(n: number) {
  let requests: PrayerRequest[] = []
  for (let i = 0; i < n; i++) {
    requests = submitRequest(
      requests,
      groups,
      {
        groupId: 'g',
        requesterId: `u${i}`,
        name: `U${i}`,
        anonymous: false,
        text: `need ${i}`,
        visibility: 'group',
      },
      `r${i}`,
      t0 + i * 1000,
    ).requests
  }
  return requests
}

describe('prayer cap and waitlist', () => {
  it('accepts requests while the group is under its cap', () => {
    const requests = fill(2)
    expect(requests.map((r) => r.status)).toEqual(['active', 'active'])
  })

  it('waitlists requests past the cap, first come first served', () => {
    const requests = fill(4)
    expect(requests.map((r) => r.status)).toEqual(['active', 'active', 'waitlisted', 'waitlisted'])
    expect(waitlistPosition(requests, 'r2')).toBe(1)
    expect(waitlistPosition(requests, 'r3')).toBe(2)
    expect(waitlistPosition(requests, 'r0')).toBeUndefined()
  })

  it('marking one answered promotes the oldest waitlisted request', () => {
    const after = markAnswered(fill(4), groups, 'r0', 'Leader', 'Answered!', t0 + DAY)
    expect(after.find((r) => r.id === 'r0')?.status).toBe('answered')
    expect(after.find((r) => r.id === 'r2')?.status).toBe('active')
    expect(after.find((r) => r.id === 'r3')?.status).toBe('waitlisted')
    expect(waitlistPosition(after, 'r3')).toBe(1)
    expect(activeCount(after, 'g')).toBe(2)
  })

  it('raising the cap promotes waiting requests up to the new cap', () => {
    const bigger = [{ ...groups[0]!, cap: 3 }]
    const after = promote(fill(4), bigger, 'g', t0 + DAY)
    expect(after.map((r) => r.status)).toEqual(['active', 'active', 'active', 'waitlisted'])
  })

  it('shows "Anonymous" when the requester asks for it', () => {
    const { request } = submitRequest(
      [],
      groups,
      {
        groupId: 'g',
        requesterId: 'u',
        name: 'Jessa',
        anonymous: true,
        text: 'x',
        visibility: 'leaders',
      },
      'r',
      t0,
    )
    expect(request.displayName).toBe('Anonymous')
  })
})

describe('check-in reminders', () => {
  it('flags active requests with no update for 3+ days', () => {
    const [r] = fill(1)
    expect(needsCheckIn(r!, t0 + 2.9 * DAY)).toBe(false)
    expect(needsCheckIn(r!, t0 + 3 * DAY)).toBe(true)
  })

  it('a check-in resets the timer and is logged', () => {
    const after = checkIn(fill(1), 'r0', 'Leader', 'Called her today', t0 + 4 * DAY)
    expect(needsCheckIn(after[0]!, t0 + 5 * DAY)).toBe(false)
    expect(after[0]?.updates.at(-1)).toMatchObject({ kind: 'checkin', text: 'Called her today' })
  })

  it('never flags waitlisted or answered requests', () => {
    const requests = fill(3)
    expect(needsCheckIn(requests[2]!, t0 + 10 * DAY)).toBe(false)
  })
})
