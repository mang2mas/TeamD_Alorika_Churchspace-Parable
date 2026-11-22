import type { Media, MediaKind } from './types'

export const KIND: Record<MediaKind, string> = {
  article: 'Article',
  reel: 'Reel',
  podcast: 'Podcast',
}
export const badge = (m: Media) => `${KIND[m.kind]} • ${m.meta}`
