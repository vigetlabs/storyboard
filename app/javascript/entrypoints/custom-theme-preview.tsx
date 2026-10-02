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
  const content = await load(slug)
  const customThemePreview = document.getElementById('custom-theme-preview')

  if (content) {
    ReactDOM.render(
      <Player
        title={SEED.title}
        description='This story about a lemonade stand is here to demo your custom theme.'
        story={content.story}
        meta={content.meta}
        portMeta={content.portMeta}
        theme='Custom'
        isOffline={false}
        backButton={true}
        debuggable={true}
        characterCard={true}
        showSource={false}
      />,
      customThemePreview
    )
  }
}

render()
