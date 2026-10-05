import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DefaultPortModel } from 'storm-react-diagrams'
import { Choice } from './Choice'

function renderChoice(overrides: Partial<React.ComponentProps<typeof Choice>> = {}) {
  const port = new DefaultPortModel(false, 'out', 'Go north')
  return render(
    <DndProvider backend={HTML5Backend}>
      <Choice
        id={port.id}
        index={0}
        port={port}
        removeChoice={vi.fn()}
        updateChoice={vi.fn()}
        optionsButtonClick={vi.fn()}
        moveChoice={vi.fn()}
        optionsOpen={false}
        {...overrides}
      />
    </DndProvider>
  )
}

describe('Choice', () => {
  it('renders the label and fires option and remove callbacks', () => {
    const removeChoice = vi.fn()
    const updateChoice = vi.fn()
    const optionsButtonClick = vi.fn()

    renderChoice({ removeChoice, updateChoice, optionsButtonClick })

    expect(screen.getByDisplayValue('Go north')).toBeInTheDocument()
    userEvent.type(screen.getByDisplayValue('Go north'), '!')
    expect(updateChoice).toHaveBeenCalled()

    userEvent.click(screen.getAllByRole('button')[1])
    expect(optionsButtonClick).toHaveBeenCalled()

    userEvent.click(screen.getAllByRole('button')[2])
    expect(removeChoice).toHaveBeenCalled()
  })

  it('shows the open options icon when options are expanded', () => {
    const { container } = renderChoice({ optionsOpen: true })
    expect(container.querySelector('li')).toBeInTheDocument()
  })
})
