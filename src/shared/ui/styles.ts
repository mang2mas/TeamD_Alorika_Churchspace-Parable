// Class recipes taken from the original Parable UI, so new screens match the existing look.
export const btn = {
  primary:
    'inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald text-[#071917] text-sm font-semibold px-4 py-2 hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-emerald',
  secondary:
    'inline-flex items-center justify-center gap-1.5 rounded-full border border-line text-sm px-4 py-2 text-fg/80 hover:bg-fg/5 disabled:opacity-40 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-emerald',
  ghost:
    'inline-flex items-center justify-center gap-1.5 rounded-full text-sm px-3 py-1.5 text-sage hover:text-fg hover:bg-fg/5 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-emerald',
  danger:
    'inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-400/50 text-rose-600 dark:text-rose-300 text-sm px-4 py-2 hover:bg-rose-500/10',
} as const

export const field =
  'w-full rounded-xl bg-fg/5 border border-line px-4 py-2.5 text-sm placeholder:text-sage/60 focus:outline-hidden focus:border-emerald'

export const card = 'rounded-2xl bg-card border border-line shadow-card'

export const chip = (active: boolean) =>
  `shrink-0 rounded-full px-4 py-1.5 text-sm border transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-emerald ${
    active
      ? 'bg-emerald text-[#071917] border-emerald font-medium'
      : 'border-line text-fg/70 hover:bg-fg/5'
  }`

export const tag = {
  green: 'rounded-full px-2.5 py-0.5 text-xs border text-accent border-emerald/40 bg-emerald/10',
  amber: 'rounded-full px-2.5 py-0.5 text-xs border text-warn border-amber/40 bg-amber/10',
  neutral: 'rounded-full px-2.5 py-0.5 text-xs border border-line text-sage',
  rose: 'rounded-full px-2.5 py-0.5 text-xs border border-rose-400/40 bg-rose-500/10 text-rose-700 dark:text-rose-300',
} as const
