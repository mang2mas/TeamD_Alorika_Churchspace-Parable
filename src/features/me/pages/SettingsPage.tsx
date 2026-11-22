import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { ROLE_LABEL, USERS } from '@/shared/demo/users'
import { useTheme } from '@/shared/lib/theme'
import { useDemo } from '@/shared/store/demo'
import { toast } from '@/shared/store/toast'
import { Avatar, Page, PageHeader } from '@/shared/ui'
import { btn, card } from '@/shared/ui/styles'

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-emerald' : 'bg-fg/20'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const [theme, toggleTheme] = useTheme()
  const userId = useDemo((s) => s.userId)
  const setUser = useDemo((s) => s.setUser)
  const dataSaver = useDemo((s) => s.dataSaver)
  const setDataSaver = useDemo((s) => s.setDataSaver)
  const resetDemo = useDemo((s) => s.resetDemo)
  const [confirming, setConfirming] = useState(false)

  return (
    <Page>
      <PageHeader title="Settings" />
      <div className="flex flex-col gap-4 max-w-2xl">
        <section className={`${card} p-5 flex items-center justify-between gap-4`}>
          <div>
            <h2 className="font-medium text-fg">Dark mode</h2>
            <p className="text-sm text-sage">
              “Deep Sanctuary” theme. Easier on the eyes at night.
            </p>
          </div>
          <Toggle on={theme === 'dark'} onChange={toggleTheme} label="Dark mode" />
        </section>

        <section className={`${card} p-5 flex items-center justify-between gap-4`}>
          <div>
            <h2 className="font-medium text-fg">Data saver</h2>
            <p className="text-sm text-sage">
              Don't load cover images. Good for prepaid data or slow signal.
            </p>
          </div>
          <Toggle on={dataSaver} onChange={() => setDataSaver(!dataSaver)} label="Data saver" />
        </section>

        <section className={`${card} p-5`}>
          <h2 className="font-medium text-fg">View as (demo)</h2>
          <p className="text-sm text-sage mb-3">Switch roles to see what each person sees.</p>
          <div className="flex flex-col gap-2">
            {USERS.map((u) => (
              <label
                key={u.id}
                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer ${userId === u.id ? 'border-emerald bg-emerald/10' : 'border-line hover:bg-fg/5'}`}
              >
                <input
                  type="radio"
                  name="viewas"
                  className="sr-only"
                  checked={userId === u.id}
                  onChange={() => setUser(u.id)}
                />
                <Avatar initials={u.initials} color={u.color} size="sm" />
                <span className="text-sm text-fg">{u.name}</span>
                <span className="ml-auto text-xs text-sage">{ROLE_LABEL[u.role]}</span>
              </label>
            ))}
          </div>
        </section>

        <section className={`${card} p-5`}>
          <h2 className="font-medium text-fg">Reset demo data</h2>
          <p className="text-sm text-sage mb-3">
            Puts every question, task, prayer request and church back to the starting sample data.
            Do this before each presentation.
          </p>
          {confirming ? (
            <div className="flex gap-2">
              <button
                className={btn.danger}
                onClick={() => {
                  resetDemo()
                  setConfirming(false)
                  toast('Demo data reset')
                }}
              >
                Yes, reset everything
              </button>
              <button className={btn.ghost} onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className={btn.secondary} onClick={() => setConfirming(true)}>
              <RotateCcw size={14} /> Reset demo data
            </button>
          )}
        </section>
      </div>
    </Page>
  )
}
