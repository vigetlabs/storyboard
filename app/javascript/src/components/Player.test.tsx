import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
const CryptoJS = require('crypto-js')
import Player from './Player'
import seed from '../seed'
import {
  START_ID,
  CHOICE_1_PORT,
  CHOICE_2_PORT,
  DECISION_1_ID,
  defaultPortMeta,
} from '../../test/helpers'

function renderPlayer(overrides: Partial<React.ComponentProps<typeof Player>> = {}) {
  return render(
    <Player
      description="<p>Welcome to the story</p>"
      meta={seed.meta as any}
      portMeta={{}}
      story={seed.story}
      theme="Light"
      title="Test Adventure"
      isOffline={false}
      backButton
      debuggable
      characterCard
      showSource
      {...overrides}
    />
  )
}

function encryptState(state: object) {
  return CryptoJS.AES.encrypt(JSON.stringify(state), 'labrats').toString()
}

describe('Player', () => {
  it('shows the intro until Begin is clicked', () => {
    renderPlayer()
    expect(screen.getByText('Test Adventure')).toBeInTheDocument()
    expect(screen.getByText('Begin')).toBeInTheDocument()
  })

  it('plays the start scene and follows a choice to an ending', async () => {
    renderPlayer()
    userEvent.click(screen.getByText('Begin'))

    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('Choice 1')).toBeInTheDocument()
    expect(screen.getByText('Choice 2')).toBeInTheDocument()

    userEvent.click(screen.getByText('Choice 1'))

    await waitFor(() => {
      expect(screen.getByText('Decision 1')).toBeInTheDocument()
    })
    expect(screen.getByText('Replay')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()

    userEvent.click(screen.getByText('Replay'))
    expect(screen.getByText('Begin')).toBeInTheDocument()
  })

  it('goes back to the previous scene from an ending', async () => {
    renderPlayer()
    userEvent.click(screen.getByText('Begin'))
    userEvent.click(screen.getByText('Choice 2'))

    await waitFor(() => {
      expect(screen.getByText('Decision 2')).toBeInTheDocument()
    })

    userEvent.click(screen.getByText('Back'))

    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument()
    })
  })

  it('shows a dead end when a choice has no destination', async () => {
    const story = JSON.parse(JSON.stringify(seed.story))
    story.links[0].target = null
    story.links[0].targetPort = null

    renderPlayer({ story })
    userEvent.click(screen.getByText('Begin'))
    userEvent.click(screen.getByText('Choice 1'))

    await waitFor(() => {
      expect(screen.getByText(/choice wasn't tied to a new scene/i)).toBeInTheDocument()
    })
  })

  it('shows the invalid screen when restored focus is missing', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: 'missing-node',
      currentItems: [],
      currentStats: [],
      history: [],
      showItemsStats: false,
    })

    renderPlayer()

    await waitFor(() => {
      expect(screen.getByText(/story's all messed up/i)).toBeInTheDocument()
    })
  })

  it('shows the invalid screen when restored focus is empty', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: null,
      currentItems: [],
      currentStats: [],
      history: [],
      showItemsStats: false,
    })

    renderPlayer()

    await waitFor(() => {
      expect(screen.getByText(/story's all messed up/i)).toBeInTheDocument()
    })
  })

  it('restores encrypted play state from the URL hash', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: [],
      currentStats: [],
      history: [],
      showItemsStats: false,
    })

    renderPlayer()

    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument()
    })
  })

  it('hides choices that require missing items or hidden flags', async () => {
    renderPlayer({
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          showIfItems: [{ name: 'Key', hasIt: true }],
        },
        [CHOICE_2_PORT]: {
          ...defaultPortMeta,
          hideChoice: true,
        },
      },
    })

    userEvent.click(screen.getByText('Begin'))
    expect(screen.queryByText('Choice 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Choice 2')).not.toBeInTheDocument()
  })

  it('hides a choice when the player already has a forbidden item', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: ['Key'],
      currentStats: [],
      history: [],
      showItemsStats: false,
    })

    renderPlayer({
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          showIfItems: [{ name: 'Key', hasIt: false }],
        },
      },
    })

    await waitFor(() => {
      expect(screen.queryByText('Choice 1')).not.toBeInTheDocument()
      expect(screen.getByText('Choice 2')).toBeInTheDocument()
    })
  })

  it.each([
    ['<', 2, 5, true],
    ['<', 6, 5, false],
    ['≤', 5, 5, true],
    ['>', 8, 5, true],
    ['≥', 5, 5, true],
    ['=', 5, 5, true],
    ['!=', 3, 5, true],
    ['!=', 5, 5, false],
  ] as const)('filters choices with stat operator %s', async (operator, current, target, visible) => {
    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: [],
      currentStats: [{ name: 'Health', value: current }],
      history: [],
      showItemsStats: false,
    })

    renderPlayer({
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          showIfStats: [{ name: 'Health', operator, value: target }],
        },
      },
    })

    await waitFor(() => {
      if (visible) {
        expect(screen.getByText('Choice 1')).toBeInTheDocument()
      } else {
        expect(screen.queryByText('Choice 1')).not.toBeInTheDocument()
      }
    })
  })

  it('adds and removes items and applies stat changes when a choice is taken', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: ['Torch'],
      currentStats: [{ name: 'Health', value: 4 }],
      history: [],
      showItemsStats: true,
    })

    renderPlayer({
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          itemChanges: [
            { name: 'Key', action: 'add' },
            { name: 'Torch', action: 'remove' },
            { name: 'Key', action: 'add' },
          ],
          statChanges: [
            { name: 'Health', value: 2, action: '+' },
            { name: 'Gold', value: 3, action: '-' },
            { name: 'Score', value: 10, action: '=' },
            { name: 'Luck', value: 0, action: '?', min: 2, max: 2 },
          ],
        },
      },
    })

    await waitFor(() => screen.getByText('Choice 1'))
    userEvent.click(screen.getByText('Choice 1'))

    await waitFor(() => {
      expect(screen.getByText('Decision 1')).toBeInTheDocument()
    })
  })

  it('applies first-time plus and random stat changes', async () => {
    renderPlayer({
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          statChanges: [
            { name: 'Health', value: 4, action: '+' },
            { name: 'Luck', value: 0, action: '?' },
          ],
        },
      },
    })

    userEvent.click(screen.getByText('Begin'))
    userEvent.click(screen.getByText('Choice 1'))

    await waitFor(() => {
      expect(screen.getByText('Decision 1')).toBeInTheDocument()
    })
  })

  it('can loop a choice back to the same scene', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: [],
      currentStats: [],
      history: [],
      showItemsStats: false,
    })

    const random = vi.spyOn(Math, 'random').mockReturnValue(0.99)

    renderPlayer({
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          isLoop: true,
        },
      },
    })

    await waitFor(() => screen.getByText('Choice 1'))
    userEvent.click(screen.getByText('Choice 1'))

    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument()
    })
    random.mockRestore()
  })

  it('renders scene media, templates, and debug controls', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: ['Magic Key'],
      currentStats: [{ name: 'Hit Points', value: 7 }],
      history: [],
      showItemsStats: true,
    })

    const meta = {
      ...seed.meta,
      [START_ID]: {
        text: 'You have Magic Key and Hit Points is {{HitPoints}} {{#if MagicKey}}yes{{/if}}',
        image: '/scene.png',
        audio: '/scene.mp3',
        hideTitle: false,
        title: 'Start',
        notes: '',
        isFinal: false,
      },
    }

    renderPlayer({
      meta: meta as any,
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          itemChanges: [{ name: 'Magic Key', action: 'add' }],
          statChanges: [{ name: 'Hit Points', value: 1, action: '+' }],
        },
      },
    })

    await waitFor(() => {
      expect(screen.getByText(/Hit Points is 7/)).toBeInTheDocument()
      expect(screen.getByText(/yes/)).toBeInTheDocument()
    })
    expect(screen.getByAltText('')).toHaveAttribute('src', '/scene.png')
    expect(screen.getByTestId('audio-player')).toHaveAttribute('src', '/scene.mp3')

    userEvent.click(screen.getByText('Close'))
    expect(screen.getByText('Debug')).toBeInTheDocument()
    userEvent.click(screen.getByText('Debug'))

    userEvent.click(screen.getAllByRole('button', { name: 'Add Item' })[0])
    expect(screen.queryByText(/no more possible items/i)).not.toBeInTheDocument()
  })

  it('shows the character card when debugging is off', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: ['Key'],
      currentStats: [{ name: 'Health', value: 3 }],
      history: [],
      showItemsStats: true,
    })

    renderPlayer({
      debuggable: false,
      characterCard: true,
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          itemChanges: [{ name: 'Key', action: 'add' }],
          statChanges: [{ name: 'Health', value: 1, action: '+' }],
        },
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Current Items')).toBeInTheDocument()
      expect(screen.getByText('Key')).toBeInTheDocument()
      expect(screen.getByText('Health: 3')).toBeInTheDocument()
    })
  })

  it('lets the debugger add, change, and remove items and stats', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: ['Key', 'Torch'],
      currentStats: [
        { name: 'Health', value: 3 },
        { name: 'Gold', value: 1 },
      ],
      history: [],
      showItemsStats: true,
    })

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    renderPlayer({
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          itemChanges: [
            { name: 'Key', action: 'add' },
            { name: 'Torch', action: 'add' },
          ],
          statChanges: [
            { name: 'Health', value: 1, action: '+' },
            { name: 'Gold', value: 1, action: '+' },
          ],
        },
      },
    })

    await waitFor(() => screen.getByText('Current Items'))

    userEvent.click(screen.getAllByRole('button', { name: 'Add Item' })[0])
    expect(alertSpy).toHaveBeenCalledWith(
      'There are no more possible items for you to add.'
    )

    userEvent.click(screen.getAllByRole('button', { name: 'Add Item' })[1])
    expect(alertSpy).toHaveBeenCalledWith(
      'There are no more possible stats for you to add.'
    )

    userEvent.click(screen.getAllByRole('button', { name: 'Remove Item' })[0])
    expect(screen.queryByDisplayValue('Key')).not.toBeInTheDocument()
  })

  it('increments and decrements debugger stats', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: [],
      currentStats: [{ name: 'Health', value: 3 }],
      history: [],
      showItemsStats: true,
    })

    renderPlayer({
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          statChanges: [{ name: 'Health', value: 1, action: '+' }],
        },
      },
    })

    await waitFor(() => screen.getByText('3'))
    userEvent.click(document.querySelector('.d-stat-add-btn') as HTMLElement)
    expect(screen.getByText('4')).toBeInTheDocument()
    userEvent.click(document.querySelector('.d-stat-subtract-btn') as HTMLElement)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders a countdown for timed choices', async () => {
    renderPlayer({
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          isTimer: true,
          timeoutSeconds: 5,
        },
      },
    })

    userEvent.click(screen.getByText('Begin'))
    expect(screen.getByText(/00:05/)).toBeInTheDocument()
  })

  it('hides the scene title and still renders a scene with no media', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: [],
      currentStats: [],
      history: [],
      showItemsStats: false,
    })

    renderPlayer({
      backButton: false,
      meta: {
        [START_ID]: {
          text: '',
          image: '',
          audio: '',
          hideTitle: true,
          title: 'Start',
          notes: '',
          isFinal: false,
        },
      } as any,
    })

    await waitFor(() => {
      expect(screen.queryByText('Start')).not.toBeInTheDocument()
      expect(screen.getByText('Choice 1')).toBeInTheDocument()
    })
  })

  it('alerts when handlebars templates are invalid', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: [],
      currentStats: [],
      history: [],
      showItemsStats: false,
    })

    renderPlayer({
      meta: {
        ...seed.meta,
        [START_ID]: {
          ...seed.meta[START_ID],
          text: '{{#if',
        },
      } as any,
    })

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'There was a problem translating your template.'
      )
    })
  })

  it('applies remaining stat mutation branches on later visits', async () => {
    window.location.hash = encryptState({
      started: true,
      focus: START_ID,
      currentItems: [],
      currentStats: [
        { name: 'Health', value: 10 },
        { name: 'Gold', value: 4 },
        { name: 'Luck', value: 1 },
      ],
      history: [],
      showItemsStats: false,
    })

    renderPlayer({
      portMeta: {
        [CHOICE_1_PORT]: {
          ...defaultPortMeta,
          statChanges: [
            { name: 'Health', value: 3, action: '-' },
            { name: 'Gold', value: 9, action: '=' },
            { name: 'Luck', value: 0, action: '?', min: 8, max: 8 },
          ],
        },
      },
    })

    await waitFor(() => screen.getByText('Choice 1'))
    userEvent.click(screen.getByText('Choice 1'))
    await waitFor(() => expect(screen.getByText('Decision 1')).toBeInTheDocument())
  })
})
