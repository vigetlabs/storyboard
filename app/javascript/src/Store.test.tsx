import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApplicationComponent, StateConsumer, ApplicationState } from './Store'
import seed from './seed'

describe('ApplicationComponent', () => {
  it('provides default seed story and accepts updates', () => {
    const View = () => (
      <StateConsumer>
        {({ state, updateState }) => (
          <div>
            <span>{state.slug as string}</span>
            <button
              onClick={() =>
                updateState({
                  ...state,
                  slug: 'updated',
                  currentFocusedScene: 'scene-1',
                } as ApplicationState)
              }
            >
              Update
            </button>
          </div>
        )}
      </StateConsumer>
    )

    render(
      <ApplicationComponent slug="demo" story={seed.story} meta={seed.meta}>
        <View />
      </ApplicationComponent>
    )

    expect(screen.getByText('demo')).toBeInTheDocument()
    userEvent.click(screen.getByText('Update'))
    expect(screen.getByText('updated')).toBeInTheDocument()
  })
})
