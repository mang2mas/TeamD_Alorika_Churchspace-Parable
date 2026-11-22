import { Flag } from 'lucide-react'
import { timeAgo } from '@/shared/lib/dates'
import { useDemo } from '@/shared/store/demo'
import { toast } from '@/shared/store/toast'
import { DemoNote, EmptyState, Page, PageHeader, RoleGate } from '@/shared/ui'
import { btn, card, tag } from '@/shared/ui/styles'
import type { Question } from '../model/types'

export default function ReviewPage() {
  const feed = useDemo((s) => s.feed)
  const moderate = useDemo((s) => s.moderate)
  const queue = feed.filter(
    (i): i is Question => i.type === 'question' && (i.reports.length > 0 || i.hidden),
  )

  return (
    <RoleGate allow={['moderator']} feature="Moderation review queue">
      <Page>
        <PageHeader
          title="Review queue"
          subtitle="Reported posts land here. Three reports hide a post from the feed automatically until a moderator decides."
        />
        <div className="flex flex-col gap-4">
          {queue.map((q) => (
            <article key={q.id} className={`${card} p-6 flex flex-col gap-3`}>
              <div className="flex flex-wrap items-center gap-2 text-xs text-sage">
                <span className={tag.rose}>
                  <Flag size={11} className="inline mr-1" />
                  {q.reports.length} report{q.reports.length === 1 ? '' : 's'}
                </span>
                {q.hidden && <span className={tag.amber}>Hidden from feed</span>}
                <span>
                  {q.author} • {q.topic} • {timeAgo(q.createdAt)}
                </span>
              </div>
              <h2 className="font-serif text-xl font-semibold text-fg">{q.title}</h2>
              <p className="text-sm text-fg/70">{q.body}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  className={btn.primary}
                  onClick={() => {
                    moderate(q.id, true)
                    toast('Kept. Reports cleared and the post is visible again.')
                  }}
                >
                  Keep post
                </button>
                <button
                  className={btn.danger}
                  onClick={() => {
                    moderate(q.id, false)
                    toast('Removed from the Freedom Wall.')
                  }}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
        {!queue.length && (
          <EmptyState
            title="Nothing to review"
            body="When people report a post, it shows up here."
          />
        )}
        <div className="mt-6">
          <DemoNote>
            Try it: as any user, open a question and tap “Report”, then switch back to the
            moderator. Anonymous askers stay anonymous: moderators see the post, never who wrote it.
          </DemoNote>
        </div>
      </Page>
    </RoleGate>
  )
}
