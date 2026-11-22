import { describe, expect, it } from 'vitest'
import { computeStreak, heatmap } from './streak'

const today = '2026-11-22'

describe('computeStreak', () => {
  it('is 0 with no reading days', () => {
    expect(computeStreak([], today)).toEqual({ current: 0, longest: 0, doneToday: false })
  })

  it('counts consecutive days ending today', () => {
    expect(computeStreak(['2026-11-20', '2026-11-21', '2026-11-22'], today)).toMatchObject({
      current: 3,
      doneToday: true,
    })
  })

  it('keeps the streak alive until the end of today (counts back from yesterday)', () => {
    expect(computeStreak(['2026-11-20', '2026-11-21'], today)).toMatchObject({
      current: 2,
      doneToday: false,
    })
  })

  it('resets after a whole missed day', () => {
    expect(computeStreak(['2026-11-19', '2026-11-20'], today).current).toBe(0)
  })

  it('tracks the longest run separately, across month boundaries', () => {
    const days = ['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-21']
    expect(computeStreak(days, today)).toMatchObject({ current: 1, longest: 4 })
  })

  it('ignores duplicates and future days', () => {
    expect(computeStreak(['2026-11-22', '2026-11-22', '2026-11-23'], today)).toMatchObject({
      current: 1,
      longest: 1,
    })
  })
})

describe('heatmap', () => {
  it('returns 12 weeks of 7 days, with today in the last column', () => {
    const grid = heatmap(['2026-11-22'], today, 12)
    expect(grid).toHaveLength(12)
    expect(grid.every((w) => w.length === 7)).toBe(true)
    const last = grid.at(-1)!
    expect(last.find((c) => c.key === today)).toMatchObject({ on: true, future: false })
  })

  it('marks days after today as future', () => {
    const last = heatmap([], '2026-11-25', 1)[0]! // a Wednesday
    expect(last.filter((c) => c.future).map((c) => c.key)).toEqual([
      '2026-11-26',
      '2026-11-27',
      '2026-11-28',
    ])
  })
})
