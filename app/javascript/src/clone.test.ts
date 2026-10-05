import { describe, expect, it } from 'vitest'
import { clone } from './clone'

describe('clone', () => {
  it('returns a deep copy that does not share nested references', () => {
    const original = { nested: { value: 1 }, list: [1, 2] }
    const copied = clone(original)

    copied.nested.value = 2
    copied.list.push(3)

    expect(copied).toEqual({ nested: { value: 2 }, list: [1, 2, 3] })
    expect(original).toEqual({ nested: { value: 1 }, list: [1, 2] })
  })
})
