import { describe, expect, it } from 'vitest'
import { expandTerms, matches } from './search'
import { initialItems } from './seedData'
import type { FeedItem } from './types'

const byId = (id: string): FeedItem => {
  const item = initialItems.find((i) => i.id === id)
  if (!item) throw new Error(`No seed item ${id}`)
  return item
}

describe('expandTerms', () => {
  it('returns no terms for an empty or blank query', () => {
    expect(expandTerms('')).toEqual([])
    expect(expandTerms('   ')).toEqual([])
  })

  it('expands a word to its whole synonym group', () => {
    expect(expandTerms('finances')).toEqual([
      'finances',
      'finance',
      'money',
      'budget',
      'tuition',
      'allowance',
    ])
  })

  it('trims and lowercases the query', () => {
    expect(expandTerms('  Barkada ')[0]).toBe('barkada')
    expect(expandTerms('  Barkada ')).toContain('lonely')
  })

  it('expands a partial word of 4+ letters', () => {
    expect(expandTerms('anxi')).toEqual(['anxi', 'anxious', 'anxiety', 'worry', 'panic', 'stress'])
  })

  it('does not expand partial words shorter than 4 letters', () => {
    expect(expandTerms('anx')).toEqual(['anx'])
  })
})

describe('matches', () => {
  it('matches every item when the query is empty', () => {
    expect(initialItems.every((i) => matches(i, ''))).toBe(true)
  })

  it('matches through a synonym (money -> tuition in the title)', () => {
    expect(matches(byId('q4'), 'money')).toBe(true)
  })

  it('matches on the AI takeaway verse', () => {
    expect(matches(byId('q1'), 'habakkuk')).toBe(true)
  })

  it('matches media on creator and kind', () => {
    expect(matches(byId('m2'), 'reel')).toBe(true)
    expect(matches(byId('m3'), 'youth table')).toBe(true)
  })

  it('does not match unrelated items', () => {
    expect(matches(byId('q3'), 'tuition')).toBe(false)
  })

  it('finds exactly the two finance items for "finances"', () => {
    expect(initialItems.filter((i) => matches(i, 'finances')).map((i) => i.id)).toEqual([
      'm1',
      'q4',
    ])
  })
})
