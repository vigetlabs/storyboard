import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Editor from '../src/components/Editor'

import '../src/global.css'
import { ApplicationComponent } from '../src/Store'

ReactDOM.render(<ApplicationComponent>
  <Editor />
</ApplicationComponent>, document.getElementById('editor'))
