import { Flame } from 'lucide-react'
import { dayKey } from '@/shared/lib/dates'
import { card } from '@/shared/ui/styles'
import { computeStreak, heatmap } from '../model/streak'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function StreakCard({ days, name }: { days: string[]; name?: string }) {
  const today = dayKey()
  const { current, longest, doneToday } = computeStreak(days, today)
  const weeks = heatmap(days, today, 12)
  return (
    <section className={`${card} p-6`} aria-label="Reading streak">
      <div className="flex items-center gap-4">
        <span
          className={`grid place-items-center h-14 w-14 rounded-2xl ${
            current > 0 ? 'bg-amber/20 text-warn' : 'bg-fg/5 text-sage'
          }`}
        >
          <Flame size={30} fill={current > 0 ? 'currentColor' : 'none'} />
        </span>
        <div>
          <p className="font-serif text-3xl font-semibold text-fg">
            {current} day{current === 1 ? '' : 's'}
          </p>
          <p className="text-sm text-sage">
            {name ? `${name}'s streak` : 'Current streak'} · longest {longest}
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs border ${
            doneToday
              ? 'text-accent border-emerald/40 bg-emerald/10'
              : 'text-warn border-amber/40 bg-amber/10'
          }`}
        >
          {doneToday ? 'Done today ✓' : current > 0 ? 'Read today to keep it' : 'Start today'}
        </span>
      </div>

      <div className="mt-5 flex gap-1 overflow-x-auto no-scrollbar" aria-hidden="true">
        <div className="flex flex-col gap-1 pr-1 text-[9px] leading-3 text-sage">
          {DOW.map((d, i) => (
            <span key={i} className="h-3">
              {i % 2 ? d : ''}
            </span>
          ))}
        </div>
        {weeks.map((week, w) => (
          <div key={w} className="flex flex-col gap-1">
            {week.map((cell) => (
              <span
                key={cell.key}
                title={cell.key}
                className={`h-3 w-3 rounded-[3px] ${
                  cell.future ? 'bg-transparent' : cell.on ? 'bg-emerald' : 'bg-fg/10'
                } ${cell.key === today ? 'ring-1 ring-fg/60' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-sage">Last 12 weeks · each green square is a day you read</p>
    </section>
  )
}
