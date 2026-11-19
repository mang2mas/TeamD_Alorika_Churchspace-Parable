import { useEffect, useState } from 'react'
import { SearchX } from 'lucide-react'
import QuestionCard from './QuestionCard.jsx'
import MediaCard from './MediaCard.jsx'

function useColumnCount() {
  const calc = () => (window.matchMedia('(min-width: 1024px)').matches ? 3 : window.matchMedia('(min-width: 768px)').matches ? 2 : 1)
  const [n, setN] = useState(calc)
  useEffect(() => { const on = () => setN(calc()); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on) }, [])
  return n
}

export default function MasonryFeed({ items, onOpen, onHelpful, onShare }) {
  const n = useColumnCount()
  if (!items.length)
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center text-sage">
        <SearchX className="mx-auto mb-3" />
        <p className="font-serif text-xl text-fg">Nothing here yet</p>
        <p className="text-sm mt-1">Try a different filter or keyword, or post the first question.</p>
      </div>
    )
  // Round-robin keeps reading order left-to-right, so new posts land on the top row.
  const cols = Array.from({ length: n }, () => [])
  items.forEach((it, i) => cols[i % n].push(it))
  return (
    <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto px-4 py-6">
      {cols.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-5">
          {col.map((it) => it.type === 'question'
            ? <QuestionCard key={it.id} q={it} onOpen={onOpen} onHelpful={onHelpful} />
            : <MediaCard key={it.id} m={it} onOpen={onOpen} onShare={onShare} />)}
        </div>
      ))}
    </main>
  )
}
