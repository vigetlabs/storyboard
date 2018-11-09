import * as React from 'react'

import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  LinkModel,
  DiagramWidget,
  DefaultLinkModel,
  DefaultPortModel,
  DefaultLabelModel
} from 'storm-react-diagrams'
import SceneEditor from './SceneEditor'
import seed from './seed'

import './Editor.css'
import './FlowChart.css'

interface EditorState {
  ready: Boolean
  scene: Object | null
}

class Editor extends React.Component<{}, EditorState> {
  state: EditorState = {
    ready: false,
    scene: seed
  }

  async componentDidMount() {
    setTimeout(() => {
      this.setState({ ready: true })
    }, 100)
  }

  render() {
    if (this.state.ready !== true) {
      return null
    }

    const engine = new DiagramEngine()
    const model = new DiagramModel()

    engine.installDefaultFactories()
    model.deSerializeDiagram(this.state.scene, engine)
    engine.setDiagramModel(model)

    return (
      <div className="EditorWorkspace">
        <menu className="EditorTools">
          <button className="EditorButton" onClick={() => this.toFile(model)}>
            Export
          </button>

          <label className="EditorButton">
            Import
            <input
              type="file"
              onChange={event => this.loadFile(event.target.files)}
            />
          </label>
        </menu>
        <DiagramWidget diagramEngine={engine} />
        <SceneEditor />
      </div>
    )
  }

  private toFile(model: DiagramModel) {
    let data = model.serializeDiagram()
    let dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data))
    let anchor = document.createElement('a')

    anchor.setAttribute('href', dataStr)
    anchor.setAttribute('download', 'scene.json')
    anchor.style.position = 'absolute'

    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  private loadFile(files: FileList | null) {
    if (files == null) return

    let file = files[0]
    let reader = new FileReader()

    let scope = this
    reader.onload = function() {
      try {
        scope.setState({ scene: JSON.parse(`${this.result}`) })
      } catch (error) {
        alert("Sorry, we couldn't parse your file :(")
      }
    }

    reader.readAsText(file)
  }
}

export default Editor
