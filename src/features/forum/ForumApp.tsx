import { Route, Routes } from 'react-router'
import { useCurrentUser } from '@/shared/store/demo'
import { SectionTabs } from '@/shared/ui'
import IdeasPage from './pages/IdeasPage'
import QuestionsPage from './pages/QuestionsPage'
import ReviewPage from './pages/ReviewPage'
import TasksPage from './pages/TasksPage'

export default function ForumApp() {
  const user = useCurrentUser()
  return (
    <>
      <SectionTabs
        links={[
          { to: '/forum', label: 'Freedom Wall', end: true },
          { to: '/forum/ideas', label: 'Post ideas' },
          { to: '/forum/tasks', label: 'Tech tasks' },
          ...(user.role === 'moderator'
            ? [{ to: '/forum/review', label: 'Review queue', roleTag: 'Mod' }]
            : []),
        ]}
      />
      <Routes>
        <Route index element={<QuestionsPage />} />
        <Route path="ideas" element={<IdeasPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="review" element={<ReviewPage />} />
      </Routes>
    </>
  )
}
