import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { THEME_STORAGE_KEY, readTheme, useTheme } from './theme'

describe('readTheme', () => {
  afterEach(() => vi.restoreAllMocks())

  it('defaults to light', () => {
    expect(readTheme()).toBe('light')
  })

  it('reads a saved dark theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    expect(readTheme()).toBe('dark')
  })

  it('ignores unknown saved values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'purple')
    expect(readTheme()).toBe('light')
  })

  it('falls back to light when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readTheme()).toBe('light')
  })
})

describe('useTheme', () => {
  afterEach(() => vi.restoreAllMocks())

  it('toggles, persists, and updates <html>', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current[0]).toBe('light')
    act(() => result.current[1]())
    expect(result.current[0]).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    act(() => result.current[1]())
    expect(result.current[0]).toBe('light')
  })

  it('keeps every theme control in sync', () => {
    const a = renderHook(() => useTheme())
    const b = renderHook(() => useTheme())
    act(() => a.result.current[1]())
    expect(b.result.current[0]).toBe('dark')
  })

  it('still toggles when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { result } = renderHook(() => useTheme())
    act(() => result.current[1]())
    expect(result.current[0]).toBe('dark')
  })
})
