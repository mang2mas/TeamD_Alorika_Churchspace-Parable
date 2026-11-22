import { describe, expect, it } from 'vitest'
import { toColumns } from './columns'

describe('toColumns', () => {
  const items = [1, 2, 3, 4, 5]

  it('puts everything in one column when n = 1', () => {
    expect(toColumns(items, 1)).toEqual([[1, 2, 3, 4, 5]])
  })

  it('deals items round-robin so reading order goes left to right', () => {
    expect(toColumns(items, 2)).toEqual([
      [1, 3, 5],
      [2, 4],
    ])
    expect(toColumns(items, 3)).toEqual([[1, 4], [2, 5], [3]])
  })

  it('returns n empty columns for no items', () => {
    expect(toColumns([], 3)).toEqual([[], [], []])
  })
})
