import { Route, Routes } from 'react-router'
import { SectionTabs } from '@/shared/ui'
import DirectoryPage from './pages/DirectoryPage'
import InboxPage from './pages/InboxPage'
import VerifyPage from './pages/VerifyPage'

export default function OutreachApp() {
  return (
    <>
      <SectionTabs
        links={[
          { to: '/outreach', label: 'Find churches', end: true },
          { to: '/outreach/inbox', label: 'Partner inbox', roleTag: 'Admin' },
          { to: '/outreach/verify', label: 'Verify claims', roleTag: 'Mod' },
        ]}
      />
      <Routes>
        <Route index element={<DirectoryPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="verify" element={<VerifyPage />} />
      </Routes>
    </>
  )
}
