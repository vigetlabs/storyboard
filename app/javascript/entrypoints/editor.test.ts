import { beforeEach, describe, expect, it, vi } from 'vitest'
import seed from '../src/seed'

vi.mock('../src/persistance', () => ({
  load: vi.fn(),
}))

vi.mock('react-dom', () => ({
  render: vi.fn(),
}))

vi.mock('../src/components/Editor', () => ({
  default: () => null,
}))

vi.mock('../src/components/Tutorial', () => ({
  default: () => null,
}))

describe('editor entrypoint', () => {
  beforeEach(() => {
    vi.resetModules()
    document.body.innerHTML = '<div id="editor"></div>'
    vi.stubGlobal('SEED', {
      slug: 'demo',
      viewOnly: false,
    })
  })

  it('renders loaded editor content', async () => {
    const { load } = await import('../src/persistance')
    vi.mocked(load).mockResolvedValue({
      story: seed.story,
      meta: seed.meta,
      portMeta: {},
    })
    const ReactDOM = await import('react-dom')
    await import('./editor')
    await vi.waitFor(() => {
      expect(ReactDOM.render).toHaveBeenCalled()
    })
  })

  it('falls back to the default story when load returns nothing', async () => {
    const { load } = await import('../src/persistance')
    vi.mocked(load).mockResolvedValue(undefined as any)
    const ReactDOM = await import('react-dom')
    await import('./editor')
    await vi.waitFor(() => {
      expect(ReactDOM.render).toHaveBeenCalled()
    })
  })

  it('reloads after a persisted pageshow', async () => {
    const reload = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload },
    })
    Object.defineProperty(window.performance, 'navigation', {
      configurable: true,
      value: { type: 2 },
    })
    const { load } = await import('../src/persistance')
    vi.mocked(load).mockResolvedValue(undefined as any)
    await import('./editor')
    window.dispatchEvent(new Event('pageshow'))
    expect(reload).toHaveBeenCalled()
  })
})
