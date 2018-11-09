// Important: Order matters here. Otherwise our flow chart's layout
// calculations fail
import '../src/global.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Editor from '../src/components/Editor'
import { ApplicationComponent } from '../src/Store'

ReactDOM.render(
  <ApplicationComponent>
    <Editor />
  </ApplicationComponent>,
  document.getElementById('editor')
)
