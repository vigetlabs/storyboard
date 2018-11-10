import * as React from 'react'

import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DiagramWidget,
  BaseModel
} from 'storm-react-diagrams'
import SceneEditor from './SceneEditor'

import './Editor.css'
import './FlowChart.css'
import { StateConsumer, ApplicationState } from '../Store'
import { save } from '../persistance'

interface EditorState {
  ready: Boolean
  saving: false
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

    this.state = {
      ready: false
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

  shouldComponentUpdate(nextProps: EditorProps, nextState: EditorState) {
    if (
      this.props.state.story.id !== nextProps.state.story.id ||
      this.state.ready !== nextState.ready
    )
      return true
    else return false
  }

  render() {
    if (this.state.ready !== true) {
      return null
    }

    this.engine.installDefaultFactories()

    if (this.props.state.story) {
      this.model.deSerializeDiagram(this.props.state.story, this.engine)
    }

    for (let key in this.model.nodes) {
      this.model.nodes[key].addListener({
        selectionChanged: event =>
          event.isSelected && this.updateCurrentlySelected(event.entity.id)
      })
    }

    return (
      <div className="EditorWorkspace">
        <menu className="EditorTools">
          <button className="EditorButton" onClick={this.addScene}>
            Add scene
          </button>

          <hr className="EditorToolsDivider" />

          <button className="EditorButton" onClick={this.saveStory}>
            Save
          </button>

          <button
            className="EditorButton"
            onClick={() => this.toFile(this.model)}
          >
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
        <DiagramWidget diagramEngine={this.engine} maxNumberPointsPerLink={0} />
        <SceneEditor />
      </div>
    )
  }

  private refresh() {
    const { state, updateState } = this.props

    updateState({
      story: this.model.serializeDiagram()
    })
  }

  private serialize() {
    return {
      story: this.model.serializeDiagram(),
      meta: this.props.state.meta
    }
  }

  private addScene = (event: React.SyntheticEvent) => {
    var node = new DefaultNodeModel('New Scene')

    node.setPosition(100, 100)

    node.addInPort('In')
    node.addOutPort('Next')

    this.model.addNode(node)

    this.refresh()
  }

  private toFile(model: DiagramModel) {
    let dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(this.serialize()))
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

  private updateCurrentlySelected(id: string) {
    const { updateState } = this.props
    updateState({ currentFocusedScene: id })
  }

  private saveStory = (event: React.SyntheticEvent) => {
    save(this.props.state.slug, this.serialize())
  }
}

export default () => (
  <StateConsumer>{props => <Editor {...props} />}</StateConsumer>
)
