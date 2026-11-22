import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { TRANSLATION, type Verse } from '@/shared/demo/verses'

/** Front: the reference (try to recall it). Back: the verse. Tap to flip. */
export default function Flashcard({ verse, label }: { verse: Verse; label?: string }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={flipped ? `${verse.ref}: ${verse.text}` : `${verse.ref}. Tap to reveal the verse`}
      className={`w-full min-h-64 rounded-2xl border p-7 text-left flex flex-col justify-between gap-4 transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-emerald ${
        flipped ? 'bg-aibg border-aiborder' : 'bg-[#0d2623] border-white/10 text-white'
      }`}
    >
      <span
        className={`text-xs uppercase tracking-wide ${flipped ? 'text-aiverse' : 'text-emerald'}`}
      >
        {label ?? 'Verse card'} · {verse.theme}
      </span>
      {flipped ? (
        <span className="font-serif text-xl leading-relaxed text-fg">“{verse.text}”</span>
      ) : (
        <span className="font-serif text-4xl font-semibold">{verse.ref}</span>
      )}
      <span
        className={`flex items-center gap-1.5 text-xs ${flipped ? 'text-sage' : 'text-white/60'}`}
      >
        <RotateCcw size={12} />
        {flipped
          ? `${verse.ref} (${TRANSLATION}) · tap to flip back`
          : 'Try to recall it, then tap to reveal'}
      </span>
    </button>
  )
}
