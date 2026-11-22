import { describe, expect, it } from 'vitest'
import { ideasFor } from './ideas'

describe('ideasFor', () => {
  it('is deterministic for a seed (everyone sees the same ideas of the day)', () => {
    expect(ideasFor(20_000)).toEqual(ideasFor(20_000))
  })

  it('gives different ideas for the next batch', () => {
    expect(ideasFor(20_000).map((i) => i.title)).not.toEqual(ideasFor(20_007).map((i) => i.title))
  })

  it('returns the requested count with unique ids and non-empty captions', () => {
    const ideas = ideasFor(3, 5)
    expect(ideas).toHaveLength(5)
    expect(new Set(ideas.map((i) => i.id)).size).toBe(5)
    expect(ideas.every((i) => i.caption.trim().length > 0)).toBe(true)
  })
})
