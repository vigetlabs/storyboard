// Important: Order matters here. Otherwise our flow chart's layout
// calculations fail

import '../src/global.css'
import '../src/button.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Player from '../src/components/Player'

const story = SEED.story

ReactDOM.render(
  <Player title={SEED.title} description={SEED.description} story={story.story} meta={story.meta} portMeta={story.portMeta} />,
  document.getElementById('player')
)
