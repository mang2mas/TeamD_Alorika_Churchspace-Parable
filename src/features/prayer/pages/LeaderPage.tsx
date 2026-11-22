import { useState } from 'react'
import { BellRing, Lock, Minus, Plus } from 'lucide-react'
import { timeAgo } from '@/shared/lib/dates'
import { useDemo } from '@/shared/store/demo'
import { toast } from '@/shared/store/toast'
import { DemoNote, EmptyState, Page, PageHeader, RoleGate } from '@/shared/ui'
import { btn, card, chip, field, tag } from '@/shared/ui/styles'
import {
  CHECK_IN_AFTER_DAYS,
  activeCount,
  daysWithoutUpdate,
  needsCheckIn,
  waitlist,
  type PrayerRequest,
} from '../model/prayer'

type Tab = 'active' | 'waitlisted' | 'answered'

export default function LeaderPage() {
  const groups = useDemo((s) => s.prayerGroups)
  const requests = useDemo((s) => s.prayerRequests)
  const setCap = useDemo((s) => s.setCap)
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '')
  const [tab, setTab] = useState<Tab>('active')
  const group = groups.find((g) => g.id === groupId)
  if (!group) return null

  const inGroup = requests.filter((r) => r.groupId === groupId)
  const active = inGroup.filter((r) => r.status === 'active')
  const waiting = waitlist(requests, groupId)
  const answered = inGroup.filter((r) => r.status === 'answered')
  const overdue = active.filter((r) => needsCheckIn(r)).length
  const list = tab === 'active' ? active : tab === 'waitlisted' ? waiting : answered

  return (
    <RoleGate allow={['leader']} feature="Prayer leader view">
      <Page>
        <PageHeader
          title="Leader view"
          subtitle={`Every request gets followed up. Requests without an update for ${CHECK_IN_AFTER_DAYS}+ days are flagged for a check-in.`}
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {groups.map((g) => (
            <button
              key={g.id}
              className={chip(groupId === g.id)}
              aria-pressed={groupId === g.id}
              onClick={() => setGroupId(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-4 mb-6">
          <div className={`${card} p-4`}>
            <p className="text-xs text-sage">Active spots</p>
            <p className="font-serif text-2xl font-semibold text-fg">
              {activeCount(requests, groupId)} / {group.cap}
            </p>
          </div>
          <div className={`${card} p-4`}>
            <p className="text-xs text-sage">Waitlist</p>
            <p className="font-serif text-2xl font-semibold text-fg">{waiting.length}</p>
          </div>
          <div className={`${card} p-4`}>
            <p className="text-xs text-sage">Need check-in</p>
            <p className={`font-serif text-2xl font-semibold ${overdue ? 'text-warn' : 'text-fg'}`}>
              {overdue}
            </p>
          </div>
          <div className={`${card} p-4`}>
            <p className="text-xs text-sage">Group cap</p>
            <div className="flex items-center gap-2 mt-1">
              <button
                className={btn.secondary}
                aria-label="Lower cap"
                onClick={() => setCap(groupId, group.cap - 1)}
              >
                <Minus size={14} />
              </button>
              <span className="font-serif text-2xl font-semibold text-fg w-8 text-center">
                {group.cap}
              </span>
              <button
                className={btn.secondary}
                aria-label="Raise cap"
                onClick={() => {
                  setCap(groupId, group.cap + 1)
                  if (waiting.length)
                    toast('Cap raised. The next waitlisted request is now active.')
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {(
            [
              ['active', `Active (${active.length})`],
              ['waitlisted', `Waitlist (${waiting.length})`],
              ['answered', `Answered (${answered.length})`],
            ] as const
          ).map(([t, label]) => (
            <button
              key={t}
              className={chip(tab === t)}
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {list.map((r, i) => (
            <RequestRow key={r.id} r={r} position={tab === 'waitlisted' ? i + 1 : undefined} />
          ))}
        </div>
        {!list.length && <EmptyState title="Nothing here" />}
        <div className="mt-6">
          <DemoNote>
            Calamba Youth is full (5/5) with 2 waiting. Mark a request answered and watch the next
            one move up automatically. In the real app, overdue check-ins also send the leader a
            reminder.
          </DemoNote>
        </div>
      </Page>
    </RoleGate>
  )
}

function RequestRow({ r, position }: { r: PrayerRequest; position?: number }) {
  const checkInPrayer = useDemo((s) => s.checkInPrayer)
  const answerPrayer = useDemo((s) => s.answerPrayer)
  const [mode, setMode] = useState<'none' | 'checkin' | 'answer'>('none')
  const [note, setNote] = useState('')
  const overdue = needsCheckIn(r)
  const days = daysWithoutUpdate(r)

  const save = () => {
    if (!note.trim()) return
    if (mode === 'checkin') {
      checkInPrayer(r.id, note.trim())
      toast('Check-in saved. The 3-day timer is reset.')
    } else {
      const someoneWaiting = waitlist(useDemo.getState().prayerRequests, r.groupId).length > 0
      answerPrayer(r.id, note.trim())
      toast(
        someoneWaiting
          ? 'Marked answered 🙌 The next waitlisted request moved up.'
          : 'Marked answered 🙌',
      )
    }
    setMode('none')
    setNote('')
  }

  return (
    <article className={`${card} p-5 ${overdue ? 'border-amber/60' : ''}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-sage">
        {position && <span className={tag.amber}>#{position} in line</span>}
        <span className="font-medium text-fg/80">{r.displayName}</span>
        <span>· {timeAgo(r.createdAt)}</span>
        {r.visibility === 'leaders' && (
          <span className={tag.neutral}>
            <Lock size={10} className="inline mr-1" />
            Leaders only
          </span>
        )}
        {overdue && (
          <span className={tag.amber}>
            <BellRing size={10} className="inline mr-1" />
            Needs check-in · {days} days
          </span>
        )}
        {r.status === 'active' && !overdue && (
          <span>Last update {days === 0 ? 'today' : `${days}d ago`}</span>
        )}
      </div>
      <p className="text-sm text-fg/85 mt-2">{r.text}</p>
      {r.updates.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {r.updates.map((u) => (
            <li key={u.id} className="text-xs text-sage border-l-2 border-emerald/50 pl-2">
              {u.by} · {timeAgo(u.at)}: {u.text}
            </li>
          ))}
        </ul>
      )}
      {r.status === 'active' && mode === 'none' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className={overdue ? btn.primary : btn.secondary}
            onClick={() => setMode('checkin')}
          >
            Check in
          </button>
          <button className={btn.secondary} onClick={() => setMode('answer')}>
            Mark answered
          </button>
        </div>
      )}
      {mode !== 'none' && (
        <div className="mt-3 flex flex-col gap-2">
          <input
            autoFocus
            className={field}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder={
              mode === 'checkin'
                ? 'e.g. Messaged her today, still waiting on results'
                : 'e.g. She passed the board exam!'
            }
          />
          <div className="flex gap-2">
            <button className={btn.primary} onClick={save} disabled={!note.trim()}>
              Save
            </button>
            <button className={btn.ghost} onClick={() => setMode('none')}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
