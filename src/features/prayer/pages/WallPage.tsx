import { HandHeart } from 'lucide-react'
import { timeAgo } from '@/shared/lib/dates'
import { useCurrentUser, useDemo } from '@/shared/store/demo'
import { toast } from '@/shared/store/toast'
import { EmptyState, Page, PageHeader } from '@/shared/ui'
import { card } from '@/shared/ui/styles'

export default function WallPage() {
  const user = useCurrentUser()
  const groups = useDemo((s) => s.prayerGroups)
  const requests = useDemo((s) => s.prayerRequests)
  const prayFor = useDemo((s) => s.prayFor)
  // Private ("leaders only") requests never appear here.
  const wall = requests.filter((r) => r.status === 'active' && r.visibility === 'group')
  const answered = requests.filter((r) => r.status === 'answered' && r.visibility === 'group')

  return (
    <Page>
      <PageHeader
        title="Prayer wall"
        subtitle="Requests your group shared. Tap “I prayed” so they know someone is with them."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {wall.map((r) => {
          const prayed = r.prayedBy.includes(user.id)
          return (
            <article key={r.id} className={`${card} p-5 flex flex-col gap-3`}>
              <p className="text-xs text-sage">
                {r.displayName} · {groups.find((g) => g.id === r.groupId)?.name} ·{' '}
                {timeAgo(r.createdAt)}
              </p>
              <p className="font-serif text-lg leading-relaxed text-fg">{r.text}</p>
              <button
                disabled={prayed}
                onClick={() => {
                  prayFor(r.id)
                  toast('Thank you for praying 🙏')
                }}
                className={`self-start flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm border ${
                  prayed
                    ? 'bg-emerald/20 border-emerald text-accent'
                    : 'border-line text-fg/70 hover:bg-fg/5'
                }`}
              >
                <HandHeart size={14} /> {prayed ? 'You prayed' : 'I prayed'} · {r.prayedBy.length}
              </button>
            </article>
          )
        })}
      </div>
      {!wall.length && <EmptyState title="No shared requests right now" />}
      {answered.length > 0 && (
        <>
          <h2 className="font-serif text-xl font-semibold text-fg mt-8 mb-3">
            Answered prayers 🙌
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {answered.map((r) => (
              <article key={r.id} className={`${card} p-5`}>
                <p className="text-xs text-sage">{r.displayName}</p>
                <p className="text-sm text-fg/80 mt-1">{r.text}</p>
                {r.updates.at(-1) && (
                  <p className="mt-2 text-sm text-accent">{r.updates.at(-1)?.text}</p>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </Page>
  )
}
