import { useState } from 'react'
import { BookCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { VERSES, dayNumber, verseOfDay } from '@/shared/demo/verses'
import { dayKey } from '@/shared/lib/dates'
import { useCurrentUser, useDemo } from '@/shared/store/demo'
import { DemoNote, Page, PageHeader } from '@/shared/ui'
import { btn, card } from '@/shared/ui/styles'
import Flashcard from '../components/Flashcard'
import StreakCard from '../components/StreakCard'

const DECK = VERSES.slice(0, 7)
/** Stable empty list: a new [] on every render would make the store selector loop. */
const NO_DAYS: string[] = []

export default function TodayPage() {
  const user = useCurrentUser()
  const days = useDemo((s) => s.activity[s.userId] ?? NO_DAYS)
  const logReading = useDemo((s) => s.logReading)
  const today = verseOfDay(dayNumber())
  const doneToday = days.includes(dayKey())
  const [i, setI] = useState(0)
  const practice = DECK[i % DECK.length]!

  return (
    <Page>
      <PageHeader
        title="Daily Word"
        subtitle="One verse a day. Read it, keep your streak, and your discipler can see when you need a check-in."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Flashcard key={today.ref} verse={today} label="Today's verse" />
          <button className={btn.primary} onClick={logReading} disabled={doneToday}>
            <BookCheck size={16} />
            {doneToday ? 'Read today ✓' : 'I read today’s verse'}
          </button>
        </div>
        <StreakCard days={days} name={user.name} />
      </div>

      <section className={`${card} mt-6 p-6`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-fg">Practice deck</h2>
            <p className="text-sm text-sage">
              Starter deck · card {(i % DECK.length) + 1} of {DECK.length}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className={btn.secondary}
              aria-label="Previous card"
              onClick={() => setI((x) => (x - 1 + DECK.length) % DECK.length)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className={btn.secondary}
              aria-label="Next card"
              onClick={() => setI((x) => x + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <Flashcard key={practice.ref} verse={practice} label="Practice" />
      </section>

      <div className="mt-6">
        <DemoNote>
          Jessa has a 9-day streak that ends yesterday. Tap “I read today’s verse” to make it 10.
          Then switch to Ate Rina and open the Discipler dashboard to see who has gone quiet.
        </DemoNote>
      </div>
    </Page>
  )
}
