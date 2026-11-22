import { useMemo, useState } from 'react'
import { Copy, Lightbulb, Shuffle } from 'lucide-react'
import { dayNumber } from '@/shared/demo/verses'
import { useDemo } from '@/shared/store/demo'
import { toast } from '@/shared/store/toast'
import { DemoNote, Page, PageHeader } from '@/shared/ui'
import { btn, card, chip, tag } from '@/shared/ui/styles'
import { IDEA_THEMES, ideasFor, type IdeaTheme } from '../model/ideas'

export default function IdeasPage() {
  const offset = useDemo((s) => s.ideaSeedOffset)
  const moreIdeas = useDemo((s) => s.moreIdeas)
  const [theme, setTheme] = useState<IdeaTheme | 'All'>('All')
  const ideas = useMemo(() => {
    const seed = dayNumber() + offset * 7
    return ideasFor(seed, 8).filter((i) => theme === 'All' || i.theme === theme)
  }, [offset, theme])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast('Caption copied. Paste it into your post!')
    } catch {
      toast('Could not copy. Select the caption and copy it manually.')
    }
  }

  return (
    <Page>
      <PageHeader
        title="Post ideas for today"
        subtitle="Want to share your faith online but don't know what to post? Here are ready-made ideas with captions you can copy."
        action={
          <button className={btn.primary} onClick={moreIdeas}>
            <Shuffle size={16} /> Give me more ideas
          </button>
        }
      />
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
        {(['All', ...IDEA_THEMES] as const).map((t) => (
          <button
            key={t}
            className={chip(theme === t)}
            onClick={() => setTheme(t)}
            aria-pressed={theme === t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {ideas.map((idea) => (
          <article key={idea.id} className={`${card} p-6 flex flex-col gap-3`}>
            <div className="flex items-center justify-between gap-2">
              <span className={tag.green}>{idea.theme}</span>
              <span className="text-xs text-sage">{idea.format}</span>
            </div>
            <h2 className="font-serif text-xl font-semibold text-fg leading-snug flex gap-2">
              <Lightbulb size={20} className="shrink-0 mt-1 text-warn" /> {idea.title}
            </h2>
            <p className="text-sm text-fg/70">{idea.how}</p>
            <pre className="whitespace-pre-wrap font-sans rounded-xl bg-aibg border border-aiborder px-4 py-3 text-sm text-fg/85">
              {idea.caption}
            </pre>
            <button
              className={`${btn.secondary} self-start`}
              onClick={() => void copy(idea.caption)}
            >
              <Copy size={14} /> Copy caption
            </button>
          </article>
        ))}
      </div>
      {!ideas.length && (
        <p className="text-sage text-sm">
          No {theme} ideas in this batch. Tap “Give me more ideas”.
        </p>
      )}
      <div className="mt-6">
        <DemoNote>
          Ideas come from an offline demo generator (templates + public-domain KJV verses). The
          production version can use AI on the server.
        </DemoNote>
      </div>
    </Page>
  )
}
