import { Award, Flag, MessageCircle, ThumbsUp } from 'lucide-react'
import { hoursSince, timeAgo } from '@/shared/lib/dates'
import type { AiTakeaway, Question } from '../model/types'

export function AiPill({ ai, large = false }: { ai?: AiTakeaway; large?: boolean }) {
  if (!ai) return null
  return large ? (
    <blockquote className="rounded-xl border-l-4 border-amber bg-aibg px-5 py-4">
      <p className="text-xs text-aiverse font-medium mb-1">
        📖 {ai.verse} · Scripture & Sunday Takeaway
      </p>
      <p className="font-serif italic text-lg leading-relaxed text-fg/90">{ai.takeaway}</p>
    </blockquote>
  ) : (
    <div className="rounded-lg bg-aibg border border-aiborder px-3 py-2 text-xs leading-relaxed text-aitext/90">
      📖 <span className="font-medium text-aiverse">{ai.verse}</span> • {ai.takeaway}
    </div>
  )
}

export function StatusChip({ q }: { q: Question }) {
  if (q.status === 'answered')
    return (
      <span className="shrink-0 rounded-full px-2.5 py-0.5 border text-accent border-emerald/40 bg-emerald/10">
        Answered by a leader
      </span>
    )
  const waitingLong = hoursSince(q.createdAt) >= 12
  return (
    <span className="shrink-0 rounded-full px-2.5 py-0.5 border text-warn border-amber/40 bg-amber/10">
      {waitingLong ? 'Waiting 12h+' : 'Unanswered'} • {timeAgo(q.createdAt)}
    </span>
  )
}

interface Props {
  q: Question
  onOpen: (id: string) => void
  onHelpful: (id: string) => void
  /** Top badge of a named author. Never passed for anonymous questions. */
  authorBadge?: string
  showReports?: boolean
}

export default function QuestionCard({ q, onOpen, onHelpful, authorBadge, showReports }: Props) {
  const open = () => onOpen(q.id)
  return (
    <article
      onClick={open}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && open()}
      className="cursor-pointer rounded-2xl bg-card border border-line shadow-card p-6 flex flex-col gap-4 hover:border-emerald/40 transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-emerald"
    >
      <div className="flex items-start justify-between gap-3 text-xs text-sage">
        <span className="flex flex-wrap items-center gap-1.5">
          <span>
            {q.author} • {q.church}
          </span>
          {authorBadge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2 py-px text-[11px] text-warn">
              <Award size={11} /> {authorBadge}
            </span>
          )}
        </span>
        <StatusChip q={q} />
      </div>
      <h3 className="font-serif text-xl font-semibold leading-snug text-fg">{q.title}</h3>
      <p className="text-sm leading-relaxed text-fg/70 line-clamp-3">{q.body}</p>
      <AiPill ai={q.ai} />
      {showReports && (q.reports.length > 0 || q.hidden) && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-300">
          <Flag size={12} /> {q.reports.length} report{q.reports.length === 1 ? '' : 's'}
          {q.hidden && ' · hidden from the feed'}
        </p>
      )}
      <div className="flex items-center justify-between pt-1 text-sm text-sage">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onHelpful(q.id)
            }}
            aria-pressed={q.helped}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 border transition-colors ${q.helped ? 'bg-emerald/20 border-emerald text-accent' : 'border-line hover:bg-fg/5'}`}
          >
            <ThumbsUp size={14} /> Helpful · {q.helpful}
          </button>
          <span className="flex items-center gap-1.5">
            <MessageCircle size={14} /> {q.comments.length}
          </span>
        </div>
        <span className="text-accent text-xs font-medium">Read & Reply →</span>
      </div>
    </article>
  )
}
