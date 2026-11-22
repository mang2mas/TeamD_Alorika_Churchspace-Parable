import { describe, expect, it } from 'vitest'
import { computeBadges } from './badges'
import { createQuestions } from './seedData'
import type { TechTask } from './tasks'
import type { Question } from './types'

const task = (
  id: string,
  skills: TechTask['skills'],
  status: TechTask['status'],
  claimedBy?: string,
): TechTask => ({
  id,
  church: 'Grace',
  title: id,
  description: '',
  skills,
  status,
  createdBy: 'admin',
  claimedBy,
  createdAt: '2026-11-01T00:00:00Z',
})

const labels = (userId: string, questions: Question[], tasks: TechTask[]) =>
  computeBadges(userId, questions, tasks).map((b) => b.label)

describe('skill badges', () => {
  it('needs a confirmed task, not just a claimed or done one', () => {
    expect(
      labels('u', [], [task('a', ['design'], 'claimed', 'u'), task('b', ['design'], 'done', 'u')]),
    ).toEqual([])
    expect(labels('u', [], [task('a', ['design'], 'confirmed', 'u')])).toEqual(['Designer'])
  })

  it('upgrades to level II at 3 confirmed tasks', () => {
    const tasks = ['a', 'b', 'c'].map((id) => task(id, ['video'], 'confirmed', 'u'))
    expect(labels('u', [], tasks)).toEqual(['Videographer II'])
  })

  it('one task can earn several skill badges, only for the person who did it', () => {
    const tasks = [task('a', ['design', 'social'], 'confirmed', 'u')]
    expect(labels('u', [], tasks)).toEqual(['Designer', 'Social Media Helper'])
    expect(labels('someone-else', [], tasks)).toEqual([])
  })
})

describe('topic badges', () => {
  it('Jessa has 2 Doubt replies in the seed: no badge yet', () => {
    expect(labels('u-jessa', createQuestions(), [])).toEqual([])
  })

  it('a third reply in the same topic earns Encourager', () => {
    const questions = createQuestions().map((q) =>
      q.id === 'q1'
        ? {
            ...q,
            comments: [
              ...q.comments,
              {
                id: 'x',
                author: 'Jessa',
                authorId: 'u-jessa',
                byLeader: false,
                text: 'hi',
                createdAt: '',
              },
            ],
          }
        : q,
    )
    expect(labels('u-jessa', questions, [])).toEqual(['Encourager · Doubt'])
  })

  it('anonymous replies count for nobody', () => {
    const anonymousOnly = createQuestions().map((q) => ({
      ...q,
      comments: q.comments.map((c) => ({ ...c, authorId: undefined })),
    }))
    expect(labels('u-jessa', anonymousOnly, [])).toEqual([])
  })
})
