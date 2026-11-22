import { describe, expect, it } from 'vitest'
import { createOutreach, decideClaim, filterChurches, type ChurchFilter } from './outreach'

const { churches, claims } = createOutreach()
const any: ChurchFilter = { town: 'All', share: 'Any', openTo: 'Any', query: '' }
const names = (f: Partial<ChurchFilter>) =>
  filterChurches(churches, { ...any, ...f }).map((c) => c.id)

describe('filterChurches', () => {
  it('returns every church with no filters', () => {
    expect(names({})).toHaveLength(churches.length)
  })

  it('combines town, can-share and open-to filters', () => {
    expect(names({ town: 'Calamba' })).toEqual(['ch-grace', 'ch-calamba2'])
    expect(names({ town: 'Calamba', share: 'Medical team' })).toEqual(['ch-calamba2'])
    expect(names({ openTo: 'Medical mission', share: 'Medical team' })).toEqual([
      'ch-bethel',
      'ch-calamba2',
    ])
  })

  it('searches by name, case-insensitively', () => {
    expect(names({ query: 'bethel' })).toEqual(['ch-bethel'])
  })
})

describe('decideClaim', () => {
  it('approving verifies the church', () => {
    const r = decideClaim(churches, claims, 'cl1', true)
    expect(r.claims.find((c) => c.id === 'cl1')?.status).toBe('approved')
    expect(r.churches.find((c) => c.id === 'ch-stacruz')?.status).toBe('verified')
  })

  it('rejecting puts the listing back to unclaimed', () => {
    const r = decideClaim(churches, claims, 'cl1', false)
    expect(r.churches.find((c) => c.id === 'ch-stacruz')?.status).toBe('unclaimed')
  })

  it('ignores claims that were already decided', () => {
    const once = decideClaim(churches, claims, 'cl1', true)
    const twice = decideClaim(once.churches, once.claims, 'cl1', false)
    expect(twice.churches.find((c) => c.id === 'ch-stacruz')?.status).toBe('verified')
  })
})
