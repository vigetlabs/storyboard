import { afterEach, describe, expect, it, vi } from 'vitest'
import Easing from './Easing'

describe('Easing', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('computes common easing curves', () => {
    expect(Easing.linear(0.5)).toBe(0.5)
    expect(Easing.easeInQuad(0.5)).toBe(0.25)
    expect(Easing.easeOutQuad(0.5)).toBe(0.75)
    expect(Easing.easeInOutQuad(0.25)).toBe(0.125)
    expect(Easing.easeInOutQuad(0.75)).toBeCloseTo(0.875)
    expect(Easing.easeInCubic(0.5)).toBe(0.125)
    expect(Easing.easeOutCubic(0)).toBe(0)
  })

  it('queues easing callbacks until the animation window ends', () => {
    vi.useFakeTimers()
    const callback = vi.fn()

    Easing.queueEasing(callback)
    vi.advanceTimersByTime(200)

    expect(callback.mock.calls.length).toBeGreaterThan(0)
    expect(callback.mock.calls.at(-1)?.[0]).toBeGreaterThan(0)
  })

  it('stops subqueue once the end time has passed', () => {
    const callback = vi.fn()
    Easing.subqueue(0, 0, callback)
    expect(callback).not.toHaveBeenCalled()
  })
})
