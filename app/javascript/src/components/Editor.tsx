import * as React from 'react'

import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DiagramWidget,
  BaseModel,
  NodeModel
} from 'storm-react-diagrams'
import SceneEditor from './SceneEditor'

import './Editor.css'
import './FlowChart.css'
import { StateConsumer, ApplicationState } from '../Store'
import { save } from '../persistance'

interface EditorState {
  ready: Boolean
  selected: string | null
}

interface EditorProps {
  state: ApplicationState
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
}

class Editor extends React.Component<EditorProps, EditorState> {
  engine: DiagramEngine
  model: DiagramModel

  isMouseDown: Boolean = false
  isDragging: Boolean = false

  constructor(props: EditorProps) {
    super(props)

    this.state = {
      ready: false,
      selected: null
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
    const { ready, selected } = this.state

    if (ready !== true) {
      return null
    }

    this.engine.installDefaultFactories()

    if (this.props.state.story) {
      this.model.deSerializeDiagram(this.props.state.story, this.engine)
    }

    return (
      <div
        className="EditorWorkspace"
        onMouseUp={this.releaseMouse}
        onMouseDown={this.pressMouse}
        onMouseMove={this.dragMouse}
      >
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
        <SceneEditor focus={this.getFocus()} requestPaint={this.refresh} />
      </div>
    )
  }

  releaseMouse = () => {
    if (this.isDragging) {
      this.model.clearSelection()
    }

    this.isMouseDown = false
    this.isDragging = false

    this.refreshEventually()
  }

  pressMouse = () => {
    this.isMouseDown = true
  }

  dragMouse = () => {
    this.isDragging = this.isMouseDown
  }

  private getFocus(): DefaultNodeModel | null {
    const selected = this.model.getSelectedItems().filter(item => {
      return item instanceof DefaultNodeModel
    })

    if (selected.length == 1) {
      return selected[0] as DefaultNodeModel
    }

    return null
  }

  private refresh = () => {
    const { state, updateState } = this.props

    updateState({
      ...state,
      story: this.model.serializeDiagram()
    })
  }

  /**
   * In order to handle edge cases with rendering during mouse events,
   * we wait for the next tick to update the flow chart
   */
  private refreshEventually = () => requestAnimationFrame(this.refresh)

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
    const { updateState, state } = this.props
    updateState({ ...state, currentFocusedScene: id })
  }

  private saveStory = (event: React.SyntheticEvent) => {
    save(this.props.state.slug, this.serialize())
  }
}

export default () => (
  <StateConsumer>{props => <Editor {...props} />}</StateConsumer>
)
