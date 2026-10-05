import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Workspace from './Workspace'

const C_KEY = 67
const V_KEY = 86

describe('Workspace', () => {
  it('saves on an interval when the mouse is not down', () => {
    vi.useFakeTimers()
    const saveStory = vi.fn()
    render(
      <Workspace
        onClear={vi.fn()}
        onRelease={vi.fn()}
        onCopy={vi.fn()}
        onPaste={vi.fn()}
        saveStory={saveStory}
      >
        <span>canvas</span>
      </Workspace>
    )

    vi.advanceTimersByTime(10000)
    expect(saveStory).toHaveBeenCalledWith({ force: false })
    vi.useRealTimers()
  })

  it('treats a long press as a drag that clears selection on release', () => {
    vi.useFakeTimers()
    const onClear = vi.fn()
    const onRelease = vi.fn()

    render(
      <Workspace
        onClear={onClear}
        onRelease={onRelease}
        onCopy={vi.fn()}
        onPaste={vi.fn()}
        saveStory={vi.fn()}
      >
        <span>canvas</span>
      </Workspace>
    )

    const workspace = screen.getByText('canvas').parentElement as HTMLElement
    fireEvent.mouseDown(workspace)
    vi.advanceTimersByTime(200)
    fireEvent.mouseMove(workspace)
    fireEvent.mouseUp(workspace)

    expect(onClear).toHaveBeenCalled()
    expect(onRelease).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('copies and pastes with keyboard shortcuts', () => {
    const onCopy = vi.fn()
    const onPaste = vi.fn()

    render(
      <Workspace
        onClear={vi.fn()}
        onRelease={vi.fn()}
        onCopy={onCopy}
        onPaste={onPaste}
        saveStory={vi.fn()}
      >
        <span>canvas</span>
      </Workspace>
    )

    const workspace = screen.getByText('canvas').parentElement as HTMLElement
    fireEvent.keyDown(workspace, { ctrlKey: true, keyCode: C_KEY })
    fireEvent.keyDown(workspace, { metaKey: true, keyCode: V_KEY })

    expect(onCopy).toHaveBeenCalled()
    expect(onPaste).toHaveBeenCalled()
  })
})
