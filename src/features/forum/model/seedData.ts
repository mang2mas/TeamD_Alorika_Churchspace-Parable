// Forum demo data. Timestamps are relative to "now" so the demo always looks current.
import { DAY, HOUR, isoAgo } from '@/shared/lib/dates'
import type { AiTakeaway, FeedItem, Media, Question, Topic } from './types'
export { TOPICS } from './types'

export const AI_TAKEAWAYS: Record<Topic, AiTakeaway> = {
  Doubt: {
    verse: 'Habakkuk 3:17–18',
    takeaway:
      "Faith isn't ignoring silence; it's trusting God's character before the breakthrough.",
  },
  Prayer: {
    verse: 'Matthew 6:6–8',
    takeaway:
      'Sunday’s lecture: prayer is not performance. God listens to the quiet room more than the polished words.',
  },
  Relationships: {
    verse: 'Proverbs 18:24',
    takeaway:
      'Real community is measured by who stays, not by how many invite you. Be the friend you are looking for.',
  },
  Anxiety: {
    verse: 'Philippians 4:6–7',
    takeaway:
      'Bring the specific worry, not a vague one. Peace guards the heart after the request is made, not before.',
  },
  'Sunday Recap': {
    verse: 'James 1:22',
    takeaway:
      'A sermon only becomes real when one small thing changes by Monday. Pick one and write it down.',
  },
}

const q = (fields: Omit<Question, 'type' | 'reports' | 'hidden' | 'helped'>): Question => ({
  type: 'question',
  reports: [],
  hidden: false,
  helped: false,
  ...fields,
})

export function createQuestions(now = Date.now()): Question[] {
  return [
    q({
      id: 'q1',
      author: 'Anonymous Youth',
      church: 'Cabuyao',
      status: 'unanswered',
      createdAt: isoAgo(21 * HOUR, now),
      title: 'Why does God feel silent when I pray the hardest?',
      body: 'I have been praying every night for two months about my parents. Nothing changes and I feel nothing. Is doubt a sin, or am I just tired?',
      topic: 'Doubt',
      ai: AI_TAKEAWAYS.Doubt,
      helpful: 18,
      comments: [
        {
          id: 'c1',
          author: 'Kuya Ben',
          byLeader: false,
          text: 'Habakkuk wrote this while the fields were empty. Honest questions are still prayers.',
          createdAt: isoAgo(10 * HOUR, now),
        },
        {
          id: 'c2',
          author: 'Anonymous Youth',
          byLeader: false,
          text: 'Same here. Thank you for asking this out loud.',
          createdAt: isoAgo(6 * HOUR, now),
        },
      ],
    }),
    q({
      id: 'q2',
      author: 'Anonymous Youth',
      church: 'San Pedro',
      status: 'answered',
      createdAt: isoAgo(2 * DAY, now),
      title: 'My worship feels empty lately. Am I faking it?',
      body: 'I serve on the worship team and I am good at the notes, but my heart is somewhere else. I feel like a performer instead of a believer.',
      topic: 'Prayer',
      ai: AI_TAKEAWAYS.Prayer,
      helpful: 32,
      comments: [
        {
          id: 'c3',
          author: 'Ate Rina',
          authorId: 'u-rina',
          byLeader: true,
          text: 'Dry seasons are normal. Keep showing up, and sit out one Sunday just to listen.',
          createdAt: isoAgo(1 * DAY, now),
        },
      ],
    }),
    q({
      id: 'q3',
      author: 'Jessa',
      authorId: 'u-jessa',
      church: 'Calamba',
      status: 'unanswered',
      createdAt: isoAgo(5 * HOUR, now),
      title: 'My barkada stopped inviting me after I joined youth group',
      body: 'We used to hang out every weekend. Now I get left out of the group chat. How do I stay kind without losing my friends or my faith?',
      topic: 'Relationships',
      ai: AI_TAKEAWAYS.Relationships,
      helpful: 9,
      comments: [],
    }),
    q({
      id: 'q4',
      author: 'Anonymous Youth',
      church: 'Santa Rosa',
      status: 'answered',
      createdAt: isoAgo(4 * DAY, now),
      title: 'How do I stop panicking about tuition and family finances?',
      body: 'My dad’s work hours were cut and I might have to stop school next semester. I cannot sleep, and everyone tells me to just have faith.',
      topic: 'Anxiety',
      ai: AI_TAKEAWAYS.Anxiety,
      helpful: 41,
      comments: [
        {
          id: 'c4',
          author: 'Ate Rina',
          authorId: 'u-rina',
          byLeader: true,
          text: 'Faith and a scholarship search can happen together. Talk to our youth pastor this Sunday.',
          createdAt: isoAgo(3 * DAY, now),
        },
      ],
    }),
    q({
      id: 'q5',
      author: 'Anonymous Youth',
      church: 'Biñan',
      status: 'unanswered',
      createdAt: isoAgo(14 * HOUR, now),
      title: 'Is it wrong to have questions about the Bible?',
      body: 'Some parts of the Old Testament are hard for me to understand. My classmates say Christians just believe without thinking. Can I ask questions and still have faith?',
      topic: 'Doubt',
      ai: AI_TAKEAWAYS.Doubt,
      helpful: 7,
      comments: [
        {
          id: 'c5',
          author: 'Jessa',
          authorId: 'u-jessa',
          byLeader: false,
          text: 'I had the same questions last year. Asking them in youth group helped me a lot.',
          createdAt: isoAgo(9 * HOUR, now),
        },
      ],
    }),
    q({
      id: 'q6',
      author: 'Anonymous Youth',
      church: 'Los Baños',
      status: 'answered',
      createdAt: isoAgo(3 * DAY, now),
      title: 'How do I know if my faith is real or just habit?',
      body: 'I grew up in church, so I do everything automatically. Lately I wonder if I actually believe or if it is just what my family does.',
      topic: 'Doubt',
      ai: AI_TAKEAWAYS.Doubt,
      helpful: 15,
      comments: [
        {
          id: 'c6',
          author: 'Jessa',
          authorId: 'u-jessa',
          byLeader: false,
          text: 'Try reading one Gospel on your own, not because you have to. That is when it became mine.',
          createdAt: isoAgo(2 * DAY + 5 * HOUR, now),
        },
        {
          id: 'c7',
          author: 'Ate Rina',
          authorId: 'u-rina',
          byLeader: true,
          text: 'Habits are not the enemy of faith. Asking this question is a sign your faith is becoming your own.',
          createdAt: isoAgo(2 * DAY, now),
        },
      ],
    }),
  ]
}

export const seedMedia: Media[] = [
  {
    id: 'm1',
    type: 'media',
    kind: 'article',
    meta: '4 min read',
    topic: 'Anxiety',
    title: 'Trusting God When the Budget Is Tight',
    creator: 'Parable Editorial',
    cover:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=70',
    excerpt:
      'Practical steps for students and young workers facing money stress: name the number, ask for help, and give thanks for what is already in hand.',
  },
  {
    id: 'm2',
    type: 'media',
    kind: 'reel',
    meta: '0:45',
    topic: 'Prayer',
    title: 'Worship Is Not a Performance',
    creator: 'Ptr. Daniel Cruz',
    cover:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=70',
    excerpt: 'A 45-second reminder before you step on stage: God is not grading the set list.',
  },
  {
    id: 'm3',
    type: 'media',
    kind: 'podcast',
    meta: '12 min',
    topic: 'Relationships',
    title: 'Finding Real Friends in a Lonely Season',
    creator: 'Youth Table Podcast',
    cover:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=70',
    excerpt:
      'Three young adults talk about losing their old circle and slowly building a new one around honesty.',
  },
  {
    id: 'm4',
    type: 'media',
    kind: 'article',
    meta: '6 min read',
    topic: 'Doubt',
    title: 'Honest Doubt Is Not the Opposite of Faith',
    creator: 'Sis. Anna Reyes',
    cover:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=70',
    excerpt:
      'From Thomas to Habakkuk, Scripture makes room for the questions we are afraid to ask.',
  },
]

/** Interleave questions and media so the first screen shows both card styles. */
export function createFeed(now = Date.now()): FeedItem[] {
  const questions = createQuestions(now)
  return questions.flatMap((question, i) => {
    const m = seedMedia[i]
    return m ? [question, m] : [question]
  })
}

export const initialItems: FeedItem[] = createFeed()
