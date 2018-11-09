import * as React from 'react'

import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DiagramWidget
} from 'storm-react-diagrams'
import SceneEditor from './SceneEditor'
import seed from '../seed'

import './Editor.css'
import './FlowChart.css'
import { StateConsumer, ApplicationState } from '../Store'

interface EditorState {
  ready: Boolean
}

interface EditorProps {
  state: ApplicationState
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
}

class Editor extends React.Component<EditorProps, EditorState> {
  engine: DiagramEngine
  model: DiagramModel

  constructor(props: EditorProps) {
    super(props)

    this.state = { ready: false }

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
    this.model.deSerializeDiagram(this.props.state.story, this.engine)

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
        <DiagramWidget diagramEngine={this.engine} maxNumberPointsPerLink={0} />
        <SceneEditor />
      </div>
    )
  }

  private refresh() {
    const { state, updateState } = this.props

    updateState({ ...state, story: this.model.serializeDiagram() })
  }

  private addScene = (event: React.SyntheticEvent) => {
    var node = new DefaultNodeModel('New Scene')

    node.setPosition(100, 100)
    node.addInPort('In')

    this.model.addNode(node)

    this.refresh()
  }

  private toFile(model: DiagramModel) {
    let data = { story: model.serializeDiagram(), meta: this.props.state.meta }
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
        scope.props.updateState(JSON.parse(`${this.result}`))
      } catch (error) {
        alert("Sorry, we couldn't parse your file :(")
      }
    }

    reader.readAsText(file)
  }
}

export default () => (
  <StateConsumer>{props => <Editor {...props} />}</StateConsumer>
)
