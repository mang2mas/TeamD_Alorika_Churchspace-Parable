import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { THEME_STORAGE_KEY, useTheme } from './theme'

describe('useTheme', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('defaults to light and applies it to <html>', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current[0]).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('reads a saved dark theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current[0]).toBe('dark')
  })

  it('ignores unknown saved values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'purple')
    const { result } = renderHook(() => useTheme())
    expect(result.current[0]).toBe('light')
  })

  it('toggles, persists, and updates <html>', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current[1]())
    expect(result.current[0]).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    act(() => result.current[1]())
    expect(result.current[0]).toBe('light')
  })

  it('still works when localStorage throws (e.g. blocked storage)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { result } = renderHook(() => useTheme())
    expect(result.current[0]).toBe('light')
    act(() => result.current[1]())
    expect(result.current[0]).toBe('dark')
  })
})
