import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TutorialPage from './TutorialPage'

describe('TutorialPage', () => {
  it('walks through pages, skip, and close actions', () => {
    const onClose = vi.fn()
    render(<TutorialPage onClose={onClose} />)

    expect(screen.getByText('Tutorial')).toBeInTheDocument()
    userEvent.click(screen.getByText('No Thanks'))
    expect(onClose).toHaveBeenCalled()

    userEvent.click(screen.getByText('next'))
    expect(screen.getByText('#1 - Scenes')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByText('previous')).toBeDisabled()

    userEvent.click(screen.getByText('next'))
    expect(screen.getByText('#2 - Choices and Links')).toBeInTheDocument()
    userEvent.click(screen.getByText('previous'))
    expect(screen.getByText('#1 - Scenes')).toBeInTheDocument()
  })

  it('jumps via the progress bubbles and closes on the last page', () => {
    const onClose = vi.fn()
    const { container } = render(<TutorialPage onClose={onClose} />)

    const bubbles = container.querySelectorAll('.bubble')
    userEvent.click(bubbles[bubbles.length - 1] as HTMLElement)
    expect(screen.getByText('#16 - Disclaimer')).toBeInTheDocument()
    expect(screen.getByText("Let's Go!")).toBeInTheDocument()
    expect(screen.getByText('next')).toBeDisabled()

    userEvent.click(screen.getByText("Let's Go!"))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders demo links on advanced pages', () => {
    const { container } = render(<TutorialPage onClose={vi.fn()} />)
    const bubbles = container.querySelectorAll('.bubble')
    userEvent.click(bubbles[6] as HTMLElement)

    expect(screen.getByText('Try our demo story!')).toHaveAttribute(
      'href',
      'https://storyboard.viget.com/items-example'
    )
  })
})
