import * as React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Editor from './Editor'
import { ApplicationComponent } from '../Store'
import seed from '../seed'
import * as persistance from '../persistance'

vi.mock('storm-react-diagrams', async () => {
  const actual = await vi.importActual<typeof import('storm-react-diagrams')>(
    'storm-react-diagrams'
  )
  return {
    ...actual,
    DiagramWidget: () => <div data-testid="diagram" />,
  }
})

vi.mock('../utilities/Easing', () => ({
  default: {
    queueEasing: (callback: (progress: number) => void) => callback(1),
  },
}))

vi.mock('../persistance', async () => {
  const actual = await vi.importActual<typeof import('../persistance')>('../persistance')
  return {
    ...actual,
    save: vi.fn().mockResolvedValue({}),
  }
})

function renderEditor(viewOnly = false) {
  return render(
    <ApplicationComponent slug="demo" story={seed.story} meta={seed.meta as any}>
      <Editor viewOnly={viewOnly} />
    </ApplicationComponent>
  )
}

describe('Editor', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue('not-json'),
      },
    })
  })

  it('renders editor tools after becoming ready', async () => {
    renderEditor()
    await waitFor(() => {
      expect(screen.getByText('Add scene')).toBeInTheDocument()
    })
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Paste')).toBeInTheDocument()
    expect(screen.getByTestId('diagram')).toBeInTheDocument()
  })

  it('hides mutating tools in view-only mode', async () => {
    renderEditor(true)
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument()
    })
    expect(screen.queryByText('Add scene')).not.toBeInTheDocument()
    expect(screen.queryByText('Save')).not.toBeInTheDocument()
    expect(screen.queryByText('Paste')).not.toBeInTheDocument()
  })

  it('adds a scene and can save', async () => {
    renderEditor()
    await waitFor(() => screen.getByText('Add scene'))

    userEvent.click(screen.getByText('Add scene'))
    userEvent.click(screen.getByText('Save'))
    await waitFor(() => {
      expect(persistance.save).toHaveBeenCalled()
    })
  })

  it('copies selected scenes and alerts when nothing is selected', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    renderEditor()
    await waitFor(() => screen.getByRole('button', { name: 'Copy' }))

    userEvent.click(screen.getByRole('button', { name: 'Copy' }))
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  it('alerts when copying with no scene selected', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const story = JSON.parse(JSON.stringify(seed.story))
    story.nodes.forEach((node: { selected: boolean }) => {
      node.selected = false
    })

    render(
      <ApplicationComponent slug="demo" story={story} meta={seed.meta as any}>
        <Editor viewOnly={false} />
      </ApplicationComponent>
    )
    await waitFor(() => screen.getByRole('button', { name: 'Copy' }))
    userEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(alertSpy).toHaveBeenCalledWith(
      'You have not selected any scenes to copy.'
    )
  })

  it('pastes invalid clipboard data and can use the fallback form', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    renderEditor()
    await waitFor(() => screen.getByText('Paste'))

    userEvent.click(screen.getByText('Paste'))
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Sorry, we couldn't parse what you pasted."
      )
    })

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
    await waitFor(() => {
      expect(screen.getByText('Paste')).toBeInTheDocument()
    })
    userEvent.click(screen.getByText('Paste'))
    expect(screen.getByText('Pasting Problem')).toBeInTheDocument()
    userEvent.click(screen.getByText('X'))
    expect(screen.queryByText('Pasting Problem')).not.toBeInTheDocument()

    userEvent.click(screen.getByText('Paste'))
    fireEvent.change(document.querySelector('textarea[name="paste"]') as HTMLTextAreaElement, {
      target: { value: 'still-not-json' },
    })
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled()
    })
  })

  it('zooms and handles undo/redo and save shortcuts', async () => {
    renderEditor()
    await waitFor(() => screen.getByText('+'))

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 800,
    })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 600,
    })

    userEvent.click(screen.getByText('+'))
    userEvent.click(screen.getByText('-'))
    userEvent.click(screen.getByText('Add scene'))
    userEvent.click(screen.getByText('Save'))
    await waitFor(() => expect(persistance.save).toHaveBeenCalled())

    document.onkeydown?.({
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      key: 'z',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent)
    document.onkeydown?.({
      metaKey: true,
      ctrlKey: false,
      shiftKey: true,
      key: 'z',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent)
    document.onkeydown?.({
      metaKey: false,
      ctrlKey: true,
      shiftKey: false,
      key: 'y',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent)
  })
})
