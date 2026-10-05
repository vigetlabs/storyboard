import { beforeEach, describe, expect, it, vi } from 'vitest'
import seed from '../src/seed'

vi.mock('../src/persistance', () => ({
  load: vi.fn(),
}))

vi.mock('react-dom', () => ({
  render: vi.fn(),
}))

vi.mock('../src/components/Player', () => ({
  default: () => null,
}))

describe('custom-theme-preview entrypoint', () => {
  beforeEach(() => {
    vi.resetModules()
    document.body.innerHTML = '<div id="custom-theme-preview"></div>'
    vi.stubGlobal('SEED', { slug: 'demo' })
  })

  it('renders the preview player when content loads', async () => {
    const { load } = await import('../src/persistance')
    vi.mocked(load).mockResolvedValue({
      story: seed.story,
      meta: seed.meta,
      portMeta: {},
    })
    const ReactDOM = await import('react-dom')
    await import('./custom-theme-preview')
    await vi.waitFor(() => {
      expect(ReactDOM.render).toHaveBeenCalled()
    })
  })
})
