import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  load,
  save,
  savePhoto,
  removePhoto,
  saveAudio,
  removeAudio,
} from './persistance'
import seed from './seed'
import { ApplicationState } from './Store'

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  } as Response
}

const state = {
  slug: 'demo',
  story: seed.story,
  meta: seed.meta,
  portMeta: {},
  modifiers: [],
} as unknown as ApplicationState

describe('persistance', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('saves adventure content', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true }))

    await save('demo', state)

    expect(fetch).toHaveBeenCalledWith('/api/demo', expect.objectContaining({
      method: 'POST',
    }))
  })

  it('throws when save fails', async () => {
    const failure = jsonResponse({}, false)
    vi.mocked(fetch).mockResolvedValue(failure)
    await expect(save('demo', state)).rejects.toBe(failure)
  })

  it('loads adventure content', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ content: { story: seed.story } }))
    await expect(load('demo')).resolves.toEqual({ story: seed.story })
  })

  it('throws when load fails', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}, false))
    await expect(load('demo')).rejects.toThrow('Unable to load editor data.')
  })

  it('saves a photo and updates state', async () => {
    const updateState = vi.fn()
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ url: '/photo.png' }))

    await savePhoto('scene-1', 'data:image', state, updateState)

    expect(fetch).toHaveBeenCalledWith('/api/photos/scene-1', expect.objectContaining({
      method: 'POST',
    }))
    expect(updateState).toHaveBeenCalled()
  })

  it('throws when photo save fails', async () => {
    const failure = jsonResponse({}, false)
    vi.mocked(fetch).mockResolvedValue(failure)
    await expect(savePhoto('scene-1', 'data:image', state, vi.fn())).rejects.toBe(failure)
  })

  it('removes a photo', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true }))
    await removePhoto('scene-1')
    expect(fetch).toHaveBeenCalledWith('/api/photos/scene-1', expect.objectContaining({
      method: 'DELETE',
    }))
  })

  it('throws when photo remove fails', async () => {
    const failure = jsonResponse({}, false)
    vi.mocked(fetch).mockResolvedValue(failure)
    await expect(removePhoto('scene-1')).rejects.toBe(failure)
  })

  it('saves audio and updates state', async () => {
    const updateState = vi.fn()
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ url: '/audio.mp3' }))

    await saveAudio('scene-1', 'data:audio', state, updateState)

    expect(fetch).toHaveBeenCalledWith('/api/audio-tracks/scene-1', expect.objectContaining({
      method: 'POST',
    }))
    expect(updateState).toHaveBeenCalled()
  })

  it('throws when audio save fails', async () => {
    const failure = jsonResponse({}, false)
    vi.mocked(fetch).mockResolvedValue(failure)
    await expect(saveAudio('scene-1', 'data:audio', state, vi.fn())).rejects.toBe(failure)
  })

  it('removes audio', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true }))
    await removeAudio('scene-1')
    expect(fetch).toHaveBeenCalledWith('/api/audio-tracks/scene-1', expect.objectContaining({
      method: 'DELETE',
    }))
  })

  it('throws when audio remove fails', async () => {
    const failure = jsonResponse({}, false)
    vi.mocked(fetch).mockResolvedValue(failure)
    await expect(removeAudio('scene-1')).rejects.toBe(failure)
  })
})
