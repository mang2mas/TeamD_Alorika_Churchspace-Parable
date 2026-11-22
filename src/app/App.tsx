import { lazy, useState } from 'react'
import { Navigate, RouterProvider, createBrowserRouter, type RouteObject } from 'react-router'
import AppShell from '@/shell/AppShell'

// Each app is its own lazy chunk, so phones only download what they open.
const ForumApp = lazy(() => import('@/features/forum/ForumApp'))
const DailyWordApp = lazy(() => import('@/features/daily-word/DailyWordApp'))
const PrayerApp = lazy(() => import('@/features/prayer/PrayerApp'))
const OutreachApp = lazy(() => import('@/features/outreach/OutreachApp'))
const MeApp = lazy(() => import('@/features/me/MeApp'))

const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/forum" replace /> },
      { path: 'forum/*', element: <ForumApp /> },
      { path: 'daily/*', element: <DailyWordApp /> },
      { path: 'prayer/*', element: <PrayerApp /> },
      { path: 'outreach/*', element: <OutreachApp /> },
      { path: 'me/*', element: <MeApp /> },
      { path: '*', element: <Navigate to="/forum" replace /> },
    ],
  },
]

export default function App() {
  // Created per mount so tests (and hot reloads) start from the current URL.
  const [router] = useState(() => createBrowserRouter(routes))
  return <RouterProvider router={router} />
}
