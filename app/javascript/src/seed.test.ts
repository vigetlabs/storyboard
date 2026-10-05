import { describe, expect, it } from 'vitest'
import seed from './seed'
import { START_ID, CHOICE_1_PORT, DECISION_1_ID } from '../test/helpers'

describe('seed', () => {
  it('includes a start scene linked to two decisions', () => {
    expect(seed.story.nodes.map((node: { id: string }) => node.id)).toEqual(
      expect.arrayContaining([START_ID, DECISION_1_ID])
    )
    expect(seed.story.links[0].sourcePort).toBe(CHOICE_1_PORT)
    expect(seed.meta[START_ID].text).toContain('starting scene')
  })
})
