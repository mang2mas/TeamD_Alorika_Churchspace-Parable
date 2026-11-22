import type { FeedItem } from './types'

export const FILTERS = [
  'All',
  'Freedom Wall Q&A',
  'Articles & Reels',
  'Unanswered',
  'Doubt',
  'Prayer',
  'Relationships',
  'Anxiety',
  'Sunday Recap',
] as const
export type Filter = (typeof FILTERS)[number]

export function passesFilter(item: FeedItem, f: Filter): boolean {
  if (f === 'All') return true
  if (f === 'Freedom Wall Q&A') return item.type === 'question'
  if (f === 'Articles & Reels') return item.type === 'media'
  if (f === 'Unanswered') return item.type === 'question' && item.status === 'unanswered'
  return item.topic === f
}
