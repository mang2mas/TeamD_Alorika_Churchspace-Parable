import { Route, Routes } from 'react-router'
import { SectionTabs } from '@/shared/ui'
import DisciplesPage from './pages/DisciplesPage'
import SundayCardsPage from './pages/SundayCardsPage'
import TodayPage from './pages/TodayPage'

export default function DailyWordApp() {
  return (
    <>
      <SectionTabs
        links={[
          { to: '/daily', label: 'Today', end: true },
          { to: '/daily/disciples', label: 'Discipler dashboard', roleTag: 'Leader' },
          { to: '/daily/sunday', label: 'Sunday Message to Cards', roleTag: 'Media' },
        ]}
      />
      <Routes>
        <Route index element={<TodayPage />} />
        <Route path="disciples" element={<DisciplesPage />} />
        <Route path="sunday" element={<SundayCardsPage />} />
      </Routes>
    </>
  )
}
