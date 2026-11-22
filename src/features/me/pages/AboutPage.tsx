import { Link } from 'react-router'
import { Page, PageHeader } from '@/shared/ui'
import { card } from '@/shared/ui/styles'

const PROBLEMS: { problem: string; answer: string; to: string; app: string }[] = [
  {
    problem: 'Youth have faith questions but won’t ask in person.',
    answer: 'Anonymous questions on the Freedom Wall, answered by local leaders within a day.',
    to: '/forum',
    app: 'Forum',
  },
  {
    problem: 'Members want to share their faith online but don’t know what to post.',
    answer: 'Daily post ideas with ready-to-copy captions.',
    to: '/forum/ideas',
    app: 'Forum · Post ideas',
  },
  {
    problem: 'New believers drop off after week one, and disciplers can’t follow up with everyone.',
    answer:
      'Daily verse cards with streaks, plus a discipler dashboard that shows who has gone quiet.',
    to: '/daily',
    app: 'Daily Word',
  },
  {
    problem: 'Churches across the Philippines can’t find each other when planning outreaches.',
    answer: 'A directory of churches by town, what they can share, and a request-to-partner flow.',
    to: '/outreach',
    app: 'Outreach Finder',
  },
  {
    problem: 'Prayer requests get buried in group chats and nobody follows up.',
    answer: 'A prayer form with a per-group cap, a waitlist, and check-in reminders for leaders.',
    to: '/prayer',
    app: 'Prayer Requests',
  },
  {
    problem: 'Churches need tech help but can’t find students with the skills.',
    answer: 'Tech task requests that students claim, with skill badges for finished work.',
    to: '/forum/tasks',
    app: 'Forum · Tech tasks',
  },
  {
    problem: 'The Sunday message is forgotten by Monday.',
    answer: 'Sermon notes in, verse cards, quote cards and captions out, exportable as images.',
    to: '/daily/sunday',
    app: 'Sunday Message to Cards',
  },
]

export default function AboutPage() {
  return (
    <Page>
      <PageHeader
        title="About Parable"
        subtitle="A workspace for local churches, youth and their communities in Laguna, Philippines. Built by Team D at HackLaguna."
      />
      <h2 className="font-serif text-xl font-semibold text-fg mb-3">
        Seven real problems we solve
      </h2>
      <ol className="grid gap-4 md:grid-cols-2">
        {PROBLEMS.map((p, i) => (
          <li key={p.problem} className={`${card} p-5`}>
            <p className="text-xs text-sage">Problem {i + 1}</p>
            <p className="font-serif text-lg text-fg leading-snug mt-1">{p.problem}</p>
            <p className="text-sm text-fg/75 mt-2">{p.answer}</p>
            <Link
              to={p.to}
              className="inline-block mt-3 text-sm font-medium text-accent hover:underline"
            >
              Open {p.app} →
            </Link>
          </li>
        ))}
      </ol>
      <section className={`${card} p-5 mt-6 text-sm text-fg/75 space-y-2`}>
        <h2 className="font-serif text-lg text-fg">About this demo</h2>
        <p>
          Everything runs in your browser on sample data. Nothing is sent to a server. Use the “View
          as” switch at the top to see the app as a youth member, a discipler, a media volunteer, a
          church admin or a moderator.
        </p>
        <p>
          All churches and people in the demo are fictional. Bible verses are KJV (public domain).
        </p>
      </section>
    </Page>
  )
}
