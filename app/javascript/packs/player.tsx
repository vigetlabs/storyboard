// Important: Order matters here. Otherwise our flow chart's layout
// calculations fail

import '../src/global.css'
import '../src/button.css'
import '../src/modal.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Player from '../src/components/Player'
import { load } from '../src/persistance'

const slug = SEED.slug

async function render() {
  const content = SEED.isOffline ? SEED.story : await load(slug)
  const player = document.getElementById('player')

  if (content) {
    ReactDOM.render(
      <Player
        title={SEED.title}
        description={SEED.description}
        story={content.story}
        meta={content.meta}
        portMeta={content.portMeta}
        theme={SEED.theme}
        isOffline={SEED.isOffline}
        backButton={SEED.backButton}
        debug={player!.dataset.debug == 'true'}
      />,
      player
    )
  }
}

render()
