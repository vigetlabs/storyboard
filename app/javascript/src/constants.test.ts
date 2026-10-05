import { describe, expect, it } from 'vitest'
import { defaultNodeName } from './constants'

describe('constants', () => {
  it('exports the default scene name', () => {
    expect(defaultNodeName).toBe('New Scene')
  })
})
