import { describe, expect, it } from 'vitest'
import { discipleStatus, type Disciple } from './disciples'

const today = '2026-11-22'
const now = new Date('2026-11-22T12:00:00').getTime()
const base: Disciple = { id: 'p1', name: 'Carlo', joinedOn: '2026-10-01', disciplerId: 'u-rina' }

describe('discipleStatus', () => {
  it('is "quiet" after 3+ days without reading', () => {
    expect(discipleStatus(base, ['2026-11-19'], today, now)).toMatchObject({
      group: 'quiet',
      daysSinceActive: 3,
    })
  })

  it('is "active" when they read within the last 2 days', () => {
    expect(discipleStatus(base, ['2026-11-20'], today, now).group).toBe('active')
  })

  it('is "new" during the first week if not quiet', () => {
    const d = { ...base, joinedOn: '2026-11-18' }
    expect(discipleStatus(d, ['2026-11-21'], today, now).group).toBe('new')
  })

  it('counts from the join date when they never read', () => {
    const d = { ...base, joinedOn: '2026-11-15' }
    expect(discipleStatus(d, [], today, now)).toMatchObject({ group: 'quiet', daysSinceActive: 7 })
  })

  it('knows whether they replied to the latest nudge', () => {
    const nudged = { ...base, lastNudgeAt: '2026-11-20T10:00:00Z' }
    expect(discipleStatus(nudged, [], today, now).replied).toBe(false)
    expect(
      discipleStatus({ ...nudged, repliedAt: '2026-11-21T10:00:00Z' }, [], today, now).replied,
    ).toBe(true)
    expect(
      discipleStatus({ ...nudged, repliedAt: '2026-11-19T10:00:00Z' }, [], today, now).replied,
    ).toBe(false)
  })
})
