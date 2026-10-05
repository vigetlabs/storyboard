import { beforeEach, describe, expect, it, vi } from 'vitest'
import seed from '../src/seed'

vi.mock('../src/persistance', () => ({
  load: vi.fn(),
}))

vi.mock('react-dom', () => ({
  render: vi.fn(),
}))

describe('player entrypoint', () => {
  beforeEach(() => {
    vi.resetModules()
    document.body.innerHTML = '<div id="player"></div>'
    vi.stubGlobal('SEED', {
      slug: 'demo',
      title: 'Demo',
      description: 'A demo',
      theme: 'Light',
      isOffline: true,
      backButton: true,
      debuggable: false,
      characterCard: false,
      showSource: false,
      story: seed,
    })
  })

  it('renders the offline story without loading', async () => {
    const ReactDOM = await import('react-dom')
    await import('./player')
    expect(ReactDOM.render).toHaveBeenCalled()
  })

  it('loads remote content when the story is online', async () => {
    const { load } = await import('../src/persistance')
    vi.mocked(load).mockResolvedValue({
      story: seed.story,
      meta: seed.meta,
      portMeta: {},
    })
    vi.stubGlobal('SEED', {
      slug: 'demo',
      title: 'Demo',
      description: 'A demo',
      theme: 'Light',
      isOffline: false,
      backButton: true,
      debuggable: false,
      characterCard: false,
      showSource: false,
      story: seed,
    })

    const ReactDOM = await import('react-dom')
    await import('./player')
    expect(load).toHaveBeenCalledWith('demo')
    await vi.waitFor(() => {
      expect(ReactDOM.render).toHaveBeenCalled()
    })
  })
})
