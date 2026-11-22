import { describe, expect, it } from 'vitest'
import { SAMPLE_SERMON, extractReferences, generateCards, pickQuotes } from './sermon'

describe('extractReferences', () => {
  it('finds references in order, normalizing ranges to an en dash', () => {
    expect(extractReferences(SAMPLE_SERMON.notes)).toEqual([
      'Lamentations 3:22–23',
      'Matthew 11:28',
      'Galatians 6:9',
      'Hebrews 12:1',
    ])
  })

  it('handles numbered books, Psalms, and duplicates', () => {
    expect(extractReferences('See 1 Peter 5:7, Psalms 46:1 and again 1 Peter 5:7.')).toEqual([
      '1 Peter 5:7',
      'Psalm 46:1',
    ])
  })

  it('ignores things that only look like references', () => {
    expect(extractReferences('Meet at 10:30 in Room 3:2 after Mark said hi.')).toEqual([])
  })
})

describe('pickQuotes', () => {
  it('picks up to 3 standalone sentences without Bible references', () => {
    const quotes = pickQuotes(SAMPLE_SERMON.notes)
    expect(quotes).toHaveLength(3)
    for (const q of quotes) {
      expect(extractReferences(q)).toEqual([])
      expect(q).toMatch(/[.!?]$/)
    }
  })
})

describe('generateCards', () => {
  const cards = generateCards(SAMPLE_SERMON)

  it('fills verse text from our KJV list and flags unknown references', () => {
    expect(cards.verses.map((v) => [v.ref, v.found])).toEqual([
      ['Lamentations 3:22–23', true],
      ['Matthew 11:28', true],
      ['Galatians 6:9', true],
      ['Hebrews 12:1', false],
    ])
    expect(cards.verses[1]?.text).toContain('I will give you rest')
  })

  it('writes one caption per platform that mentions the sermon', () => {
    expect(cards.captions.map((c) => c.platform)).toEqual(['Facebook', 'Instagram', 'TikTok'])
    expect(cards.captions[0]?.text).toContain('New Every Morning')
    expect(cards.captions[0]?.text).toContain('#GraceFellowshipCalamba')
  })

  it('attributes quotes to the preacher', () => {
    expect(cards.quotes.every((q) => q.attribution === 'Ptr. Daniel Cruz')).toBe(true)
  })
})
