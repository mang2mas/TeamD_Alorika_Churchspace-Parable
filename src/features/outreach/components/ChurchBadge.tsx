import { BadgeCheck, Clock } from 'lucide-react'
import { tag } from '@/shared/ui/styles'
import type { ChurchStatus } from '../model/outreach'

export default function ChurchBadge({ status }: { status: ChurchStatus }) {
  if (status === 'verified')
    return (
      <span className={tag.green}>
        <BadgeCheck size={11} className="inline mr-1" />
        Verified
      </span>
    )
  if (status === 'pending')
    return (
      <span className={tag.amber}>
        <Clock size={11} className="inline mr-1" />
        Pending verification
      </span>
    )
  return <span className={tag.neutral}>Unclaimed listing</span>
}
