import { useMemo, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import MasonryFeed from './components/MasonryFeed.jsx'
import ReaderModal from './components/ReaderModal.jsx'
import ComposerModal from './components/ComposerModal.jsx'
import DogRouterWidget from './components/DogRouterWidget.jsx'
import FeaturePlaceholder from './components/FeaturePlaceholder.jsx'
import { initialItems, AI_TAKEAWAYS, seedMedia } from './data/seedData.js'
import { matches } from './utils/search.js'
import { useTheme } from './utils/theme.js'

export const FILTERS = ['All', 'Freedom Wall Q&A', 'Articles & Reels', 'Unanswered', 'Doubt', 'Prayer', 'Relationships', 'Anxiety', 'Sunday Recap']

function passesFilter(item, f) {
  if (f === 'All') return true
  if (f === 'Freedom Wall Q&A') return item.type === 'question'
  if (f === 'Articles & Reels') return item.type === 'media'
  if (f === 'Unanswered') return item.type === 'question' && item.status === 'unanswered'
  return item.topic === f
}

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const [module, setModule] = useState('Sanctuary')
  const [items, setItems] = useState(initialItems)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState(null)
  const [composer, setComposer] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200) }
  const visible = useMemo(() => items.filter((i) => passesFilter(i, filter) && matches(i, search)), [items, filter, search])
  const openItem = items.find((i) => i.id === openId)

  const toggleHelpful = (id) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, helped: !x.helped, helpful: x.helpful + (x.helped ? -1 : 1) } : x)))

  const addReply = (id, text) =>
    setItems((xs) => xs.map((x) => x.id === id
      ? { ...x, status: 'answered', comments: [...x.comments, { id: 'c' + Date.now(), author: 'Kiko Mendoza', text, time: 'Just now' }] }
      : x))

  const publish = ({ title, body, topic, anonymous }) => {
    const post = {
      id: 'q' + Date.now(), type: 'question', author: anonymous ? 'Anonymous Youth' : 'Kiko Mendoza', church: 'Calamba',
      status: 'unanswered', time: 'Just now', title, body, topic, ai: AI_TAKEAWAYS[topic], helpful: 0, helped: false, comments: [],
    }
    setItems((xs) => [post, ...xs]); setFilter('All'); setSearch(''); setComposer(false); showToast('Posted to the Freedom Wall')
  }

  const share = async (item) => {
    try { await navigator.clipboard.writeText(`${location.origin}/#${item.id}`) } catch { /* clipboard may be blocked */ }
    showToast('Link copied to share')
  }

  const media = items.filter((i) => i.type === 'media')

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar module={module} setModule={setModule} search={search} setSearch={setSearch} onCompose={() => setComposer(true)} theme={theme} onToggleTheme={toggleTheme} />
      {module === 'Sanctuary' ? (
        <>
          <div className="border-b border-line">
            <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald ${filter === f ? 'bg-emerald text-[#071917] border-emerald font-medium' : 'border-line text-fg/70 hover:bg-fg/5'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <MasonryFeed items={visible} onOpen={setOpenId} onHelpful={toggleHelpful} onShare={share} />
        </>
      ) : (
        <FeaturePlaceholder name={module} onBack={() => setModule('Sanctuary')} />
      )}
      {openItem && (
        <ReaderModal item={openItem} media={media.length ? media : seedMedia} onClose={() => setOpenId(null)}
          onReply={addReply} onHelpful={toggleHelpful} onShare={share} onOpen={setOpenId} />
      )}
      {composer && <ComposerModal onClose={() => setComposer(false)} onPublish={publish} />}
      <DogRouterWidget items={items} onFilter={(f) => { setModule('Sanctuary'); setFilter(f) }} onOpen={(id) => { setModule('Sanctuary'); setOpenId(id) }} />
      {toast && (
        <div role="status" className="pop fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-full bg-emerald text-[#071917] text-sm font-medium px-5 py-2 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
