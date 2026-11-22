import { CalendarDays } from 'lucide-react'
import { formatDate, timeAgo } from '@/shared/lib/dates'
import { useDemo } from '@/shared/store/demo'
import { toast } from '@/shared/store/toast'
import { EmptyState, Page, PageHeader, RoleGate } from '@/shared/ui'
import { btn, card, tag } from '@/shared/ui/styles'
import { MY_CHURCH_ID, type PartnerRequest } from '../model/outreach'

const statusTag = (s: PartnerRequest['status']) =>
  s === 'accepted' ? tag.green : s === 'declined' ? tag.neutral : tag.amber

export default function InboxPage() {
  const churches = useDemo((s) => s.churches)
  const requests = useDemo((s) => s.partnerRequests)
  const respond = useDemo((s) => s.respondPartner)
  const nameOf = (id: string) => churches.find((c) => c.id === id)?.name ?? 'Unknown church'
  const incoming = requests.filter((r) => r.toChurchId === MY_CHURCH_ID)
  const sent = requests.filter((r) => r.fromChurchId === MY_CHURCH_ID)

  const Row = ({
    r,
    otherId,
    actions,
  }: {
    r: PartnerRequest
    otherId: string
    actions: boolean
  }) => (
    <article className={`${card} p-5 flex flex-col gap-2`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-lg font-semibold text-fg">{nameOf(otherId)}</h3>
        <span className={statusTag(r.status)}>
          {r.status[0]!.toUpperCase() + r.status.slice(1)}
        </span>
      </div>
      <p className="flex flex-wrap items-center gap-2 text-xs text-sage">
        <span className={tag.green}>{r.type}</span>
        <CalendarDays size={12} /> {formatDate(r.date)} · sent {timeAgo(r.createdAt)}
      </p>
      <p className="text-sm text-fg/80">{r.message}</p>
      {actions && r.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <button
            className={btn.primary}
            onClick={() => {
              respond(r.id, true)
              toast(`Accepted. ${nameOf(otherId)} will be notified.`)
            }}
          >
            Accept
          </button>
          <button className={btn.secondary} onClick={() => respond(r.id, false)}>
            Decline
          </button>
        </div>
      )}
    </article>
  )

  return (
    <RoleGate allow={['admin']} feature="Partner inbox">
      <Page>
        <PageHeader
          title="Partner inbox"
          subtitle="Outreach partnership requests for Grace Fellowship Calamba."
        />
        <h2 className="font-serif text-xl font-semibold text-fg mb-3">Received</h2>
        <div className="flex flex-col gap-3">
          {incoming.map((r) => (
            <Row key={r.id} r={r} otherId={r.fromChurchId} actions />
          ))}
        </div>
        {!incoming.length && <EmptyState title="No requests yet" />}
        <h2 className="font-serif text-xl font-semibold text-fg mt-8 mb-3">Sent</h2>
        <div className="flex flex-col gap-3">
          {sent.map((r) => (
            <Row key={r.id} r={r} otherId={r.toChurchId} actions={false} />
          ))}
        </div>
        {!sent.length && <EmptyState title="You haven't sent any requests" />}
      </Page>
    </RoleGate>
  )
}
