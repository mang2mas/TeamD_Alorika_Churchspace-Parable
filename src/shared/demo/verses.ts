// Verse texts are from the King James Version (public domain). Licensed translations
// (NIV, ESV, MBB) need permission before they can be used; see docs/SAFETY_AND_PRIVACY.md.
export interface Verse {
  ref: string
  text: string
  theme: 'peace' | 'hope' | 'courage' | 'trust' | 'rest' | 'community' | 'word'
}

export const TRANSLATION = 'KJV'

export const VERSES: Verse[] = [
  {
    ref: 'Philippians 4:6–7',
    theme: 'peace',
    text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
  },
  {
    ref: 'Proverbs 3:5–6',
    theme: 'trust',
    text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
  },
  {
    ref: 'Isaiah 41:10',
    theme: 'courage',
    text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
  },
  {
    ref: 'Matthew 11:28',
    theme: 'rest',
    text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
  },
  {
    ref: 'Lamentations 3:22–23',
    theme: 'hope',
    text: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.",
  },
  {
    ref: 'Joshua 1:9',
    theme: 'courage',
    text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
  },
  {
    ref: 'Psalm 119:105',
    theme: 'word',
    text: 'Thy word is a lamp unto my feet, and a light unto my path.',
  },
  {
    ref: 'James 1:22',
    theme: 'word',
    text: 'But be ye doers of the word, and not hearers only, deceiving your own selves.',
  },
  {
    ref: '1 Peter 5:7',
    theme: 'peace',
    text: 'Casting all your care upon him; for he careth for you.',
  },
  {
    ref: 'Psalm 46:1',
    theme: 'trust',
    text: 'God is our refuge and strength, a very present help in trouble.',
  },
  {
    ref: 'Romans 8:28',
    theme: 'hope',
    text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
  },
  {
    ref: 'Galatians 6:9',
    theme: 'hope',
    text: 'And let us not be weary in well doing: for in due season we shall reap, if we faint not.',
  },
  {
    ref: 'Proverbs 18:24',
    theme: 'community',
    text: 'A man that hath friends must shew himself friendly: and there is a friend that sticketh closer than a brother.',
  },
  {
    ref: 'Micah 6:8',
    theme: 'word',
    text: 'He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?',
  },
]

/** Normalize a reference for matching: lowercase, en dash -> hyphen, collapse spaces. */
export const normalizeRef = (ref: string) =>
  ref.toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim()

export function findVerse(ref: string): Verse | undefined {
  const n = normalizeRef(ref)
  return VERSES.find((v) => normalizeRef(v.ref) === n)
}

/** A stable "verse of the day" so everyone sees the same card on the same date. */
export function verseOfDay(dayNumber: number): Verse {
  return VERSES[((dayNumber % VERSES.length) + VERSES.length) % VERSES.length]!
}

export const dayNumber = (date = new Date()) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / (24 * 60 * 60 * 1000))
