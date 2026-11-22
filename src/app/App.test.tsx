// Characterization tests: they pin down how the Phase 0 app behaves today, so later
// rewrites (real data, routing, accessible dialogs) can't silently change it.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

const cards = () => screen.getAllByRole('article')

describe('App (Phase 0 behavior)', () => {
  it('shows all 8 seed cards in the feed', () => {
    render(<App />)
    expect(cards()).toHaveLength(8)
  })

  it('narrows the feed with a filter chip', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Unanswered' }))
    expect(cards()).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(cards()).toHaveLength(8)
  })

  it('filters the feed with the search box, including synonyms', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'finances')
    expect(cards()).toHaveLength(2)
  })

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'zzzz')
    expect(screen.queryAllByRole('article')).toHaveLength(0)
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
  })

  it('opens a question, accepts a reply that marks it answered, and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Why does God feel silent when I pray the hardest?'))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('2 responses')).toBeInTheDocument()
    await user.type(
      within(dialog).getByPlaceholderText('Write an encouraging response...'),
      'Praying for you.{Enter}',
    )
    expect(within(dialog).getByText('Praying for you.')).toBeInTheDocument()
    expect(within(dialog).getByText('3 responses')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const card = cards().find((c) => c.textContent?.includes('Why does God feel silent'))
    expect(card).toBeDefined()
    expect(within(card as HTMLElement).getByText('Answered')).toBeInTheDocument()
  })

  it('toggles "Helpful" on a question card', async () => {
    const user = userEvent.setup()
    render(<App />)
    const button = screen.getByRole('button', { name: /Helpful · 18/ })
    await user.click(button)
    expect(screen.getByRole('button', { name: /Helpful · 19/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('publishes a new question to the top of the feed and shows a toast', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Ask \/ Post/ }))
    const dialog = screen.getByRole('dialog')
    const publish = within(dialog).getByRole('button', { name: 'Publish' })
    expect(publish).toBeDisabled()

    await user.type(within(dialog).getByLabelText('Title'), 'Is it okay to rest on Sunday?')
    await user.type(within(dialog).getByLabelText('Your question or thought'), 'Asking for me.')
    await user.click(publish)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(cards()).toHaveLength(9)
    expect(cards()[0]).toHaveTextContent('Is it okay to rest on Sunday?')
    expect(cards()[0]).toHaveTextContent('Anonymous Youth')
    expect(screen.getByRole('status')).toHaveTextContent('Posted to the Freedom Wall')
  })

  it('routes from Ask Bark to a related thread', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Ask Bark, topic router' }))
    await user.type(screen.getByPlaceholderText(/Try: finances/), 'worship')
    await user.click(screen.getByRole('button', { name: /My worship feels empty lately/ }))
    expect(screen.getByRole('dialog')).toHaveTextContent('My worship feels empty lately')
  })

  it('shows the placeholder for modules that are not built yet', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Outreach' }))
    expect(screen.getByText('Outreach is coming soon')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back to Sanctuary' }))
    expect(cards()).toHaveLength(8)
  })
})
