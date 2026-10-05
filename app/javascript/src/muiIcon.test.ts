import { describe, expect, it } from 'vitest'
import muiIcon from './muiIcon'

describe('muiIcon', () => {
  it('unwraps nested default exports', () => {
    const Icon = () => null
    expect(muiIcon({ default: { default: Icon } })).toBe(Icon)
  })

  it('returns the module when it is already the component', () => {
    const Icon = () => null
    expect(muiIcon(Icon)).toBe(Icon)
  })

  it('returns nullish values as-is', () => {
    expect(muiIcon(null)).toBeNull()
    expect(muiIcon(undefined)).toBeUndefined()
  })
})
