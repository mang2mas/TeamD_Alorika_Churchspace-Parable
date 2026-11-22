import { FileText, Phone } from 'lucide-react'
import { timeAgo } from '@/shared/lib/dates'
import { useDemo } from '@/shared/store/demo'
import { toast } from '@/shared/store/toast'
import { DemoNote, EmptyState, Page, PageHeader, RoleGate } from '@/shared/ui'
import { btn, card, tag } from '@/shared/ui/styles'

export default function VerifyPage() {
  const churches = useDemo((s) => s.churches)
  const claims = useDemo((s) => s.claims)
  const decide = useDemo((s) => s.decideClaim)
  const pending = claims.filter((c) => c.status === 'pending')
  const decided = claims.filter((c) => c.status !== 'pending')
  const church = (id: string) => churches.find((c) => c.id === id)

  return (
    <RoleGate allow={['moderator']} feature="Church claim verification">
      <Page>
        <PageHeader
          title="Verify church claims"
          subtitle="Nobody can manage a church listing until the Parable team checks the claim."
        />
        <div className="flex flex-col gap-4">
          {pending.map((c) => (
            <article key={c.id} className={`${card} p-6 flex flex-col gap-3`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-xl font-semibold text-fg">
                  {church(c.churchId)?.name}
                </h2>
                <span className={tag.amber}>Pending · {timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-sm text-fg/80">
                <span className="font-medium">{c.claimantName}</span> · {c.role} · {c.contact}
              </p>
              <p className="flex items-center gap-2 text-sm text-sage">
                <FileText size={14} /> {c.evidence}
              </p>
              <ol className="text-xs text-sage list-decimal pl-5 space-y-0.5">
                <li>Check the document matches the church name and a real leader.</li>
                <li>
                  <Phone size={11} className="inline mr-1" />
                  Call the church's public number (found independently, not from the form) to
                  confirm.
                </li>
                <li>Approve only when both match.</li>
              </ol>
              <div className="flex gap-2">
                <button
                  className={btn.primary}
                  onClick={() => {
                    decide(c.id, true)
                    toast(`${church(c.churchId)?.name} is now verified`)
                  }}
                >
                  Approve
                </button>
                <button
                  className={btn.danger}
                  onClick={() => {
                    decide(c.id, false)
                    toast('Claim rejected. The listing is unclaimed again.')
                  }}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
        {!pending.length && <EmptyState title="No claims waiting" />}
        {decided.length > 0 && (
          <>
            <h2 className="font-serif text-lg text-fg mt-8 mb-2">Decided</h2>
            <ul className="text-sm text-sage space-y-1">
              {decided.map((c) => (
                <li key={c.id}>
                  {church(c.churchId)?.name} · {c.claimantName} ·{' '}
                  <span className={c.status === 'approved' ? 'text-accent' : ''}>{c.status}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-6">
          <DemoNote>
            Try it: as any user, open “Hope Chapel San Pedro” in Find churches and claim it. Then
            switch to the moderator and approve it here.
          </DemoNote>
        </div>
      </Page>
    </RoleGate>
  )
}
