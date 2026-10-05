import * as React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SceneEditor from './SceneEditor'
import { ApplicationComponent } from '../Store'
import seed from '../seed'
import { startNode, START_ID } from '../../test/helpers'
import * as persistance from '../persistance'

vi.mock('../persistance', async () => {
  const actual = await vi.importActual<typeof import('../persistance')>('../persistance')
  return {
    ...actual,
    savePhoto: vi.fn().mockResolvedValue({ url: '/photo.png' }),
    removePhoto: vi.fn().mockResolvedValue({}),
    saveAudio: vi.fn().mockResolvedValue({ url: '/audio.mp3' }),
    removeAudio: vi.fn().mockResolvedValue({}),
  }
})

class MockFileReader {
  result: string | ArrayBuffer | null = 'data:image/png;base64,abc'
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  readAsDataURL() {
    queueMicrotask(() => {
      this.onload?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>)
    })
  }
}

function renderSceneEditor(metaOverrides = {}) {
  const focus = startNode()
  const requestPaint = vi.fn()
  const updateDiagram = vi.fn()
  const onClear = vi.fn()

  render(
    <ApplicationComponent
      slug="demo"
      story={seed.story}
      meta={{ ...seed.meta, ...metaOverrides } as any}
    >
      <SceneEditor
        focus={focus}
        requestPaint={requestPaint}
        updateDiagram={updateDiagram}
        onClear={onClear}
      />
    </ApplicationComponent>
  )

  return { focus, requestPaint, onClear }
}

describe('SceneEditor', () => {
  beforeEach(() => {
    vi.stubGlobal('FileReader', MockFileReader)
  })

  it('renders nothing without a focused scene', () => {
    const { container } = render(
      <SceneEditor
        focus={null}
        requestPaint={vi.fn()}
        updateDiagram={vi.fn()}
        onClear={vi.fn()}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('edits the scene name, hide-title flag, and traps keys', () => {
    const { focus, requestPaint, onClear } = renderSceneEditor()

    const name = screen.getByDisplayValue('Start')
    fireEvent.change(name, { target: { value: 'Opening' } })
    expect(focus.name).toBe('Opening')
    expect(requestPaint).toHaveBeenCalled()

    fireEvent.click(document.querySelector('input[name="hideTitle"]') as HTMLInputElement)

    fireEvent.keyUp(screen.getByText('Name').closest('aside') as HTMLElement, {
      key: 'Escape',
    })
    expect(onClear).toHaveBeenCalled()
  })

  it('can remove existing image and audio', async () => {
    renderSceneEditor({
      [START_ID]: {
        ...seed.meta[START_ID],
        image: '/scene.png',
        audio: '/scene.mp3',
      },
    })

    expect(screen.getByAltText('')).toHaveAttribute('src', '/scene.png')
    userEvent.click(screen.getByText('Remove Image'))
    expect(persistance.removePhoto).toHaveBeenCalled()

    expect(screen.getByTestId('audio-player')).toBeInTheDocument()
    userEvent.click(screen.getByText('Remove Audio'))
    expect(persistance.removeAudio).toHaveBeenCalled()
  })

  it('uploads image and audio files and records audio', async () => {
    renderSceneEditor()

    const imageInput = document.querySelector(
      'input[accept="image/*"]'
    ) as HTMLInputElement
    const file = new File(['abc'], 'scene.png', { type: 'image/png' })
    Object.defineProperty(imageInput, 'files', { value: [file] })
    fireEvent.change(imageInput)

    await waitFor(() => {
      expect(persistance.savePhoto).toHaveBeenCalled()
    })

    userEvent.click(document.querySelector('.audioButton') as HTMLElement)
    expect(document.querySelector('input[accept="audio/*"]')).toBeInTheDocument()

    const audioInput = document.querySelector(
      'input[accept="audio/*"]'
    ) as HTMLInputElement
    Object.defineProperty(audioInput, 'files', {
      value: [new File(['abc'], 'voice.mp3', { type: 'audio/mpeg' })],
    })
    fireEvent.change(audioInput)

    await waitFor(() => {
      expect(persistance.saveAudio).toHaveBeenCalled()
    })
  })

  it('initializes redactor on text areas', () => {
    renderSceneEditor()
    expect($R).toHaveBeenCalled()
    expect(screen.getByText('Formatting Help')).toHaveAttribute(
      'href',
      '/formatting-help'
    )
  })
})
