import { describe, expect, it } from 'vitest'
import { FILTERS, passesFilter, type Filter } from './filters'
import { initialItems } from './seedData'

const ids = (f: Filter) => initialItems.filter((i) => passesFilter(i, f)).map((i) => i.id)

describe('passesFilter', () => {
  it('"All" keeps every item', () => {
    expect(ids('All')).toHaveLength(initialItems.length)
  })

  it('"Freedom Wall Q&A" keeps only questions', () => {
    expect(ids('Freedom Wall Q&A')).toEqual(['q1', 'q2', 'q3', 'q4'])
  })

  it('"Articles & Reels" keeps only media', () => {
    expect(ids('Articles & Reels')).toEqual(['m1', 'm2', 'm3', 'm4'])
  })

  it('"Unanswered" keeps only unanswered questions', () => {
    expect(ids('Unanswered')).toEqual(['q1', 'q3'])
  })

  it('a topic filter keeps questions and media of that topic', () => {
    expect(ids('Anxiety')).toEqual(['m1', 'q4'])
  })

  it('a topic with no items returns nothing', () => {
    expect(ids('Sunday Recap')).toEqual([])
  })

  it('lists the filters in the order the chips show them', () => {
    expect(FILTERS[0]).toBe('All')
    expect(FILTERS).toHaveLength(9)
  })
})
