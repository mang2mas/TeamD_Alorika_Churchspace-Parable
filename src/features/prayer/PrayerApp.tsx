import { Route, Routes } from 'react-router'
import { SectionTabs } from '@/shared/ui'
import LeaderPage from './pages/LeaderPage'
import RequestPage from './pages/RequestPage'
import WallPage from './pages/WallPage'

export default function PrayerApp() {
  return (
    <>
      <SectionTabs
        links={[
          { to: '/prayer', label: 'Request prayer', end: true },
          { to: '/prayer/wall', label: 'Prayer wall' },
          { to: '/prayer/leader', label: 'Leader view', roleTag: 'Leader' },
        ]}
      />
      <Routes>
        <Route index element={<RequestPage />} />
        <Route path="wall" element={<WallPage />} />
        <Route path="leader" element={<LeaderPage />} />
      </Routes>
    </>
  )
}
