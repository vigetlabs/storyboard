// Important: Order matters here. Otherwise our flow chart's layout
// calculations fail
import '../src/global.css'
import '../src/button.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Tutorial from '../src/components/Tutorial'
import Editor from '../src/components/Editor'
import { ApplicationComponent, MetaData, PortMeta } from '../src/Store'
import { load } from '../src/persistance'
import defaultStory from '../src/seed'
import { useSyncedStore } from "@syncedstore/react";
import { store } from "../src/syncstore";
import SyncedStore from "../src/SyncedStore";

// Similar to the note in application.tsx old data was loaded so it would show
// a version of the story but you can't update it. This reloads the page
// More info: https://stackoverflow.com/a/42063482/1153149
window.addEventListener('pageshow', e => {
  if (
    e.persisted ||
    (window.performance && window.performance.navigation.type === 2)
  )
    location.reload(true)
})

declare global {
  const SEED: {
    slug: string
    title: string
    description: string
    theme: string
    viewOnly: boolean
    isOffline: boolean
    backButton: boolean
    debuggable: boolean
    characterCard: boolean
    showSource: boolean
    story: {
      story: any
      meta: MetaData
      portMeta: PortMeta
    }
  }
}

const slug = SEED.slug
const viewOnly = SEED.viewOnly

async function render() {
  // const content = await load(slug)

  // if (content) {
    ReactDOM.render(
      <SyncedStore>
        <ApplicationComponent slug={slug}>
          <Editor viewOnly={viewOnly} />
          <Tutorial />
        </ApplicationComponent>
      </SyncedStore>,
      document.getElementById('editor')
    )
  // } else {
  //   ReactDOM.render(
  //     <ApplicationComponent story={defaultStory} slug={slug}>
  //       <Editor viewOnly={viewOnly} />
  //       <Tutorial />
  //     </ApplicationComponent>,
  //     document.getElementById('editor')
  //   )
  // }
}

render()
