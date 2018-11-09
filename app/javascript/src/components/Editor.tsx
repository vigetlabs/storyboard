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
  engine: DiagramEngine
  model: DiagramModel

  constructor(props: Object) {
    super(props)

    this.state = {
      ready: false,
      scene: seed
    }

    this.engine = new DiagramEngine()
    this.model = new DiagramModel()

    this.engine.setDiagramModel(this.model)
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

    this.engine.installDefaultFactories()
    this.model.deSerializeDiagram(this.state.scene, this.engine)

    return (
      <div className="EditorWorkspace">
        <menu className="EditorTools">
          <button
            className="EditorButton"
            onClick={() => this.toFile(this.model)}
          >
            Export
          </button>

          <button className="EditorButton" onClick={this.addScene}>
            Add scene
          </button>

          <label className="EditorButton">
            Import
            <input
              type="file"
              onChange={event => this.loadFile(event.target.files)}
            />
          </label>
        </menu>
        <DiagramWidget diagramEngine={this.engine} />
        <SceneEditor />
      </div>
    )
  }

  private refresh() {
    this.setState({ scene: this.model.serializeDiagram() })
  }

  private addScene = (event: React.SyntheticEvent) => {
    var node = new DefaultNodeModel('New Scene')

    node.setPosition(100, 100)

    this.model.addNode(node)

    this.refresh()
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
