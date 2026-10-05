import React from 'react'
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

const memory: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string) => (key in memory ? memory[key] : null),
  setItem: (key: string, value: string) => {
    memory[key] = String(value)
  },
  removeItem: (key: string) => {
    delete memory[key]
  },
  clear: () => {
    Object.keys(memory).forEach(key => delete memory[key])
  },
  key: (index: number) => Object.keys(memory)[index] ?? null,
  get length() {
    return Object.keys(memory).length
  },
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: localStorageMock,
})

window.scrollTo = vi.fn()
vi.stubGlobal('$R', vi.fn())
vi.stubGlobal('alert', vi.fn())

vi.mock('react-audio-player', () => ({
  default: ({ src }: { src?: string }) =>
    src ? <audio data-testid="audio-player" src={src} /> : null,
}))

vi.mock('react-voice-recorder', () => ({
  Recorder: () => <div data-testid="voice-recorder" />,
  default: { Recorder: () => <div data-testid="voice-recorder" /> },
}))

vi.mock('redactor/redactor', () => ({}))

afterEach(() => {
  cleanup()
  localStorageMock.clear()
  window.location.hash = ''
    vi.clearAllMocks()
    window.scrollTo = vi.fn()
  vi.stubGlobal('$R', vi.fn())
  vi.stubGlobal('alert', vi.fn())
})
