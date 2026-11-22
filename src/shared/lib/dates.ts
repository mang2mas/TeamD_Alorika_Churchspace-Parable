// Date helpers for the demo. Calendar days use the device's local date (Laguna users are on
// Asia/Manila), stored as 'YYYY-MM-DD' strings so they compare and sort as plain text.

export const HOUR = 60 * 60 * 1000
export const DAY = 24 * HOUR

export const isoAgo = (ms: number, now = Date.now()) => new Date(now - ms).toISOString()

export function dayKey(date: Date | number | string = Date.now()): string {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** The day key `n` days before `from` (n = 0 is the same day). */
export function daysAgoKey(n: number, from: Date | number = Date.now()): string {
  const d = new Date(from)
  d.setHours(12, 0, 0, 0) // midday avoids DST edge cases
  d.setDate(d.getDate() - n)
  return dayKey(d)
}

/** Whole calendar days between two day keys (b - a). */
export function daysBetween(a: string, b: string): number {
  const toUtc = (k: string) => {
    const [y = 0, m = 1, d = 1] = k.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUtc(b) - toUtc(a)) / DAY)
}

export function timeAgo(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime())
  if (diff < 60_000) return 'Just now'
  if (diff < HOUR) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`
  const days = Math.floor(diff / DAY)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

export const hoursSince = (iso: string, now = Date.now()) => (now - new Date(iso).getTime()) / HOUR

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })
