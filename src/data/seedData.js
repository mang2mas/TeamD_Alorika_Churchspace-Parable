// Replace with Supabase queries — see README "Supabase Integration Notes".
export const TOPICS = ['Doubt', 'Prayer', 'Relationships', 'Anxiety', 'Sunday Recap']

export const AI_TAKEAWAYS = {
  Doubt: { verse: 'Habakkuk 3:17–18', takeaway: "Faith isn't ignoring silence; it's trusting God's character before the breakthrough." },
  Prayer: { verse: 'Matthew 6:6–8', takeaway: 'Sunday’s lecture: prayer is not performance. God listens to the quiet room more than the polished words.' },
  Relationships: { verse: 'Proverbs 18:24', takeaway: 'Real community is measured by who stays, not by how many invite you. Be the friend you are looking for.' },
  Anxiety: { verse: 'Philippians 4:6–7', takeaway: 'Bring the specific worry, not a vague one. Peace guards the heart after the request is made, not before.' },
  'Sunday Recap': { verse: 'James 1:22', takeaway: 'A sermon only becomes real when one small thing changes by Monday. Pick one and write it down.' },
}

export const seedQuestions = [
  {
    id: 'q1', type: 'question', author: 'Anonymous Youth', church: 'Cabuyao', status: 'unanswered', time: '21h ago',
    title: 'Why does God feel silent when I pray the hardest?',
    body: 'I have been praying every night for two months about my parents. Nothing changes and I feel nothing. Is doubt a sin, or am I just tired?',
    topic: 'Doubt', ai: AI_TAKEAWAYS.Doubt, helpful: 18, helped: false,
    comments: [
      { id: 'c1', author: 'Ate Rina', text: 'Habakkuk wrote this while the fields were empty. Honest questions are still prayers.', time: '10h ago' },
      { id: 'c2', author: 'Anonymous Youth', text: 'Same here. Thank you for asking this out loud.', time: '6h ago' },
    ],
  },
  {
    id: 'q2', type: 'question', author: 'Anonymous Youth', church: 'San Pedro', status: 'answered', time: '2d ago',
    title: 'My worship feels empty lately. Am I faking it?',
    body: 'I serve on the worship team and I am good at the notes, but my heart is somewhere else. I feel like a performer instead of a believer.',
    topic: 'Prayer', ai: AI_TAKEAWAYS.Prayer, helpful: 32, helped: false,
    comments: [
      { id: 'c3', author: 'Kuya Migs', text: 'Dry seasons are normal. Keep showing up, and sit out one Sunday just to listen.', time: '1d ago' },
    ],
  },
  {
    id: 'q3', type: 'question', author: 'Jessa', church: 'Calamba', status: 'unanswered', time: '5h ago',
    title: 'My barkada stopped inviting me after I joined youth group',
    body: 'We used to hang out every weekend. Now I get left out of the group chat. How do I stay kind without losing my friends or my faith?',
    topic: 'Relationships', ai: AI_TAKEAWAYS.Relationships, helpful: 9, helped: false, comments: [],
  },
  {
    id: 'q4', type: 'question', author: 'Anonymous Youth', church: 'Santa Rosa', status: 'answered', time: '4d ago',
    title: 'How do I stop panicking about tuition and family finances?',
    body: 'My dad’s work hours were cut and I might have to stop school next semester. I cannot sleep, and everyone tells me to just have faith.',
    topic: 'Anxiety', ai: AI_TAKEAWAYS.Anxiety, helpful: 41, helped: false,
    comments: [
      { id: 'c4', author: 'Ate Joy', text: 'Faith and a scholarship search can happen together. Talk to our youth pastor this Sunday.', time: '3d ago' },
    ],
  },
]

export const seedMedia = [
  {
    id: 'm1', type: 'media', kind: 'article', meta: '4 min read', topic: 'Anxiety',
    title: 'Trusting God When the Budget Is Tight', creator: 'Parable Editorial',
    cover: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=70',
    excerpt: 'Practical steps for students and young workers facing money stress: name the number, ask for help, and give thanks for what is already in hand.',
  },
  {
    id: 'm2', type: 'media', kind: 'reel', meta: '0:45', topic: 'Prayer',
    title: 'Worship Is Not a Performance', creator: 'Ptr. Daniel Cruz',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=70',
    excerpt: 'A 45-second reminder before you step on stage: God is not grading the set list.',
  },
  {
    id: 'm3', type: 'media', kind: 'podcast', meta: '12 min', topic: 'Relationships',
    title: 'Finding Real Friends in a Lonely Season', creator: 'Youth Table Podcast',
    cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=70',
    excerpt: 'Three young adults talk about losing their old circle and slowly building a new one around honesty.',
  },
  {
    id: 'm4', type: 'media', kind: 'article', meta: '6 min read', topic: 'Doubt',
    title: 'Honest Doubt Is Not the Opposite of Faith', creator: 'Sis. Anna Reyes',
    cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=70',
    excerpt: 'From Thomas to Habakkuk, Scripture makes room for the questions we are afraid to ask.',
  },
]

// Interleave so the first screen shows both card styles.
export const initialItems = seedQuestions.flatMap((q, i) => [q, seedMedia[i]])
