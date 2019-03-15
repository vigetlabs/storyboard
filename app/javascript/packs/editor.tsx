// Important: Order matters here. Otherwise our flow chart's layout
// calculations fail
import '../src/global.css'
import '../src/button.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Tutorial from '../src/components/Tutorial'
import Editor from '../src/components/Editor'
import { ApplicationComponent } from '../src/Store'

// Similar to the note in application.tsx old data was loaded so it would show
// a version of the story but you can't update it. This reloads the page
// More info: https://stackoverflow.com/a/42063482/1153149
window.addEventListener("pageshow", (e) => {
  if (e.persisted || window.performance && window.performance.navigation.type === 2)
    location.reload(true)
})

declare global {
  const SEED: {
    slug: string
    title: string
    description: string
    theme: string
    viewOnly: boolean
  }
}

const slug = SEED.slug
const viewOnly = SEED.viewOnly

ReactDOM.render(
  <ApplicationComponent slug={slug}>
    <Editor viewOnly={viewOnly} />
    <Tutorial />
  </ApplicationComponent>,
  document.getElementById('editor')
)
