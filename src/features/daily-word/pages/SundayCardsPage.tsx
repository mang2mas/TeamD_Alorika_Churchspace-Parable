import { useRef, useState } from 'react'
import { Copy, Download, Sparkles } from 'lucide-react'
import { toast } from '@/shared/store/toast'
import { DemoNote, Page, PageHeader, RoleGate } from '@/shared/ui'
import { btn, card, chip, field, tag } from '@/shared/ui/styles'
import ShareCard, { type CardFormat, type CardStyle } from '../components/ShareCard'
import { SAMPLE_SERMON, generateCards, type SermonCards, type SermonInput } from '../model/sermon'

async function exportPng(node: HTMLElement, filename: string) {
  // Loaded on demand so the Daily Word page stays light.
  const { toPng } = await import('html-to-image')
  const dataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export default function SundayCardsPage() {
  const [input, setInput] = useState<SermonInput>(SAMPLE_SERMON)
  const [cards, setCards] = useState<SermonCards | null>(null)
  const [style, setStyle] = useState<CardStyle>('light')
  const [format, setFormat] = useState<CardFormat>('square')
  const set = <K extends keyof SermonInput>(k: K, v: SermonInput[K]) =>
    setInput((s) => ({ ...s, [k]: v }))

  const updateVerse = (id: string, text: string) =>
    setCards((c) => c && { ...c, verses: c.verses.map((v) => (v.id === id ? { ...v, text } : v)) })
  const updateQuote = (id: string, text: string) =>
    setCards((c) => c && { ...c, quotes: c.quotes.map((q) => (q.id === id ? { ...q, text } : q)) })

  return (
    <RoleGate allow={['media', 'admin']} feature="Sunday Message to Cards">
      <Page>
        <PageHeader
          title="Sunday Message to Cards"
          subtitle="The Sunday message is forgotten by Monday. Paste the sermon notes and get verse cards, quote cards and captions ready to post."
        />
        <section className={`${card} p-6 grid gap-4 md:grid-cols-3`}>
          <label className="text-sm">
            Sermon title
            <input
              className={`${field} mt-1`}
              value={input.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </label>
          <label className="text-sm">
            Preacher
            <input
              className={`${field} mt-1`}
              value={input.preacher}
              onChange={(e) => set('preacher', e.target.value)}
            />
          </label>
          <label className="text-sm">
            Church
            <input
              className={`${field} mt-1`}
              value={input.church}
              onChange={(e) => set('church', e.target.value)}
            />
          </label>
          <label className="text-sm md:col-span-3">
            Sermon notes
            <textarea
              rows={10}
              className={`${field} mt-1 font-mono text-xs leading-relaxed`}
              value={input.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </label>
          <div className="md:col-span-3 flex flex-wrap items-center gap-3">
            <button
              className={btn.primary}
              disabled={!input.notes.trim()}
              onClick={() => {
                setCards(generateCards(input))
                toast('Cards ready. Edit anything, then export.')
              }}
            >
              <Sparkles size={16} /> Generate cards
            </button>
            <span className="text-xs text-sage">
              Bible references and key lines are picked up automatically.
            </span>
          </div>
        </section>

        {cards && (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-sage mr-1">Style</span>
              {(['light', 'dark', 'gold'] as const).map((s) => (
                <button
                  key={s}
                  className={chip(style === s)}
                  aria-pressed={style === s}
                  onClick={() => setStyle(s)}
                >
                  {s[0]!.toUpperCase() + s.slice(1)}
                </button>
              ))}
              <span className="text-sm text-sage ml-3 mr-1">Size</span>
              {(
                [
                  ['square', 'Square 1:1'],
                  ['story', 'Story 9:16'],
                ] as const
              ).map(([f, label]) => (
                <button
                  key={f}
                  className={chip(format === f)}
                  aria-pressed={format === f}
                  onClick={() => setFormat(f)}
                >
                  {label}
                </button>
              ))}
            </div>

            <h2 className="font-serif text-2xl font-semibold text-fg mt-6 mb-3">Verse cards</h2>
            {!cards.verses.length && (
              <p className="text-sm text-sage">No Bible references found in the notes.</p>
            )}
            <div className="flex flex-wrap gap-6">
              {cards.verses.map((v, i) => (
                <CardEditor
                  key={v.id}
                  filename={`parable-verse-${i + 1}.png`}
                  note={
                    v.found ? undefined : 'Not in our verse list yet. Type the verse text below.'
                  }
                  value={v.text}
                  onChange={(t) => updateVerse(v.id, t)}
                >
                  {(ref) => (
                    <ShareCard
                      ref={ref}
                      kind="verse"
                      text={v.text}
                      caption={v.ref}
                      church={input.church}
                      style={style}
                      format={format}
                    />
                  )}
                </CardEditor>
              ))}
            </div>

            <h2 className="font-serif text-2xl font-semibold text-fg mt-8 mb-3">Quote cards</h2>
            <div className="flex flex-wrap gap-6">
              {cards.quotes.map((q, i) => (
                <CardEditor
                  key={q.id}
                  filename={`parable-quote-${i + 1}.png`}
                  value={q.text}
                  onChange={(t) => updateQuote(q.id, t)}
                >
                  {(ref) => (
                    <ShareCard
                      ref={ref}
                      kind="quote"
                      text={q.text}
                      caption={q.attribution}
                      church={input.church}
                      style={style}
                      format={format}
                    />
                  )}
                </CardEditor>
              ))}
            </div>

            <h2 className="font-serif text-2xl font-semibold text-fg mt-8 mb-3">Captions</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {cards.captions.map((c) => (
                <div key={c.id} className={`${card} p-5 flex flex-col gap-3`}>
                  <span className={tag.green}>{c.platform}</span>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-fg/85 flex-1">
                    {c.text}
                  </pre>
                  <button
                    className={`${btn.secondary} self-start`}
                    onClick={() => {
                      navigator.clipboard.writeText(c.text).then(
                        () => toast(`${c.platform} caption copied`),
                        () => toast('Could not copy. Select the text manually.'),
                      )
                    }}
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-6">
          <DemoNote>
            Cards come from an offline demo generator (it finds Bible references and the strongest
            lines in the notes). Verse text is KJV (public domain). The production version can use
            AI on the server for better summaries.
          </DemoNote>
        </div>
      </Page>
    </RoleGate>
  )
}

function CardEditor({
  children,
  filename,
  value,
  onChange,
  note,
}: {
  children: (ref: React.Ref<HTMLDivElement>) => React.ReactNode
  filename: string
  value: string
  onChange: (text: string) => void
  note?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  return (
    <div className="flex flex-col gap-2 w-[320px]">
      {children(ref)}
      {note && <p className="text-xs text-warn">{note}</p>}
      <label className="text-xs text-sage">
        Edit text
        <textarea
          rows={3}
          className={`${field} mt-1 text-xs`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      <button
        className={btn.secondary}
        disabled={busy}
        onClick={() => {
          if (!ref.current) return
          setBusy(true)
          exportPng(ref.current, filename)
            .then(() => toast(`Saved ${filename}`))
            .catch(() => toast('Export failed. Try again.'))
            .finally(() => setBusy(false))
        }}
      >
        <Download size={14} /> {busy ? 'Exporting…' : 'Export PNG'}
      </button>
    </div>
  )
}
