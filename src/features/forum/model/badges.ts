import { SKILLS, type Skill, type TechTask } from './tasks'
import { TOPICS, type Question, type Topic } from './types'

export interface Badge {
  id: string
  kind: 'skill' | 'topic'
  label: string
  level: 1 | 2
  detail: string
}

const SKILL_BADGE: Record<Skill, string> = {
  design: 'Designer',
  video: 'Videographer',
  social: 'Social Media Helper',
  web: 'Web Builder',
  sound: 'Sound & Stream Tech',
}

/** Confirmed tasks needed for each badge level. */
export const SKILL_LEVELS = { 1: 1, 2: 3 } as const
/** Replies in one topic needed for an Encourager badge. */
export const TOPIC_REPLIES_NEEDED = 3

/**
 * Badges are earned automatically from what a user has done:
 * - Skill badges: tech tasks with that skill that the church admin confirmed.
 * - Topic badges: replies to questions in one topic.
 */
export function computeBadges(userId: string, questions: Question[], tasks: TechTask[]): Badge[] {
  const badges: Badge[] = []

  for (const skill of SKILLS) {
    const done = tasks.filter(
      (t) => t.status === 'confirmed' && t.claimedBy === userId && t.skills.includes(skill),
    ).length
    if (done >= SKILL_LEVELS[2]) {
      badges.push({
        id: `skill-${skill}`,
        kind: 'skill',
        label: `${SKILL_BADGE[skill]} II`,
        level: 2,
        detail: `${done} confirmed ${skill} tasks`,
      })
    } else if (done >= SKILL_LEVELS[1]) {
      badges.push({
        id: `skill-${skill}`,
        kind: 'skill',
        label: SKILL_BADGE[skill],
        level: 1,
        detail: `${done} confirmed ${skill} task${done === 1 ? '' : 's'}`,
      })
    }
  }

  for (const topic of TOPICS) {
    const replies = repliesInTopic(userId, questions, topic)
    if (replies >= TOPIC_REPLIES_NEEDED) {
      badges.push({
        id: `topic-${topic}`,
        kind: 'topic',
        label: `Encourager · ${topic}`,
        level: 1,
        detail: `${replies} replies to ${topic} questions`,
      })
    }
  }

  return badges
}

export function repliesInTopic(userId: string, questions: Question[], topic: Topic): number {
  return questions
    .filter((q) => q.topic === topic)
    .reduce((n, q) => n + q.comments.filter((c) => c.authorId === userId).length, 0)
}
