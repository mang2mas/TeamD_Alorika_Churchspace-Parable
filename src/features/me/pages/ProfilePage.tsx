import { useMemo } from 'react'
import { Award, Lock } from 'lucide-react'
import StreakCard from '@/features/daily-word/components/StreakCard'
import { computeStreak } from '@/features/daily-word/model/streak'
import { TOPIC_REPLIES_NEEDED, computeBadges, repliesInTopic } from '@/features/forum/model/badges'
import type { Question } from '@/features/forum/model/types'
import { ROLE_LABEL } from '@/shared/demo/users'
import { dayKey } from '@/shared/lib/dates'
import { useCurrentUser, useDemo } from '@/shared/store/demo'
import { Avatar, Page } from '@/shared/ui'
import { card } from '@/shared/ui/styles'

const NONE: string[] = []

export default function ProfilePage() {
  const user = useCurrentUser()
  const feed = useDemo((s) => s.feed)
  const tasks = useDemo((s) => s.tasks)
  const days = useDemo((s) => s.activity[s.userId] ?? NONE)
  const questions = useMemo(() => feed.filter((i): i is Question => i.type === 'question'), [feed])
  const badges = computeBadges(user.id, questions, tasks)
  const streak = computeStreak(days, dayKey())
  const replies = questions.reduce(
    (n, q) => n + q.comments.filter((c) => c.authorId === user.id).length,
    0,
  )
  const asked = questions.filter((q) => q.authorId === user.id).length
  const tasksDone = tasks.filter((t) => t.claimedBy === user.id && t.status === 'confirmed').length
  const nextTopic = (['Doubt', 'Prayer', 'Relationships', 'Anxiety'] as const)
    .map((t) => ({ t, n: repliesInTopic(user.id, questions, t) }))
    .filter((x) => x.n > 0 && x.n < TOPIC_REPLIES_NEEDED)
    .sort((a, b) => b.n - a.n)[0]

  return (
    <Page>
      <section className={`${card} p-6 flex flex-wrap items-center gap-4`}>
        <Avatar initials={user.initials} color={user.color} size="lg" />
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-3xl font-semibold text-fg">{user.name}</h1>
          <p className="text-sm text-sage">
            {ROLE_LABEL[user.role]} · {user.church}
          </p>
        </div>
        <dl className="grid grid-cols-4 gap-4 text-center">
          {[
            ['Streak', `🔥 ${streak.current}`],
            ['Asked', asked],
            ['Replies', replies],
            ['Tasks', tasksDone],
          ].map(([label, value]) => (
            <div key={label}>
              <dd className="font-serif text-2xl font-semibold text-fg">{value}</dd>
              <dt className="text-xs text-sage">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <section className={`${card} p-6`}>
          <h2 className="font-serif text-xl font-semibold text-fg flex items-center gap-2">
            <Award size={20} className="text-warn" /> Badges
          </h2>
          <p className="text-sm text-sage mb-4">Earned automatically from tasks and replies.</p>
          {badges.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {badges.map((b) => (
                <li key={b.id} className="rounded-xl border border-aiborder bg-aibg p-3">
                  <p className="font-medium text-fg">🏅 {b.label}</p>
                  <p className="text-xs text-sage">{b.detail}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 text-sm text-sage">
              <Lock size={14} /> No badges yet. Claim a tech task or encourage others on the Freedom
              Wall.
            </p>
          )}
          {nextTopic && (
            <p className="mt-4 text-xs text-sage">
              {TOPIC_REPLIES_NEEDED - nextTopic.n} more repl
              {TOPIC_REPLIES_NEEDED - nextTopic.n === 1 ? 'y' : 'ies'} to {nextTopic.t} questions to
              earn “Encourager · {nextTopic.t}”.
            </p>
          )}
        </section>
        <StreakCard days={days} name={user.name} />
      </div>
    </Page>
  )
}
