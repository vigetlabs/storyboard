import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChoiceEditor from './ChoiceEditor'
import { ApplicationComponent } from '../Store'
import seed from '../seed'
import { startNode } from '../../test/helpers'

function renderChoiceEditor(focus = startNode()) {
  const requestPaint = vi.fn()
  const updateDiagram = vi.fn()

  render(
    <ApplicationComponent slug="demo" story={seed.story} meta={seed.meta as any}>
      <ChoiceEditor
        focus={focus}
        requestPaint={requestPaint}
        updateDiagram={updateDiagram}
      />
    </ApplicationComponent>
  )

  return { requestPaint, updateDiagram, focus }
}

describe('ChoiceEditor', () => {
  it('lists existing choices and can add a new one', () => {
    const { requestPaint, focus } = renderChoiceEditor()

    expect(screen.getByDisplayValue('Choice 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Choice 2')).toBeInTheDocument()

    const form = screen.getByText('Add choice').closest('form') as HTMLFormElement
    const input = form.querySelector('input') as HTMLInputElement
    input.value = 'Leap'
    fireEvent.submit(form)
    expect(requestPaint).toHaveBeenCalled()
    expect(Object.values(focus.ports).some(port => port.label === 'Leap')).toBe(true)
  })

  it('updates and removes a choice', () => {
    const { requestPaint, focus } = renderChoiceEditor()
    const originalPortCount = Object.keys(focus.ports).length

    const choiceInput = screen.getByDisplayValue('Choice 1')
    userEvent.clear(choiceInput)
    userEvent.type(choiceInput, 'Go left')
    expect(requestPaint).toHaveBeenCalled()

    userEvent.click(screen.getAllByRole('button')[2])
    expect(Object.keys(focus.ports).length).toBeLessThan(originalPortCount)
  })

  it('shows an empty-state prompt when a scene has no choices', () => {
    const focus = startNode()
    Object.keys(focus.ports).forEach(key => {
      if (!focus.ports[key].in) {
        focus.removePort(focus.ports[key])
      }
    })

    renderChoiceEditor(focus)
    expect(screen.getByText(/first choice/i)).toBeInTheDocument()
  })
})
