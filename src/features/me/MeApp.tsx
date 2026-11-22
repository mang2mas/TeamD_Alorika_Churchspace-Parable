import { Route, Routes } from 'react-router'
import { SectionTabs } from '@/shared/ui'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

export default function MeApp() {
  return (
    <>
      <SectionTabs
        links={[
          { to: '/me', label: 'Profile', end: true },
          { to: '/me/settings', label: 'Settings' },
          { to: '/me/about', label: 'About' },
        ]}
      />
      <Routes>
        <Route index element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="about" element={<AboutPage />} />
      </Routes>
    </>
  )
}
