import { forwardRef, type CSSProperties } from 'react'
import { TRANSLATION } from '@/shared/demo/verses'

export type CardStyle = 'light' | 'dark' | 'gold'
export type CardFormat = 'square' | 'story'

const PALETTE: Record<CardStyle, { bg: string; fg: string; accent: string; muted: string }> = {
  light: { bg: '#FAF8F5', fg: '#122623', accent: '#0F5143', muted: '#526663' },
  dark: { bg: '#071917', fg: '#FFFFFF', accent: '#10B981', muted: '#A6B2B0' },
  gold: { bg: '#FEF6E6', fg: '#3A2A07', accent: '#B45309', muted: '#7C5A1E' },
}

const SIZE: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 320, height: 320 },
  story: { width: 270, height: 480 },
}

function fontSize(text: string, format: CardFormat) {
  const n = text.length
  const base = format === 'story' ? 2 : 0
  if (n < 90) return 22 + base
  if (n < 160) return 18 + base
  if (n < 260) return 15 + base
  return 13 + base
}

interface Props {
  kind: 'verse' | 'quote'
  text: string
  /** Verse reference or quote attribution. */
  caption: string
  church: string
  style: CardStyle
  format: CardFormat
}

/** A fixed-size, theme-independent card so the exported PNG looks the same everywhere. */
const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { kind, text, caption, church, style, format },
  ref,
) {
  const p = PALETTE[style]
  const box: CSSProperties = {
    ...SIZE[format],
    background: p.bg,
    color: p.fg,
    padding: format === 'story' ? 28 : 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: 16,
    fontFamily: 'Inter, sans-serif',
  }
  return (
    <div ref={ref} style={box}>
      <span
        style={{
          color: p.accent,
          fontSize: 11,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {kind === 'verse' ? 'Sunday Verse' : 'From Sunday’s Message'}
      </span>
      <div>
        {kind === 'quote' && (
          <span
            style={{ color: p.accent, fontFamily: 'Lora, serif', fontSize: 48, lineHeight: 0.6 }}
          >
            “
          </span>
        )}
        <p
          style={{
            fontFamily: 'Lora, serif',
            fontSize: fontSize(text, format),
            lineHeight: 1.4,
            fontWeight: 500,
            margin: 0,
          }}
        >
          {text || 'Type the verse text here…'}
        </p>
        <p style={{ color: p.accent, fontSize: 13, fontWeight: 600, marginTop: 12 }}>
          {kind === 'verse' ? `${caption} · ${TRANSLATION}` : `— ${caption}`}
        </p>
      </div>
      <span style={{ color: p.muted, fontSize: 10 }}>{church} · made with Parable</span>
    </div>
  )
})

export default ShareCard
