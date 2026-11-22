// Characterization tests for the demo build: the flows we show organizers.
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useDemo } from '@/shared/store/demo'
import App from './App'

const cards = () => screen.getAllByRole('article')
const openForum = async () => {
  render(<App />)
  await screen.findByRole('heading', { name: 'Freedom Wall' })
}
const viewAs = (userId: string) => act(() => useDemo.getState().setUser(userId))

describe('Forum (Freedom Wall)', () => {
  it('opens on the forum and shows all 10 seed cards', async () => {
    await openForum()
    expect(cards()).toHaveLength(10)
  })

  it('narrows the feed with a filter chip and the search box', async () => {
    const user = userEvent.setup()
    await openForum()
    await user.click(screen.getByRole('button', { name: 'Unanswered' }))
    expect(cards()).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: 'All' }))
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'finances')
    expect(cards()).toHaveLength(2)
  })

  it("a member's reply doesn't mark a question answered, a leader's reply does", async () => {
    const user = userEvent.setup()
    await openForum()
    const title = 'Why does God feel silent when I pray the hardest?'
    const card = () => cards().find((c) => c.textContent?.includes(title)) as HTMLElement

    await user.click(screen.getByText(title))
    await user.type(
      screen.getByPlaceholderText('Write an encouraging response...'),
      'Praying for you.{Enter}',
    )
    expect(within(screen.getByRole('dialog')).getByText('Praying for you.')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(within(card()).getByText(/Waiting 12h\+/)).toBeInTheDocument()

    viewAs('u-rina')
    await user.click(screen.getByText(title))
    await user.type(
      screen.getByPlaceholderText('Write an encouraging response...'),
      'You are not alone.{Enter}',
    )
    expect(within(screen.getByRole('dialog')).getAllByText('Leader answer').length).toBeGreaterThan(
      0,
    )
    await user.keyboard('{Escape}')
    expect(within(card()).getByText('Answered by a leader')).toBeInTheDocument()
  })

  it("Jessa's third Doubt reply earns her the Encourager badge", async () => {
    const user = userEvent.setup()
    await openForum()
    await user.click(screen.getByText('Why does God feel silent when I pray the hardest?'))
    await user.type(
      screen.getByPlaceholderText('Write an encouraging response...'),
      'Keep asking.{Enter}',
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Encourager · Doubt')
  })

  it('publishes an anonymous question to the top of the feed', async () => {
    const user = userEvent.setup()
    await openForum()
    await user.click(screen.getByRole('button', { name: /Ask \/ Post/ }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText('Title'), 'Is it okay to rest on Sunday?')
    await user.type(within(dialog).getByLabelText('Your question or thought'), 'Asking for me.')
    await user.click(within(dialog).getByRole('button', { name: 'Publish' }))
    expect(cards()).toHaveLength(11)
    expect(cards()[0]).toHaveTextContent('Is it okay to rest on Sunday?')
    expect(cards()[0]).toHaveTextContent('Anonymous Youth')
    expect(screen.getByRole('status')).toHaveTextContent('Posted to the Freedom Wall')
  })

  it('reported posts are hidden after 3 reports and shown to moderators', async () => {
    act(() => {
      for (const id of ['u-jessa', 'u-migs', 'u-daniel']) {
        useDemo.getState().setUser(id)
        useDemo.getState().report('q2')
      }
      useDemo.getState().setUser('u-jessa')
    })
    await openForum()
    expect(cards()).toHaveLength(9)
    viewAs('u-paolo')
    expect(cards()).toHaveLength(10)
  })

  it('routes from Ask Bark to a related thread', async () => {
    const user = userEvent.setup()
    await openForum()
    await user.click(screen.getByRole('button', { name: 'Ask Bark, topic router' }))
    await user.type(screen.getByPlaceholderText(/Try: finances/), 'worship')
    await user.click(screen.getByRole('button', { name: /My worship feels empty lately/ }))
    expect(screen.getByRole('dialog')).toHaveTextContent('My worship feels empty lately')
  })
})

describe('Navigation and roles', () => {
  it('reaches every app from the navigation', async () => {
    const user = userEvent.setup()
    await openForum()
    const go = async (name: string, heading: string | RegExp) => {
      await user.click(screen.getAllByRole('link', { name })[0]!)
      expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
    }
    await go('Daily Word', 'Daily Word')
    await go('Prayer', 'Prayer Request Form')
    await go('Outreach', 'Outreach Finder')
    await go('Me', 'Jessa')
  })

  it('offers a role switch on screens the current role cannot use', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/daily/disciples')
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'View as Ate Rina' }))
    expect(await screen.findByRole('heading', { name: 'Your disciples' })).toBeInTheDocument()
  })
})
