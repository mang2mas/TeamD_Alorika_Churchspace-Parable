import { Share2 } from 'lucide-react'
import { badge } from '../model/media'
import type { Media } from '../model/types'

export function Cover({ m, className = '' }: { m: Media; className?: string }) {
  return (
    <img src={m.cover} alt="" loading="lazy" className={`w-full object-cover bg-card ${className}`}
      onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
  )
}

interface Props {
  m: Media
  onOpen: (id: string) => void
  onShare: (m: Media) => void
}

export default function MediaCard({ m, onOpen, onShare }: Props) {
  const open = () => onOpen(m.id)
  return (
    <article onClick={open} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open()}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-card border border-line shadow-card hover:border-emerald/40 transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-emerald">
      <div className="relative">
        <Cover m={m} className="aspect-4/3" />
        <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs text-white">{badge(m)}</span>
        <button onClick={(e) => { e.stopPropagation(); onShare(m) }}
          className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 text-[#071917] text-xs font-medium px-3 py-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <Share2 size={12} /> Share
        </button>
      </div>
      <div className="p-5 flex flex-col gap-2">
        <h3 className="font-serif text-lg font-semibold leading-snug text-fg">{m.title}</h3>
        <div className="flex items-center justify-between text-xs text-sage">
          <span>{m.creator}</span>
          <span className="rounded-full border border-line px-2.5 py-0.5">{m.topic}</span>
        </div>
      </div>
    </article>
  )
}
