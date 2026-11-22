import { useState } from 'react'
import { CheckCircle2, Hourglass } from 'lucide-react'
import { timeAgo } from '@/shared/lib/dates'
import { useCurrentUser, useDemo } from '@/shared/store/demo'
import { Page } from '@/shared/ui'
import { btn, card, field, tag } from '@/shared/ui/styles'
import { activeCount, waitlistPosition, type PrayerRequest } from '../model/prayer'

const statusTag = (r: PrayerRequest) =>
  r.status === 'active' ? tag.green : r.status === 'waitlisted' ? tag.amber : tag.neutral

export default function RequestPage() {
  const user = useCurrentUser()
  const groups = useDemo((s) => s.prayerGroups)
  const requests = useDemo((s) => s.prayerRequests)
  const submitPrayer = useDemo((s) => s.submitPrayer)
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '')
  const [name, setName] = useState(user.name)
  const [anonymous, setAnonymous] = useState(false)
  const [text, setText] = useState('')
  const [visibility, setVisibility] = useState<'leaders' | 'group'>('group')
  const [submitted, setSubmitted] = useState<PrayerRequest | null>(null)

  const mine = requests.filter((r) => r.requesterId === user.id)
  const group = groups.find((g) => g.id === groupId)

  if (submitted) {
    const position = waitlistPosition(requests, submitted.id)
    const g = groups.find((x) => x.id === submitted.groupId)
    return (
      <Page>
        <FormShell>
          <div className="p-8 text-center">
            {submitted.status === 'active' ? (
              <CheckCircle2 size={40} className="mx-auto text-accent" />
            ) : (
              <Hourglass size={40} className="mx-auto text-warn" />
            )}
            <h2 className="font-serif text-2xl font-semibold text-fg mt-3">
              {submitted.status === 'active'
                ? 'Your request was received'
                : `You're #${position} on the waitlist`}
            </h2>
            <p className="text-sm text-sage mt-2 max-w-md mx-auto">
              {submitted.status === 'active'
                ? `${g?.name} leaders are praying and will check in with you within 3 days.`
                : `${g?.name} follows up ${g?.cap} requests at a time so nobody gets forgotten. Yours moves up as soon as a spot opens, and the leaders can already see it.`}
            </p>
            <button className={`${btn.secondary} mt-5`} onClick={() => setSubmitted(null)}>
              Submit another request
            </button>
          </div>
        </FormShell>
        <MyRequests mine={mine} requests={requests} />
      </Page>
    )
  }

  return (
    <Page>
      <FormShell>
        <div className="p-6 sm:p-8 border-b border-line">
          <h1 className="font-serif text-3xl font-semibold text-fg">Prayer Request Form</h1>
          <p className="text-sm text-sage mt-2">
            Share what you need prayer for. Your group leaders follow up every request, so nothing
            gets buried in the group chat.
          </p>
        </div>
        <form
          className="p-6 sm:p-8 flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (!text.trim()) return
            setSubmitted(submitPrayer({ groupId, name, anonymous, text, visibility }))
            setText('')
          }}
        >
          <Question label="Which group?">
            <div className="flex flex-col gap-2">
              {groups.map((g) => (
                <label key={g.id} className="flex items-center gap-3 text-sm">
                  <input
                    type="radio"
                    name="group"
                    checked={groupId === g.id}
                    onChange={() => setGroupId(g.id)}
                    className="accent-emerald h-4 w-4"
                  />
                  {g.name}
                  <span className="text-xs text-sage">
                    {activeCount(requests, g.id)}/{g.cap} spots in use
                  </span>
                </label>
              ))}
            </div>
            {group && activeCount(requests, group.id) >= group.cap && (
              <p className="mt-2 text-xs text-warn">
                This group is full right now. Your request will join the waitlist and move up
                automatically.
              </p>
            )}
          </Question>
          <Question label="Your name">
            <input
              className={field}
              value={name}
              disabled={anonymous}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-sage">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="accent-emerald h-4 w-4"
              />
              Show as “Anonymous” to the group
            </label>
          </Question>
          <Question label="Prayer request" required>
            <textarea
              required
              rows={4}
              className={`${field} resize-none`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What can we pray for?"
            />
          </Question>
          <Question label="Who can see it?">
            <div className="flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="vis"
                  checked={visibility === 'group'}
                  onChange={() => setVisibility('group')}
                  className="accent-emerald h-4 w-4"
                />
                My group (it appears on the prayer wall)
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="vis"
                  checked={visibility === 'leaders'}
                  onChange={() => setVisibility('leaders')}
                  className="accent-emerald h-4 w-4"
                />
                Leaders only (private)
              </label>
            </div>
          </Question>
          <button type="submit" className={`${btn.primary} self-start`} disabled={!text.trim()}>
            Submit
          </button>
        </form>
      </FormShell>
      <MyRequests mine={mine} requests={requests} />
    </Page>
  )
}

function FormShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${card} max-w-2xl mx-auto overflow-hidden`}>
      <div className="h-2.5 bg-emerald" />
      {children}
    </div>
  )
}

function Question({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <fieldset className="rounded-xl border border-line p-4">
      <legend className="px-1 text-sm font-medium text-fg">
        {label} {required && <span className="text-rose-500">*</span>}
      </legend>
      {children}
    </fieldset>
  )
}

function MyRequests({ mine, requests }: { mine: PrayerRequest[]; requests: PrayerRequest[] }) {
  if (!mine.length) return null
  return (
    <section className="max-w-2xl mx-auto mt-6">
      <h2 className="font-serif text-xl font-semibold text-fg mb-3">My requests</h2>
      <div className="flex flex-col gap-3">
        {mine.map((r) => {
          const pos = waitlistPosition(requests, r.id)
          const last = r.updates.at(-1)
          return (
            <div key={r.id} className={`${card} p-4`}>
              <div className="flex items-center justify-between gap-2 text-xs text-sage">
                <span>{timeAgo(r.createdAt)}</span>
                <span className={statusTag(r)}>
                  {r.status === 'waitlisted'
                    ? `Waitlist #${pos}`
                    : r.status === 'active'
                      ? 'Being prayed for'
                      : 'Answered 🙌'}
                </span>
              </div>
              <p className="text-sm text-fg/85 mt-2">{r.text}</p>
              {last && (
                <p className="mt-2 text-xs text-sage border-l-2 border-emerald/50 pl-2">
                  {last.by}: {last.text}
                </p>
              )}
              {r.prayedBy.length > 0 && (
                <p className="mt-2 text-xs text-accent">🙏 {r.prayedBy.length} praying</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
