import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerEnd, PlayerDeadEnd } from './PlayerEnd'

describe('PlayerEnd', () => {
  it('renders ending media, source, and actions', () => {
    const onReplay = vi.fn()
    const onGoBack = vi.fn()

    render(
      <PlayerEnd
        title="The End"
        body="<p>You made it.</p>"
        image="/end.png"
        audio="/end.mp3"
        hideTitle={false}
        onReplay={onReplay}
        onGoBack={onGoBack}
        showSource
      />
    )

    expect(screen.getByText('The End')).toBeInTheDocument()
    expect(screen.getByText('You made it.')).toBeInTheDocument()
    expect(screen.getByAltText('')).toHaveAttribute('src', '/end.png')
    expect(screen.getByTestId('audio-player')).toHaveAttribute('src', '/end.mp3')
    expect(screen.getByText('Source')).toHaveAttribute(
      'href',
      expect.stringContaining('/source')
    )

    userEvent.click(screen.getByText('Replay'))
    userEvent.click(screen.getByText('Back'))
    expect(onReplay).toHaveBeenCalled()
    expect(onGoBack).toHaveBeenCalled()
  })

  it('can hide the title and source', () => {
    render(
      <PlayerEnd
        title="Hidden"
        body="<p>Quiet ending.</p>"
        image=""
        audio=""
        hideTitle
        onReplay={vi.fn()}
        onGoBack={vi.fn()}
        showSource={false}
      />
    )

    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
    expect(screen.queryByText('Source')).not.toBeInTheDocument()
  })

  it('renders the dead-end copy', () => {
    render(
      <PlayerDeadEnd onReplay={vi.fn()} onGoBack={vi.fn()} showSource={false} />
    )
    expect(screen.getByText(/choice wasn't tied to a new scene/i)).toBeInTheDocument()
  })
})
