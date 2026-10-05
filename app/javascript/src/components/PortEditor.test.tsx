import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import PortEditor from './PortEditor'
import { ApplicationComponent } from '../Store'
import seed from '../seed'
import { startNode, CHOICE_1_PORT, defaultPortMeta, portById } from '../../test/helpers'

function renderPortEditor(portMeta = {}) {
  const focus = startNode()
  const port = portById(focus, CHOICE_1_PORT)
  const updateState = vi.fn()
  const removeChoice = vi.fn()
  const updateChoice = vi.fn()
  const moveChoice = vi.fn()

  render(
    <ApplicationComponent
      slug="demo"
      story={seed.story}
      meta={seed.meta as any}
      {...({ portMeta } as any)}
    >
      <DndProvider backend={HTML5Backend}>
        <PortEditor
          port={port}
          removeChoice={removeChoice}
          updateChoice={updateChoice}
          moveChoice={moveChoice}
          index={0}
        />
      </DndProvider>
    </ApplicationComponent>
  )

  return { updateState, removeChoice, port }
}

describe('PortEditor', () => {
  it('opens option tabs and can add item, stat, and condition rows', () => {
    renderPortEditor({
      [CHOICE_1_PORT]: {
        ...defaultPortMeta,
        itemChanges: [{ name: 'Key', action: 'add' }],
        statChanges: [{ name: 'Health', value: 1, action: '+' }],
      },
    })

    userEvent.click(screen.getAllByRole('button')[1])
    expect(screen.getByText('Items')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Key')).toBeInTheDocument()

    userEvent.click(screen.getAllByRole('button', { name: 'Add Item' })[0])
    fireEvent.blur(screen.getAllByLabelText('Item Name')[1], {
      target: { value: 'Torch' },
    })
    userEvent.selectOptions(screen.getAllByLabelText('Add/Remove')[0], 'remove')

    userEvent.click(screen.getByText('Stats'))
    expect(screen.getByDisplayValue('Health')).toBeInTheDocument()
    userEvent.selectOptions(
      screen.getAllByLabelText('Increase/Decrease/Reset')[0],
      '?'
    )
    fireEvent.blur(screen.getByPlaceholderText('Min'), { target: { value: '1' } })
    fireEvent.blur(screen.getByPlaceholderText('Max'), { target: { value: '4' } })

    userEvent.click(screen.getByText('Show If'))
    userEvent.click(screen.getByText('Timer'))
    userEvent.click(screen.getByLabelText('Is Timer?'))
    userEvent.click(screen.getByLabelText('Hide Choice?'))
    fireEvent.blur(screen.getByLabelText('Seconds'), { target: { value: '8' } })

    userEvent.click(screen.getByText('Loop'))
    userEvent.click(screen.getByLabelText('Loop Back to Same Scene?'))
  })

  it('edits existing show-if rows and can remove them', () => {
    renderPortEditor({
      [CHOICE_1_PORT]: {
        ...defaultPortMeta,
        itemChanges: [{ name: 'Key', action: 'add' }, { name: 'Torch', action: 'add' }],
        statChanges: [
          { name: 'Health', value: 1, action: '+' },
          { name: 'Gold', value: 1, action: '+' },
        ],
        showIfItems: [{ name: 'Key', hasIt: true }],
        showIfStats: [{ name: 'Health', operator: '>', value: 2 }],
      },
    })

    userEvent.click(screen.getAllByRole('button')[1])
    userEvent.click(screen.getByText('Show If'))

    userEvent.selectOptions(screen.getByLabelText('Item'), 'Torch')
    userEvent.click(screen.getByLabelText('Has it?'))
    userEvent.click(screen.getAllByRole('button', { name: 'Remove Item' })[0])

    userEvent.selectOptions(screen.getByLabelText('Stat Name'), 'Gold')
    userEvent.selectOptions(screen.getAllByLabelText('Condition')[0], '≤')
    fireEvent.blur(screen.getByDisplayValue('2'), { target: { value: '9' } })
    userEvent.click(screen.getAllByRole('button', { name: 'Remove Item' })[0])
  })

  it('shows empty-state copy when a tab has no rows', () => {
    renderPortEditor()
    userEvent.click(screen.getAllByRole('button')[1])
    expect(screen.getByText('No items')).toBeInTheDocument()
    userEvent.click(screen.getByText('Stats'))
    expect(screen.getByText('No Stats')).toBeInTheDocument()
    userEvent.click(screen.getByText('Show If'))
    expect(screen.getByText('No item conditions')).toBeInTheDocument()
    expect(screen.getByText('No Stat Conditions')).toBeInTheDocument()
  })

  it('can change a numeric stat value and remove item/stat rows', () => {
    renderPortEditor({
      [CHOICE_1_PORT]: {
        ...defaultPortMeta,
        itemChanges: [{ name: 'Key', action: 'add' }],
        statChanges: [{ name: 'Health', value: 1, action: '+' }],
      },
    })

    userEvent.click(screen.getAllByRole('button')[1])
    userEvent.click(screen.getAllByRole('button', { name: 'Remove Item' })[0])

    userEvent.click(screen.getByText('Stats'))
    fireEvent.blur(screen.getByLabelText('Number Value (#)'), {
      target: { value: '12' },
    })
    userEvent.selectOptions(screen.getByLabelText('Increase/Decrease/Reset'), '-')
    userEvent.click(screen.getAllByRole('button', { name: 'Remove Item' })[0])
  })
})
