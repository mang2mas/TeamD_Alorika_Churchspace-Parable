// Shapes of the Phase 0 seed data. Phase 1 replaces these with generated Supabase types.
export const TOPICS = ['Doubt', 'Prayer', 'Relationships', 'Anxiety', 'Sunday Recap'] as const
export type Topic = (typeof TOPICS)[number]

export const isTopic = (value: string): value is Topic =>
  (TOPICS as readonly string[]).includes(value)

export interface AiTakeaway {
  verse: string
  takeaway: string
}

export interface Comment {
  id: string
  author: string
  text: string
  time: string
}

export interface Question {
  id: string
  type: 'question'
  author: string
  church: string
  status: 'answered' | 'unanswered'
  time: string
  title: string
  body: string
  topic: Topic
  ai: AiTakeaway
  helpful: number
  helped: boolean
  comments: Comment[]
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
