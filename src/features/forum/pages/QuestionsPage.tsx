import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Plus, Search } from 'lucide-react'
import { can } from '@/shared/demo/users'
import { useCurrentUser, useDemo } from '@/shared/store/demo'
import { toast } from '@/shared/store/toast'
import { chip } from '@/shared/ui/styles'
import ComposerModal from '../components/ComposerModal'
import DogRouterWidget from '../components/DogRouterWidget'
import MasonryFeed from '../components/MasonryFeed'
import ReaderModal from '../components/ReaderModal'
import { computeBadges } from '../model/badges'
import { FILTERS, passesFilter, type Filter } from '../model/filters'
import { matches } from '../model/search'
import { seedMedia } from '../model/seedData'
import type { FeedItem, Media, Question } from '../model/types'

export default function QuestionsPage() {
  const user = useCurrentUser()
  const feed = useDemo((s) => s.feed)
  const tasks = useDemo((s) => s.tasks)
  const { addQuestion, reply, toggleHelpful, report } = useDemo.getState()
  const [filter, setFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const [composer, setComposer] = useState(false)
  const [params, setParams] = useSearchParams()
  const openId = params.get('open')
  const setOpenId = (id: string | null) => setParams(id ? { open: id } : {})

  const isModerator = user.role === 'moderator'
  // Hidden (reported) questions disappear for everyone except moderators.
  const items = useMemo(
    () => feed.filter((i) => i.type === 'media' || !i.hidden || isModerator),
    [feed, isModerator],
  )
  const visible = useMemo(
    () => items.filter((i) => passesFilter(i, filter) && matches(i, search)),
    [items, filter, search],
  )
  const questions = useMemo(() => feed.filter((i): i is Question => i.type === 'question'), [feed])
  // Badges show next to named authors only, never on anonymous posts.
  const badgeByAuthor = useMemo(() => {
    const ids = new Set(questions.flatMap((q) => (q.authorId ? [q.authorId] : [])))
    return new Map([...ids].map((id) => [id, computeBadges(id, questions, tasks)[0]?.label]))
  }, [questions, tasks])
  const badgeFor = (authorId?: string) => (authorId ? badgeByAuthor.get(authorId) : undefined)

  const openItem = items.find((i) => i.id === openId)
  const media = feed.filter((i): i is Media => i.type === 'media')

  const share = async (item: FeedItem) => {
    const url = `${location.origin}/forum?open=${item.id}`
    try {
      await navigator.clipboard.writeText(url)
      toast('Link copied to share')
    } catch {
      toast(`Share this link: ${url}`)
    }
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 pt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex-1">
          <h1 className="font-serif text-2xl font-semibold text-fg">Freedom Wall</h1>
          <p className="text-sm text-sage">
            Ask anything about faith, anonymously if you want. Local leaders answer within a day.
          </p>
        </div>
        <label className="relative sm:w-80">
          <span className="sr-only">Search</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, verses, reels..."
            className="w-full rounded-full bg-fg/5 border border-line pl-9 pr-4 py-2 text-sm placeholder:text-sage/60 focus:outline-hidden focus:border-emerald"
          />
        </label>
        <button
          onClick={() => setComposer(true)}
          className="flex items-center justify-center gap-1.5 rounded-full bg-emerald text-[#071917] text-sm font-semibold px-4 py-2 hover:brightness-110"
        >
          <Plus size={16} /> Ask / Post
        </button>
      </div>
      <div className="max-w-6xl mx-auto px-4 pt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={chip(filter === f)}
          >
            {f}
          </button>
        ))}
      </div>
      <MasonryFeed
        items={visible}
        onOpen={setOpenId}
        onHelpful={toggleHelpful}
        onShare={(m) => void share(m)}
        badgeFor={badgeFor}
        showReports={isModerator}
      />
      {openItem && (
        <ReaderModal
          item={openItem}
          media={media.length ? media : seedMedia}
          onClose={() => setOpenId(null)}
          onReply={reply}
          onHelpful={toggleHelpful}
          onShare={(m) => void share(m)}
          onOpen={setOpenId}
          onReport={(id) => {
            report(id)
            toast('Thanks. A moderator will review this post.')
          }}
          reported={openItem.type === 'question' && openItem.reports.includes(user.id)}
          isLeader={can.markAnswered(user.role)}
        />
      )}
      {composer && (
        <ComposerModal
          onClose={() => setComposer(false)}
          onPublish={(post) => {
            addQuestion(post)
            setFilter('All')
            setSearch('')
            setComposer(false)
            toast('Posted to the Freedom Wall')
          }}
        />
      )}
      <DogRouterWidget items={items} onFilter={setFilter} onOpen={setOpenId} />
    </>
  )
}
