import { useEffect, useState } from 'react'
import { Flag, Play, Send, Share2, ThumbsUp, X } from 'lucide-react'
import { timeAgo } from '@/shared/lib/dates'
import { AiPill } from './QuestionCard'
import { Cover } from './MediaCard'
import { badge } from '../model/media'
import type { FeedItem, Media } from '../model/types'

interface Props {
  item: FeedItem
  media: Media[]
  onClose: () => void
  onReply: (id: string, text: string) => void
  onHelpful: (id: string) => void
  onShare: (m: Media) => void
  onOpen: (id: string) => void
  onReport: (id: string) => void
  /** The current user already reported this question. */
  reported: boolean
  /** The current user's replies count as a leader answer. */
  isLeader: boolean
}

export default function ReaderModal({
  item,
  media,
  onClose,
  onReply,
  onHelpful,
  onShare,
  onOpen,
  onReport,
  reported,
  isLeader,
}: Props) {
  const [text, setText] = useState('')

  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onClose])

  // Match by topic, then fall back to other media so the shelf is never empty.
  const pool = media.filter((m) => m.id !== item.id)
  const related = [
    ...pool.filter((m) => m.topic === item.topic),
    ...pool.filter((m) => m.topic !== item.topic),
  ].slice(0, 3)

  const submit = () => {
    if (!text.trim()) return
    onReply(item.id, text.trim())
    setText('')
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="pop relative max-w-2xl mx-auto my-6 sm:my-10 rounded-2xl bg-card border border-line shadow-card overflow-hidden"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 grid place-items-center h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 text-white"
        >
          <X size={18} />
        </button>

        {item.type === 'question' ? (
          <section className="p-8 pb-6 flex flex-col gap-5">
            <p className="text-xs text-sage pr-10">
              {item.author} • {item.church} • {timeAgo(item.createdAt)}
            </p>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-fg">
              {item.title}
            </h2>
            <p className="font-serif text-lg leading-relaxed text-fg/80">{item.body}</p>
            <AiPill ai={item.ai} large />
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onHelpful(item.id)}
                aria-pressed={item.helped}
                className={`self-start flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm border ${item.helped ? 'bg-emerald/20 border-emerald text-accent' : 'border-line text-fg/70 hover:bg-fg/5'}`}
              >
                <ThumbsUp size={14} /> Helpful · {item.helpful}
              </button>
              <button
                onClick={() => onReport(item.id)}
                disabled={reported}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm border border-line text-sage hover:bg-fg/5 disabled:opacity-60"
              >
                <Flag size={14} /> {reported ? 'Reported' : 'Report'}
              </button>
            </div>
          </section>
        ) : (
          <section>
            <div className="relative">
              <Cover m={item} className="aspect-video" />
              {item.kind !== 'article' && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid place-items-center h-14 w-14 rounded-full bg-emerald text-[#071917]">
                    <Play fill="currentColor" />
                  </span>
                </span>
              )}
              <span className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                {badge(item)}
              </span>
            </div>
            <div className="p-8 pb-6 flex flex-col gap-4">
              <p className="text-xs text-sage">
                {item.creator} • {item.topic}
              </p>
              <h2 className="font-serif text-3xl font-semibold leading-tight text-fg">
                {item.title}
              </h2>
              <p className="font-serif text-lg leading-relaxed text-fg/80">{item.excerpt}</p>
              <button
                onClick={() => onShare(item)}
                className="self-start flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-sm hover:bg-fg/5"
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          </section>
        )}

        {item.type === 'question' && (
          <section className="px-8 py-6 border-t border-line">
            <h3 className="font-serif text-lg text-fg mb-4">
              {item.comments.length} {item.comments.length === 1 ? 'response' : 'responses'}
            </h3>
            <ul className="flex flex-col gap-4">
              {item.comments.map((c) => (
                <li key={c.id} className="border-l-2 border-line pl-4">
                  <p className="flex flex-wrap items-center gap-1.5 text-xs text-sage">
                    {c.author} • {timeAgo(c.createdAt)}
                    {c.byLeader && (
                      <span className="rounded-full bg-emerald/15 px-2 py-px text-[11px] text-accent">
                        Leader answer
                      </span>
                    )}
                  </p>
                  <p className="text-sm leading-relaxed mt-1">{c.text}</p>
                </li>
              ))}
              {!item.comments.length && (
                <li className="text-sm text-sage">No responses yet. Be the first to encourage.</li>
              )}
            </ul>
            <div className="mt-5 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Write an encouraging response..."
                className="flex-1 rounded-full bg-fg/5 border border-line px-4 py-2 text-sm placeholder:text-sage/60 focus:outline-hidden focus:border-emerald"
              />
              <button
                onClick={submit}
                aria-label="Send response"
                className="grid place-items-center h-10 w-10 rounded-full bg-emerald text-[#071917]"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2 text-xs text-sage">
              {isLeader
                ? 'You are replying as a leader: your reply marks this question as answered.'
                : 'Anyone can encourage. A reply from a Discipler/Leader marks the question as answered.'}
            </p>
          </section>
        )}

        <section className="px-8 py-6 border-t border-line bg-sunk">
          <h3 className="font-serif text-lg text-fg mb-4">Continue Exploring</h3>
          <div className="grid grid-cols-3 gap-3">
            {related.map((m) => (
              <button key={m.id} onClick={() => onOpen(m.id)} className="text-left group">
                <Cover m={m} className="aspect-square rounded-lg" />
                <p className="mt-2 text-[11px] text-accent">{badge(m)}</p>
                <p className="font-serif text-sm leading-snug text-fg group-hover:text-accent">
                  {m.title}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
