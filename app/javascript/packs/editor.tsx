// Important: Order matters here. Otherwise our flow chart's layout
// calculations fail
import '../src/global.css'
import '../src/button.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Tutorial from '../src/components/Tutorial'
import Editor from '../src/components/Editor'
import { ApplicationComponent, MetaData, PortMeta } from '../src/Store'

declare global {
  const SEED: {
    slug: string
    story: {
      story: any
      meta: MetaData
      portMeta: PortMeta
    },
    viewOnly: boolean
  }
}

const slug = SEED.slug
const story = SEED.story
const viewOnly = SEED.viewOnly

ReactDOM.render(
  <ApplicationComponent slug={slug} {...story}>
    <Editor viewOnly={viewOnly} />
    <Tutorial />
  </ApplicationComponent>,
  document.getElementById('editor')
)
