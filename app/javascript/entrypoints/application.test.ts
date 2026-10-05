import { describe, expect, it, vi } from 'vitest'

describe('application entrypoint', () => {
  it('reloads on a persisted pageshow', async () => {
    const reload = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload },
    })
    Object.defineProperty(window.performance, 'navigation', {
      configurable: true,
      value: { type: 2 },
    })

    await import('./application')
    window.dispatchEvent(new Event('pageshow'))
    expect(reload).toHaveBeenCalled()
  })
})
