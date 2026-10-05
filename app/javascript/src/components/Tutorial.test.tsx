import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tutorial from './Tutorial'

describe('Tutorial', () => {
  it('opens by default until it has been dismissed', () => {
    render(<Tutorial />)
    expect(screen.getByText('Tutorial')).toBeInTheDocument()

    userEvent.click(screen.getByText('X'))
    expect(localStorage.getItem('tutorial')).toBe('seen')
    expect(screen.queryByText('Tutorial')).not.toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('can be reopened after it has been seen', () => {
    localStorage.setItem('tutorial', 'seen')
    render(<Tutorial />)

    userEvent.click(screen.getByText('?'))
    expect(screen.getByText('Tutorial')).toBeInTheDocument()
  })

  it('closes when Escape is pressed', () => {
    render(<Tutorial />)
    fireEvent.keyUp(document, { key: 'Escape' })
    expect(screen.queryByRole('heading', { name: 'Tutorial' })).not.toBeInTheDocument()
  })
})
