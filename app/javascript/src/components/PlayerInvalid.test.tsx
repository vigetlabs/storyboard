import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlayerInvalid } from './PlayerInvalid'

describe('PlayerInvalid', () => {
  it('explains that the start scene is missing', () => {
    render(<PlayerInvalid />)
    expect(screen.getByText(/story's all messed up/i)).toBeInTheDocument()
    expect(screen.getByText(/deleted the start scene/i)).toBeInTheDocument()
  })
})
