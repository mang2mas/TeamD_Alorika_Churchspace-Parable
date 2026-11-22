import { useMemo, useState } from 'react'
import { Clock, Handshake, MapPin, Search, ShieldCheck, Users } from 'lucide-react'
import { can, ROLE_LABEL } from '@/shared/demo/users'
import { daysAgoKey } from '@/shared/lib/dates'
import { useCurrentUser, useDemo } from '@/shared/store/demo'
import { toast } from '@/shared/store/toast'
import { DemoNote, EmptyState, Modal, Page, PageHeader } from '@/shared/ui'
import { btn, card, field, tag } from '@/shared/ui/styles'
import ChurchBadge from '../components/ChurchBadge'
import {
  MY_CHURCH_ID,
  OUTREACH_TYPES,
  SHARES,
  TOWNS,
  filterChurches,
  type Church,
  type ChurchFilter,
  type OutreachType,
} from '../model/outreach'

export default function DirectoryPage() {
  const churches = useDemo((s) => s.churches)
  const [filter, setFilter] = useState<ChurchFilter>({
    town: 'All',
    share: 'Any',
    openTo: 'Any',
    query: '',
  })
  const [openId, setOpenId] = useState<string | null>(null)
  const shown = useMemo(() => filterChurches(churches, filter), [churches, filter])
  const set = <K extends keyof ChurchFilter>(k: K, v: ChurchFilter[K]) =>
    setFilter((f) => ({ ...f, [k]: v }))
  const open = churches.find((c) => c.id === openId)

  return (
    <Page>
      <PageHeader
        title="Outreach Finder"
        subtitle="Find churches across Laguna by town, what they can share and the outreaches they're open to. Then ask to partner."
      />
      <div className={`${card} p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5`}>
        <label className="relative">
          <span className="sr-only">Search churches</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
          <input
            className={`${field} pl-9`}
            placeholder="Search by name"
            value={filter.query}
            onChange={(e) => set('query', e.target.value)}
          />
        </label>
        <label className="text-xs text-sage">
          <span className="sr-only">Town</span>
          <select
            className={field}
            value={filter.town}
            onChange={(e) => set('town', e.target.value as ChurchFilter['town'])}
          >
            <option value="All">All towns</option>
            {TOWNS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-sage">
          <span className="sr-only">Can share</span>
          <select
            className={field}
            value={filter.share}
            onChange={(e) => set('share', e.target.value as ChurchFilter['share'])}
          >
            <option value="Any">Can share: anything</option>
            {SHARES.map((s) => (
              <option key={s} value={s}>
                Can share: {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-sage">
          <span className="sr-only">Open to</span>
          <select
            className={field}
            value={filter.openTo}
            onChange={(e) => set('openTo', e.target.value as ChurchFilter['openTo'])}
          >
            <option value="Any">Open to: any outreach</option>
            {OUTREACH_TYPES.map((o) => (
              <option key={o} value={o}>
                Open to: {o}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-sm text-sage mb-3">
        {shown.length} church{shown.length === 1 ? '' : 'es'}
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <button
            key={c.id}
            onClick={() => setOpenId(c.id)}
            className={`${card} p-5 text-left flex flex-col gap-3 hover:border-emerald/40`}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-serif text-lg font-semibold text-fg leading-snug">{c.name}</h2>
              {c.id === MY_CHURCH_ID && <span className={tag.neutral}>Your church</span>}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-sage">
              <MapPin size={12} /> {c.town} · {c.denomination}
            </p>
            <ChurchBadge status={c.status} />
            <div className="flex flex-wrap gap-1.5">
              {c.shares.slice(0, 3).map((s) => (
                <span key={s} className={tag.neutral}>
                  {s}
                </span>
              ))}
            </div>
            <p className="text-xs text-sage">Open to: {c.openTo.join(', ')}</p>
          </button>
        ))}
      </div>
      {!shown.length && <EmptyState title="No churches match" body="Try another town or filter." />}
      <div className="mt-6">
        <DemoNote>All churches here are fictional sample data for the demo.</DemoNote>
      </div>
      {open && <ChurchSheet church={open} onClose={() => setOpenId(null)} />}
    </Page>
  )
}

function ChurchSheet({ church, onClose }: { church: Church; onClose: () => void }) {
  const user = useCurrentUser()
  const [mode, setMode] = useState<'info' | 'partner' | 'claim'>('info')
  const isMine = church.id === MY_CHURCH_ID

  return (
    <Modal title={church.name} onClose={onClose} wide>
      {mode === 'info' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-sage">
            <MapPin size={14} /> {church.town}, Laguna · {church.denomination}
            <ChurchBadge status={church.status} />
          </div>
          <p className="text-fg/85">{church.about}</p>
          <p className="flex items-center gap-2 text-sm text-sage">
            <Clock size={14} /> {church.services}
          </p>
          <p className="flex items-center gap-2 text-sm text-sage">
            <Users size={14} /> {church.size}
          </p>
          <div>
            <h3 className="text-sm font-medium text-fg mb-1.5">Can share</h3>
            <div className="flex flex-wrap gap-1.5">
              {church.shares.map((s) => (
                <span key={s} className={tag.green}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-fg mb-1.5">Open to</h3>
            <div className="flex flex-wrap gap-1.5">
              {church.openTo.map((o) => (
                <span key={o} className={tag.amber}>
                  {o}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {!isMine && church.status !== 'unclaimed' && (
              <button
                className={btn.primary}
                disabled={!can.requestPartner(user.role)}
                onClick={() => setMode('partner')}
                title={
                  can.requestPartner(user.role)
                    ? undefined
                    : 'Church admins and leaders can send partner requests'
                }
              >
                <Handshake size={16} /> Request to partner
              </button>
            )}
            {church.status === 'unclaimed' && (
              <button className={btn.primary} onClick={() => setMode('claim')}>
                <ShieldCheck size={16} /> Claim this church
              </button>
            )}
          </div>
          {!isMine && church.status !== 'unclaimed' && !can.requestPartner(user.role) && (
            <p className="text-xs text-sage">
              You are viewing as {ROLE_LABEL[user.role]}. Switch to Ptr. Daniel (Church Admin) or
              Ate Rina (Leader) to send a partner request.
            </p>
          )}
          {church.status === 'unclaimed' && (
            <p className="text-xs text-sage">
              Nobody manages this listing yet. Partner requests open once a church member claims it
              and our team verifies them.
            </p>
          )}
        </div>
      )}
      {mode === 'partner' && (
        <PartnerForm church={church} onDone={onClose} onBack={() => setMode('info')} />
      )}
      {mode === 'claim' && (
        <ClaimForm church={church} onDone={onClose} onBack={() => setMode('info')} />
      )}
    </Modal>
  )
}

function PartnerForm({
  church,
  onDone,
  onBack,
}: {
  church: Church
  onDone: () => void
  onBack: () => void
}) {
  const requestPartner = useDemo((s) => s.requestPartner)
  const [type, setType] = useState<OutreachType>(church.openTo[0] ?? 'Feeding program')
  const [date, setDate] = useState(daysAgoKey(-14))
  const [message, setMessage] = useState('')
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        requestPartner(church.id, type, date, message.trim())
        toast(`Partner request sent to ${church.name}`)
        onDone()
      }}
    >
      <p className="text-sm text-sage">From Grace Fellowship Calamba to {church.name}</p>
      <label className="text-sm">
        Outreach
        <select
          className={`${field} mt-1`}
          value={type}
          onChange={(e) => setType(e.target.value as OutreachType)}
        >
          {OUTREACH_TYPES.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Proposed date
        <input
          type="date"
          className={`${field} mt-1`}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <label className="text-sm">
        Message
        <textarea
          required
          rows={4}
          className={`${field} mt-1 resize-none`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What you are planning, how many people, and what you can bring."
        />
      </label>
      <div className="flex gap-2">
        <button type="submit" className={btn.primary} disabled={!message.trim()}>
          Send request
        </button>
        <button type="button" className={btn.ghost} onClick={onBack}>
          Back
        </button>
      </div>
    </form>
  )
}

function ClaimForm({
  church,
  onDone,
  onBack,
}: {
  church: Church
  onDone: () => void
  onBack: () => void
}) {
  const claimChurch = useDemo((s) => s.claimChurch)
  const [role, setRole] = useState('')
  const [contact, setContact] = useState('')
  const [evidence, setEvidence] = useState('')
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        claimChurch(church.id, { role: role.trim(), contact: contact.trim(), evidence })
        toast('Claim submitted. Our team will verify it before you can manage the listing.')
        onDone()
      }}
    >
      <p className="text-sm text-sage">
        To stop impersonation, every claim is checked by the Parable team (we call the church's
        public number) before anyone can manage a listing.
      </p>
      <label className="text-sm">
        Your role at {church.name}
        <input
          required
          className={`${field} mt-1`}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Senior pastor, church secretary"
        />
      </label>
      <label className="text-sm">
        Contact email or number
        <input
          required
          className={`${field} mt-1`}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
      </label>
      <label className="text-sm">
        Proof (letter on church letterhead, or denomination/SEC registration)
        <input
          type="file"
          accept=".pdf,image/*"
          className="mt-1 block w-full text-sm text-sage file:mr-3 file:rounded-full file:border-0 file:bg-emerald/20 file:px-4 file:py-2 file:text-accent"
          onChange={(e) => setEvidence(e.target.files?.[0]?.name ?? '')}
        />
        <span className="text-xs text-sage">
          Demo: only the file name is kept; nothing is uploaded.
        </span>
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className={btn.primary}
          disabled={!role.trim() || !contact.trim() || !evidence}
        >
          Submit claim
        </button>
        <button type="button" className={btn.ghost} onClick={onBack}>
          Back
        </button>
      </div>
    </form>
  )
}
