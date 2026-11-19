// Keyword groups let "finances" match money/tuition/budget etc. A real build would use Supabase full-text search.
const GROUPS = [
  ['finance', 'money', 'budget', 'tuition', 'allowance'],
  ['worship', 'song', 'praise team'],
  ['friend', 'barkada', 'lonely', 'circle'],
  ['doubt', 'silence', 'silent'],
  ['anxious', 'anxiety', 'worry', 'panic', 'stress'],
]

export const FAQS = {
  Doubt: 'Is it okay to doubt God?',
  Prayer: 'What if worship feels empty?',
  Relationships: 'How do I keep friends and my faith?',
  Anxiety: 'How do I handle money stress?',
  'Sunday Recap': 'What do I do with Sunday’s sermon?',
}

const blob = (i) =>
  [i.title, i.body, i.excerpt, i.topic, i.kind, i.creator, i.ai?.verse, i.ai?.takeaway].filter(Boolean).join(' ').toLowerCase()

export function expandTerms(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = [q]
  GROUPS.forEach((g) => { if (g.some((w) => q.includes(w) || (q.length >= 4 && w.includes(q)))) terms.push(...g) })
  return terms
}

export function matches(item, query) {
  const terms = expandTerms(query)
  if (!terms.length) return true
  const b = blob(item)
  return terms.some((t) => b.includes(t))
}
