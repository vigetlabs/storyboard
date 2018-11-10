// Important: Order matters here. Otherwise our flow chart's layout
// calculations fail
import '../src/global.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Editor from '../src/components/Editor'
import { ApplicationComponent, MetaData } from '../src/Store'

declare global {
  const SEED: {
    slug: string
    story: {
      story: any
      meta: MetaData
    }
  }
}

const slug = SEED.slug
const story = SEED.story

ReactDOM.render(
  <ApplicationComponent slug={slug} meta={story.meta} story={story.story}>
    <Editor />
  </ApplicationComponent>,
  document.getElementById('editor')
)
