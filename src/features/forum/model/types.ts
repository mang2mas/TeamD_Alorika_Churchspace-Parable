// Shapes of the forum demo data.
export const TOPICS = ['Doubt', 'Prayer', 'Relationships', 'Anxiety', 'Sunday Recap'] as const
export type Topic = (typeof TOPICS)[number]

export const isTopic = (value: string): value is Topic =>
  (TOPICS as readonly string[]).includes(value)

/** A verse + short takeaway shown on each question (curated by leaders in the demo). */
export interface AiTakeaway {
  verse: string
  takeaway: string
}

export interface Comment {
  id: string
  author: string
  authorId?: string
  /** Replies from a Discipler/Leader or Church Admin count as a leader answer. */
  byLeader: boolean
  text: string
  createdAt: string
}

export interface Question {
  id: string
  type: 'question'
  /** Display name. "Anonymous Youth" when asked anonymously. */
  author: string
  /** Only set for named questions. Anonymous questions are never linked to a user. */
  authorId?: string
  church: string
  status: 'answered' | 'unanswered'
  createdAt: string
  title: string
  body: string
  topic: Topic
  ai: AiTakeaway
  helpful: number
  helped: boolean
  comments: Comment[]
  /** User ids who reported this question. */
  reports: string[]
  hidden: boolean
}

export type MediaKind = 'article' | 'reel' | 'podcast'

export interface Media {
  id: string
  type: 'media'
  kind: MediaKind
  meta: string
  topic: Topic
  title: string
  creator: string
  cover: string
  excerpt: string
}

export type FeedItem = Question | Media

export interface NewPost {
  title: string
  body: string
  topic: Topic
  anonymous: boolean
}
