import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Editor from '../src/components/Editor'

<<<<<<< HEAD
import '../src/global.css'
import { ApplicationComponent } from '../src/Store'
||||||| merged common ancestors
import '../components/global.css'
import { ApplicationComponent } from '../src/Store';
=======
import '../src/global.css'
import { ApplicationComponent } from '../src/Store';
>>>>>>> Add Story and Scene Types

ReactDOM.render(<ApplicationComponent>
  <Editor />
</ApplicationComponent>, document.getElementById('editor'))
