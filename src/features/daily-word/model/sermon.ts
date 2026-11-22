// Sunday Message to Cards: an offline, rule-based demo generator.
// Input/output shapes match the planned server-side Claude function so it can be swapped later.
import { TRANSLATION, findVerse } from '@/shared/demo/verses'

export interface SermonInput {
  title: string
  preacher: string
  church: string
  notes: string
}

export interface VerseCard {
  id: string
  kind: 'verse'
  ref: string
  text: string
  /** False when the reference isn't in our verse list; the volunteer types the text in. */
  found: boolean
}

export interface QuoteCard {
  id: string
  kind: 'quote'
  text: string
  attribution: string
}

export type Platform = 'Facebook' | 'Instagram' | 'TikTok'

export interface Caption {
  id: string
  platform: Platform
  text: string
}

export interface SermonCards {
  verses: VerseCard[]
  quotes: QuoteCard[]
  captions: Caption[]
}

const BOOKS = [
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  'Samuel',
  'Kings',
  'Chronicles',
  'Ezra',
  'Nehemiah',
  'Esther',
  'Job',
  'Psalms',
  'Psalm',
  'Proverbs',
  'Ecclesiastes',
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Daniel',
  'Hosea',
  'Joel',
  'Amos',
  'Jonah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  'Corinthians',
  'Galatians',
  'Ephesians',
  'Philippians',
  'Colossians',
  'Thessalonians',
  'Timothy',
  'Titus',
  'Philemon',
  'Hebrews',
  'James',
  'Peter',
  'Jude',
  'Revelation',
]

const REF_PATTERN = new RegExp(
  `\\b((?:[1-3]\\s?)?(?:${BOOKS.join('|')}))\\s+(\\d{1,3}):(\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?`,
  'g',
)

/** Bible references in the order they appear, e.g. "Matthew 11:28", "Lamentations 3:22–23". */
export function extractReferences(notes: string): string[] {
  const refs: string[] = []
  for (const m of notes.matchAll(REF_PATTERN)) {
    const book = (m[1] ?? '').replace(/^([1-3])\s?/, '$1 ').replace(/^Psalms$/, 'Psalm')
    const ref = `${book} ${m[2]}:${m[3]}${m[4] ? `–${m[4]}` : ''}`
    if (!refs.includes(ref)) refs.push(ref)
  }
  return refs
}

const STRONG_WORDS = [
  'god',
  'jesus',
  'grace',
  'faith',
  'love',
  'hope',
  'peace',
  'trust',
  'mercy',
  'today',
  'monday',
  'you',
  'never',
  'always',
  'new',
]

function scoreSentence(s: string): number {
  const lower = s.toLowerCase()
  let score = 0
  if (s.length >= 35 && s.length <= 140) score += 3
  else if (s.length > 140) score -= 2
  score += Math.min(3, STRONG_WORDS.filter((w) => new RegExp(`\\b${w}\\b`).test(lower)).length)
  if (/^(don't|do not|let|remember|choose|keep|stop|start|bring|rest|trust)\b/i.test(s)) score += 2
  if (/[?]$/.test(s)) score -= 1
  return score
}

/** The strongest standalone sentences, in the order they appear in the notes. */
export function pickQuotes(notes: string, max = 3): string[] {
  const sentences = notes
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.replace(/^[\s\-•*\d.)]+/, '').trim())
    .filter((s) => s.length >= 20)
    .filter((s) => extractReferences(s).length === 0)
    .filter((s) => !/:$/.test(s))

  const unique = [...new Set(sentences)]
  const ranked = unique
    .map((s, i) => ({ s, i, score: scoreSentence(s) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, max)
    .sort((a, b) => a.i - b.i)
  return ranked.map((r) => (/[.!?]$/.test(r.s) ? r.s : `${r.s}.`))
}

const hashtag = (s: string) => '#' + s.replace(/[^A-Za-z0-9]+/g, '')

export function generateCards(input: SermonInput): SermonCards {
  const refs = extractReferences(input.notes)
  const verses: VerseCard[] = refs.map((ref, i) => {
    const verse = findVerse(ref)
    return { id: `v${i}`, kind: 'verse', ref, text: verse?.text ?? '', found: Boolean(verse) }
  })
  const quotes: QuoteCard[] = pickQuotes(input.notes).map((text, i) => ({
    id: `q${i}`,
    kind: 'quote',
    text,
    attribution: input.preacher,
  }))

  const mainQuote = quotes[0]?.text ?? input.title
  const mainRef = verses[0]?.ref
  const refLine = mainRef ? ` 📖 ${mainRef}` : ''
  const tags = ['#SundayRecap', hashtag(input.church), '#Parable', '#Laguna'].join(' ')

  const captions: Caption[] = [
    {
      id: 'c-fb',
      platform: 'Facebook',
      text: `This Sunday at ${input.church}, ${input.preacher} preached on "${input.title}".\n\n“${mainQuote}”${refLine}\n\nWhat is one thing you will carry into this week? Tell us in the comments. 👇\n\n${tags}`,
    },
    {
      id: 'c-ig',
      platform: 'Instagram',
      text: `“${mainQuote}”${refLine}\n\nSunday's message: ${input.title} ✨ Save this for Monday.\n\n${tags} #DailyWord`,
    },
    {
      id: 'c-tt',
      platform: 'TikTok',
      text: `POV: you actually remember Sunday's sermon on Monday 👀\n\n${input.title}${mainRef ? ` (${mainRef})` : ''}\n\n${tags} #FaithTok`,
    },
  ]

  return { verses, quotes, captions }
}

export const VERSE_CREDIT = TRANSLATION

export const SAMPLE_SERMON: SermonInput = {
  title: 'New Every Morning',
  preacher: 'Ptr. Daniel Cruz',
  church: 'Grace Fellowship Calamba',
  notes: `Opening: Lamentations 3:22-23. Jeremiah wrote this while Jerusalem was in ruins.

1. God's mercy is not a reward for a good week.
- His compassions fail not, even when we do.
- You do not have to earn your way back to God on Monday morning.

2. Rest is not laziness. Matthew 11:28
- Jesus invites the tired, not the impressive.
- Bring Him the specific burden, not a vague one.

3. Keep going. Galatians 6:9
- Faithfulness looks boring before it looks fruitful.
- Small obedience today matters more than big plans for someday.

Application: Write down one burden and pray about it every morning this week.
Closing: Hebrews 12:1 — run with patience.`,
}
