import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { matches, FAQS } from '../model/search'
import type { FeedItem, Topic } from '../model/types'

// 16x16 pixel-art wolf: [x, y, w, h, color]
const PX: [number, number, number, number, string][] = [
  [2,1,2,3,'#6b7280'],[12,1,2,3,'#6b7280'],[3,3,10,2,'#9ca3af'],[2,5,12,6,'#9ca3af'],[4,11,8,3,'#d1d5db'],
  [4,6,2,2,'#071917'],[10,6,2,2,'#071917'],[6,9,4,2,'#374151'],[7,9,2,1,'#071917'],[2,5,1,4,'#6b7280'],[13,5,1,4,'#6b7280'],
]

function Wolf({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {PX.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}
    </svg>
  )
}

interface Props {
  items: FeedItem[]
  onFilter: (topic: Topic) => void
  onOpen: (id: string) => void
}

export default function DogRouterWidget({ items, onFilter, onOpen }: Props) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const hits = useMemo(() => (q.trim() ? items.filter((i) => matches(i, q)) : []), [items, q])
  const threads = hits.filter((i) => i.type === 'question').slice(0, 3)
  const topics = [...new Set(hits.map((i) => i.topic))].slice(0, 3)

  const go = (fn: () => void) => { fn(); setOpen(false) }

  return (
    <>
      {open && (
        <div className="pop fixed bottom-24 right-6 z-40 w-80 sm:w-96 rounded-2xl bg-card border border-line shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <p className="font-serif text-fg">Ask Bark</p>
            <button onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="p-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try: finances, worship, friends, doubt..."
              className="w-full rounded-full bg-fg/5 border border-line px-4 py-2 text-sm placeholder:text-sage/60 focus:outline-hidden focus:border-emerald" />
            {!q.trim() && <p className="text-sm text-sage">Type a concern and I will point you to the right questions and threads.</p>}
            {q.trim() && !hits.length && <p className="text-sm text-sage">No matches yet. Try a simpler word, or post your question.</p>}
            {topics.length > 0 && (
              <div>
                <p className="text-xs text-sage mb-2">Suggested questions</p>
                <div className="flex flex-col gap-2">
                  {topics.map((t) => (
                    <button key={t} onClick={() => go(() => onFilter(t))} className="text-left rounded-full border border-emerald/40 bg-emerald/10 text-accent text-sm px-3 py-1.5 hover:bg-emerald/20">
                      {FAQS[t]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {threads.length > 0 && (
              <div>
                <p className="text-xs text-sage mb-2">Related threads</p>
                <div className="flex flex-col gap-2">
                  {threads.map((t) => (
                    <button key={t.id} onClick={() => go(() => onOpen(t.id))} className="text-left rounded-xl bg-fg/5 border border-line p-3 hover:border-emerald/40">
                      <p className="font-serif text-sm text-fg leading-snug">{t.title}</p>
                      <p className="text-xs text-sage mt-1">{t.topic} • {t.church}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} aria-label="Ask Bark, topic router"
        className="group fixed bottom-6 right-6 z-40 grid place-items-center h-14 w-14 rounded-2xl bg-[#0d2623] border border-white/10 shadow-xl hover:border-emerald/60">
        <Wolf />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald border-2 border-canvas" />
        <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-full bg-black/80 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Ask Bark • Topic Router</span>
      </button>
    </>
  )
}
