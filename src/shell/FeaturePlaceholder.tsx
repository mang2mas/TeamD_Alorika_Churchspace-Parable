import { Hammer } from 'lucide-react'
import type { Module } from './Navbar'

const COPY: Record<Exclude<Module, 'Sanctuary'>, string> = {
  Mentorship: 'Match with an older believer for one-on-one guidance.',
  Outreach: 'Organize service days and invite your community.',
}

interface Props {
  name: Exclude<Module, 'Sanctuary'>
  onBack: () => void
}

export default function FeaturePlaceholder({ name, onBack }: Props) {
  return (
    <div className="max-w-md mx-auto px-4 py-28 text-center">
      <Hammer className="mx-auto mb-4 text-warn" />
      <h2 className="font-serif text-3xl font-semibold text-fg">{name} is coming soon</h2>
      <p className="mt-2 text-sage text-sm">{COPY[name]}</p>
      <button onClick={onBack} className="mt-6 rounded-full border border-line px-5 py-2 text-sm hover:bg-fg/5">Back to Sanctuary</button>
    </div>
  )
}
