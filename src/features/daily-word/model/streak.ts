import { daysAgoKey, daysBetween } from '@/shared/lib/dates'

export interface Streak {
  current: number
  longest: number
  doneToday: boolean
}

/**
 * Streak rules (TikTok/GitHub style):
 * - A day counts if the user read at least one card that day.
 * - The current streak stays alive until the end of today: if today isn't done yet, it
 *   counts back from yesterday. Missing a whole day resets it to 0.
 */
export function computeStreak(days: readonly string[], today: string): Streak {
  const set = new Set(days.filter((d) => d <= today))
  const doneToday = set.has(today)

  let current = 0
  let cursor = doneToday ? today : previousDay(today)
  while (set.has(cursor)) {
    current++
    cursor = previousDay(cursor)
  }

  const sorted = [...set].sort()
  let longest = 0
  let run = 0
  let prev: string | undefined
  for (const day of sorted) {
    run = prev !== undefined && daysBetween(prev, day) === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = day
  }

  return { current, longest, doneToday }
}

const previousDay = (key: string) => {
  const [y = 0, m = 1, d = 1] = key.split('-').map(Number)
  return daysAgoKey(1, new Date(y, m - 1, d, 12))
}

export interface HeatCell {
  key: string
  on: boolean
  future: boolean
}

/** Weeks as columns (Sunday at the top), ending with the week that contains today. */
export function heatmap(days: readonly string[], today: string, weeks = 12): HeatCell[][] {
  const set = new Set(days)
  const [y = 0, m = 1, d = 1] = today.split('-').map(Number)
  const todayDate = new Date(y, m - 1, d, 12)
  const lastSaturday = new Date(todayDate)
  lastSaturday.setDate(todayDate.getDate() + (6 - todayDate.getDay()))

  const columns: HeatCell[][] = []
  for (let w = weeks - 1; w >= 0; w--) {
    const column: HeatCell[] = []
    for (let dow = 0; dow < 7; dow++) {
      const offset = w * 7 + (6 - dow)
      const key = daysAgoKey(offset, lastSaturday)
      column.push({ key, on: set.has(key), future: key > today })
    }
    columns.push(column)
  }
  return columns
}
