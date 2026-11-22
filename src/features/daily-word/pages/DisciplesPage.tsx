import { useState } from 'react'
import { Bell, CheckCheck, Send } from 'lucide-react'
import { dayNumber, verseOfDay } from '@/shared/demo/verses'
import { dayKey, timeAgo } from '@/shared/lib/dates'
import { useCurrentUser, useDemo } from '@/shared/store/demo'
import { toast } from '@/shared/store/toast'
import { Avatar, DemoNote, Modal, Page, PageHeader, RoleGate } from '@/shared/ui'
import { btn, card, field, tag } from '@/shared/ui/styles'
import {
  QUIET_AFTER_DAYS,
  discipleStatus,
  nudgeTemplate,
  type Disciple,
  type DiscipleGroup,
  type DiscipleStatus,
} from '../model/disciples'
import { computeStreak } from '../model/streak'

const GROUPS: { id: DiscipleGroup; title: string; hint: string }[] = [
  {
    id: 'quiet',
    title: `Gone quiet (${QUIET_AFTER_DAYS}+ days)`,
    hint: 'Reach out first. A short, personal message works best.',
  },
  {
    id: 'new',
    title: 'New this week',
    hint: 'New believers drop off after week one. Check in early.',
  },
  { id: 'active', title: 'On track', hint: 'Reading regularly. Encourage them!' },
]

const NONE: string[] = []

export default function DisciplesPage() {
  const user = useCurrentUser()
  const disciples = useDemo((s) => s.disciples)
  const activity = useDemo((s) => s.activity)
  const nudges = useDemo((s) => s.nudges)
  const markReplied = useDemo((s) => s.markReplied)
  const [nudging, setNudging] = useState<Disciple | null>(null)
  const today = dayKey()

  const mine = disciples
    .filter((d) => d.disciplerId === user.id)
    .map((d) => ({ d, st: discipleStatus(d, activity[d.id] ?? NONE, today) }))
  const counts = {
    quiet: mine.filter((x) => x.st.group === 'quiet').length,
    replied: mine.filter((x) => x.st.replied).length,
  }

  return (
    <RoleGate allow={['leader']} feature="Discipler dashboard">
      <Page>
        <PageHeader
          title="Your disciples"
          subtitle="You can't follow up with everyone by memory. This shows who is reading, who replied, and who has gone quiet."
        />
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Stat label="Disciples" value={mine.length} />
          <Stat label="Gone quiet" value={counts.quiet} warn={counts.quiet > 0} />
          <Stat label="Replied to you" value={counts.replied} />
        </div>

        {GROUPS.map((g) => {
          const rows = mine.filter((x) => x.st.group === g.id)
          if (!rows.length) return null
          return (
            <section key={g.id} className="mb-6">
              <h2 className="font-serif text-xl font-semibold text-fg">{g.title}</h2>
              <p className="text-sm text-sage mb-3">{g.hint}</p>
              <div className="flex flex-col gap-3">
                {rows.map(({ d, st }) => (
                  <DiscipleRow
                    key={d.id}
                    d={d}
                    st={st}
                    streak={computeStreak(activity[d.id] ?? NONE, today).current}
                    onNudge={() => setNudging(d)}
                    onReplied={() => {
                      markReplied(d.id)
                      toast(`Marked ${d.name} as replied`)
                    }}
                  />
                ))}
              </div>
            </section>
          )
        })}

        {nudges.length > 0 && (
          <section className={`${card} p-5 mb-6`}>
            <h2 className="font-serif text-lg text-fg mb-2">Nudges you sent</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {nudges.slice(0, 5).map((n) => (
                <li key={n.id} className="border-l-2 border-line pl-3">
                  <span className="text-xs text-sage">
                    To {disciples.find((d) => d.id === n.discipleId)?.name} · {timeAgo(n.at)}
                  </span>
                  <p className="text-fg/80">{n.message}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <DemoNote>
          Nudges are logged here. The real app delivers them as a push notification to the disciple.
          “Mark replied” records that they answered you (by chat, in person, etc.).
        </DemoNote>
        {nudging && <NudgeModal disciple={nudging} onClose={() => setNudging(null)} />}
      </Page>
    </RoleGate>
  )
}

function Stat({ label, value, warn = false }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className={`${card} p-4 text-center`}>
      <p className={`font-serif text-3xl font-semibold ${warn ? 'text-warn' : 'text-fg'}`}>
        {value}
      </p>
      <p className="text-xs text-sage">{label}</p>
    </div>
  )
}

function DiscipleRow({
  d,
  st,
  streak,
  onNudge,
  onReplied,
}: {
  d: Disciple
  st: DiscipleStatus
  streak: number
  onNudge: () => void
  onReplied: () => void
}) {
  const lastSeen =
    st.daysSinceActive === 0
      ? 'Read today'
      : `Last read ${st.daysSinceActive} day${st.daysSinceActive === 1 ? '' : 's'} ago`
  return (
    <div className={`${card} p-4 flex flex-wrap items-center gap-3`}>
      <Avatar
        initials={d.name.slice(0, 1)}
        color={st.group === 'quiet' ? 'bg-amber' : 'bg-emerald'}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-fg">{d.name}</p>
        <p className="text-xs text-sage">
          {st.lastActive ? lastSeen : 'Has not read yet'} · 🔥 {streak}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {st.replied && <span className={tag.green}>Replied ✓</span>}
        {st.nudgedToday && <span className={tag.neutral}>Nudged today</span>}
        {d.lastNudgeAt && !st.replied && (
          <button className={btn.ghost} onClick={onReplied}>
            <CheckCheck size={14} /> Mark replied
          </button>
        )}
        <button className={st.group === 'quiet' ? btn.primary : btn.secondary} onClick={onNudge}>
          <Bell size={14} /> Nudge
        </button>
      </div>
    </div>
  )
}

function NudgeModal({ disciple, onClose }: { disciple: Disciple; onClose: () => void }) {
  const nudge = useDemo((s) => s.nudge)
  const [message, setMessage] = useState(nudgeTemplate(disciple.name, verseOfDay(dayNumber()).ref))
  return (
    <Modal title={`Nudge ${disciple.name}`} onClose={onClose}>
      <label className="text-sm">
        Message
        <textarea
          rows={4}
          className={`${field} mt-1 resize-none`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      <button
        className={`${btn.primary} mt-4 w-full`}
        disabled={!message.trim()}
        onClick={() => {
          nudge(disciple.id, message.trim())
          toast(`Nudge sent to ${disciple.name}`)
          onClose()
        }}
      >
        <Send size={14} /> Send nudge
      </button>
    </Modal>
  )
}
