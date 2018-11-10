import * as React from 'react'

import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DiagramWidget
} from 'storm-react-diagrams'
import SceneEditor from './SceneEditor'

import Workspace from './Workspace'

import './Editor.css'
import './FlowChart.css'
import { StateConsumer, ApplicationState } from '../Store'
import { save } from '../persistance'

interface EditorState {
  ready: Boolean
  selected: string | null
  saving: Boolean
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
      selected: null,
      saving: false
    }

    this.engine = new DiagramEngine()
    this.model = new DiagramModel()

    this.engine.installDefaultFactories()

    this.model.deSerializeDiagram(this.props.state.story, this.engine)

    for (let key in this.model.nodes) {
      this.model.nodes[key].addListener({
        entityRemoved: () => this.forceUpdate()
      })
    }

    this.engine.setDiagramModel(this.model)
  }

  async componentDidMount() {
    setTimeout(() => {
      this.setState({ ready: true })
    }, 100)
  }

  render() {
    const { ready, saving } = this.state

    if (ready !== true) {
      return null
    }

    return (
      <Workspace
        onClear={this.clearSelection}
        onRelease={this.eventuallyForceUpdate}
      >
        <menu className="EditorTools">
          <button className="EditorButton" onClick={this.addScene}>
            Add scene
          </button>

          <hr className="EditorToolsDivider" />

          <button className="EditorButton" onClick={this.saveStory}>
            {saving ? 'Saving...' : 'Save'}
          </button>

          <button className="EditorButton" onClick={() => this.toFile()}>
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
        <SceneEditor focus={this.getFocus()} requestPaint={this.eventuallyForceUpdate} />
      </Workspace>
    )
  }

  clearSelection = () => {
    this.model.clearSelection()
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

  private repaint = () => this.engine.repaintCanvas()

  private eventuallyForceUpdate = () =>
    requestAnimationFrame(() => {
      this.forceUpdate()
    })

  private serialize() {
    return {
      story: this.model.serializeDiagram(),
      meta: this.props.state.meta
    }
  }

  private addScene = () => {
    var node = new DefaultNodeModel('New Scene')
    node.setPosition(100, 100)
    node.addInPort('In')
    node.addOutPort('Next')
    this.model.addNode(node)
    this.repaint()
  }

  private toFile() {
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

  private saveStory = async () => {
    this.setState({ saving: true })

    const then = Date.now()

    try {
      await save(this.props.state.slug, this.serialize())
    } catch (error) {
      alert(
        "Sorry! We couldn't save! It's possible you do not have internet access. Be sure to export your scene before closing the browser!"
      )
    } finally {
      let timeLeft = 600 - Math.min(Date.now() - then, 600)

      // Add a stupid delay to make it look like it really did save
      setTimeout(() => {
        this.setState({ saving: false })
      }, timeLeft)
    }
  }
}

export default () => (
  <StateConsumer>{props => <Editor {...props} />}</StateConsumer>
)
