// Daily post ideas, built offline from templates and the shared verse list (demo generator).
import { TRANSLATION, VERSES, type Verse } from '@/shared/demo/verses'

export const IDEA_THEMES = ['Verse', 'Testimony', 'Prayer', 'Sunday Recap', 'Question'] as const
export type IdeaTheme = (typeof IDEA_THEMES)[number]

export interface PostIdea {
  id: string
  theme: IdeaTheme
  title: string
  how: string
  format: string
  caption: string
}

type Template = (v: Verse) => Omit<PostIdea, 'id'>

const quote = (v: Verse) => `“${v.text}” — ${v.ref} (${TRANSLATION})`

const TEMPLATES: Template[] = [
  (v) => ({
    theme: 'Verse',
    title: `Share ${v.ref} with a photo of where you read it`,
    how: 'Snap your Bible, notebook or phone wherever you had your quiet time. Natural light, no filter needed.',
    format: 'Photo post',
    caption: `${quote(v)}\n\nThis is the verse carrying me this week. What's yours? 👇\n#DailyWord #Parable #Laguna`,
  }),
  (v) => ({
    theme: 'Testimony',
    title: '60-second testimony: one prayer God answered',
    how: 'Film yourself in one take: what you prayed for, what happened, what you learned. Keep it honest, not perfect.',
    format: 'Reel / TikTok (under 60s)',
    caption: `I almost didn't post this. But someone might need to hear it today. 🙏\n\n${quote(v)}\n#Testimony #Faith #YouthPH`,
  }),
  () => ({
    theme: 'Prayer',
    title: 'Ask your followers how you can pray for them',
    how: 'Post a simple story with a question sticker. Reply to every answer privately, and actually pray.',
    format: 'Story with question sticker',
    caption:
      "I'm setting aside time tonight to pray for my friends. Drop a 🙏 or send me what I can pray for. No judgment, promise.",
  }),
  (v) => ({
    theme: 'Sunday Recap',
    title: '3 things I learned on Sunday',
    how: 'A 4-slide carousel: the title, then one learning per slide, then the verse. Use your church colors.',
    format: 'Carousel (4 slides)',
    caption: `Sunday's message is still on my mind. Swipe for the 3 things I'm carrying into this week ➡️\n\n${v.ref}\n#SundayRecap #Church`,
  }),
  () => ({
    theme: 'Question',
    title: 'Poll: When do you usually read your Bible?',
    how: 'A story poll with 4 options: morning, lunch break, before sleep, "I want to start". Share the results the next day.',
    format: 'Story poll',
    caption:
      'Real talk: when do you read your Bible? I want to know when my friends find time. 📖\n#DailyWord',
  }),
  (v) => ({
    theme: 'Verse',
    title: `Write ${v.ref} on a sticky note`,
    how: 'Handwrite the verse, stick it where you will see it (mirror, desk, laptop) and post a photo.',
    format: 'Photo post or story',
    caption: `Putting this where I'll see it every morning. ✍️\n\n${quote(v)}\n#DailyWord #Parable`,
  }),
  () => ({
    theme: 'Testimony',
    title: 'Before and after: what changed since you joined youth group',
    how: 'Two short clips or photos side by side. Talk about one real change, big or small.',
    format: 'Reel with split screen',
    caption:
      "A year ago I didn't think I'd be here. Grateful for this community. 💚\n#YouthGroup #Testimony",
  }),
  (v) => ({
    theme: 'Prayer',
    title: `Tag a friend who needs ${v.ref} today`,
    how: 'Post the verse as text on a plain background. Ask people to tag one friend who needs it.',
    format: 'Text post',
    caption: `${quote(v)}\n\nTag someone who needs this today. 💛`,
  }),
]

/** Deterministic ideas for a seed (use the day number for "ideas of the day"). */
export function ideasFor(seed: number, count = 4): PostIdea[] {
  const n = TEMPLATES.length
  const start = (((seed * 3) % n) + n) % n
  return Array.from({ length: Math.min(count, n) }, (_, i) => {
    const template = TEMPLATES[(start + i) % n]!
    const verse = VERSES[(((seed + i * 5) % VERSES.length) + VERSES.length) % VERSES.length]!
    return { id: `idea-${seed}-${i}`, ...template(verse) }
  })
}
