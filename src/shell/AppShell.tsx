import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { useToast } from '@/shared/store/toast'
import BottomTabs from './BottomTabs'
import Header from './Header'

export default function AppShell() {
  const toast = useToast((s) => s.message)
  return (
    <div className="min-h-screen bg-canvas pb-20 md:pb-0">
      <Header />
      <Suspense fallback={<p className="max-w-6xl mx-auto px-4 py-10 text-sage">Loading…</p>}>
        <Outlet />
      </Suspense>
      <BottomTabs />
      {toast && (
        <div
          role="status"
          className="pop fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-60 max-w-[90vw] rounded-full bg-emerald text-[#071917] text-sm font-medium px-5 py-2 shadow-lg text-center"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
