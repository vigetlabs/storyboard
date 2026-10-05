import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerIntro } from './PlayerIntro'

describe('PlayerIntro', () => {
  it('renders the title and starts the story', () => {
    const onStart = vi.fn()
    render(
      <PlayerIntro
        title="Moon Quest"
        description="<p>Pack your bags.</p>"
        onStart={onStart}
      />
    )

    expect(screen.getByText('Moon Quest')).toBeInTheDocument()
    expect(screen.getByText('Pack your bags.')).toBeInTheDocument()
    userEvent.click(screen.getByText('Begin'))
    expect(onStart).toHaveBeenCalled()
  })
})
