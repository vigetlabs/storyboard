import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsEditor from './SettingsEditor'
import { ApplicationState } from '../Store'
import seed from '../seed'
import { startNode } from '../../test/helpers'

describe('SettingsEditor', () => {
  it('toggles the final-scene setting', () => {
    const updateState = vi.fn()
    const focus = startNode()
    const state = {
      slug: 'demo',
      story: seed.story,
      meta: { [focus.id]: { isFinal: false } },
      portMeta: {},
      modifiers: [],
    } as unknown as ApplicationState

    render(
      <SettingsEditor
        state={state}
        updateState={updateState}
        focus={focus}
        checkboxDefault={false}
      />
    )

    userEvent.click(screen.getByRole('button'))
    userEvent.click(screen.getByLabelText('Mark this scene as final?'))
    expect(updateState).toHaveBeenCalled()
  })
})
