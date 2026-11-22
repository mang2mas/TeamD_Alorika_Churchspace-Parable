import { describe, expect, it } from 'vitest'
import { computeStreak } from '@/features/daily-word/model/streak'
import { dayKey } from '@/shared/lib/dates'
import { createSeed, useDemo } from './demo'
import { useToast } from './toast'

const s = () => useDemo.getState()

describe('demo store flows', () => {
  it('task flow: claim → done → admin confirms → badge toast', () => {
    s().setUser('u-jessa')
    s().markTaskDone('t3') // Jessa's claimed Instagram templates task
    expect(s().tasks.find((t) => t.id === 't3')?.status).toBe('done')
    s().setUser('u-daniel')
    s().confirmTask('t3')
    expect(s().tasks.find((t) => t.id === 't3')?.status).toBe('confirmed')
    expect(useToast.getState().message).toContain('Jessa earned the “Designer” badge')
  })

  it('only the claimer can mark a task done', () => {
    s().setUser('u-migs')
    s().markTaskDone('t3')
    expect(s().tasks.find((t) => t.id === 't3')?.status).toBe('claimed')
  })

  it('reading today extends the streak once', () => {
    s().setUser('u-jessa')
    const before = computeStreak(s().activity['u-jessa'] ?? [], dayKey()).current
    s().logReading()
    s().logReading()
    expect(computeStreak(s().activity['u-jessa'] ?? [], dayKey()).current).toBe(before + 1)
  })

  it('a full prayer group waitlists new requests', () => {
    s().setUser('u-jessa')
    const r = s().submitPrayer({
      groupId: 'g-youth',
      name: 'Jessa',
      anonymous: false,
      text: 'For exams',
      visibility: 'group',
    })
    expect(r.status).toBe('waitlisted')
  })

  it('claiming a church sets it to pending until a moderator approves', () => {
    s().claimChurch('ch-hope', { role: 'Pastor', contact: 'x@example.com', evidence: 'letter.pdf' })
    expect(s().churches.find((c) => c.id === 'ch-hope')?.status).toBe('pending')
    const claim = s().claims.find((c) => c.churchId === 'ch-hope')!
    s().decideClaim(claim.id, true)
    expect(s().churches.find((c) => c.id === 'ch-hope')?.status).toBe('verified')
  })

  it('reset restores the seed', () => {
    s().addQuestion({ title: 't', body: 'b', topic: 'Doubt', anonymous: true })
    s().resetDemo()
    expect(s().feed).toHaveLength(createSeed().feed.length)
  })
})
