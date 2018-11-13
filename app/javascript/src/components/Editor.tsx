import * as React from 'react'

import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DefaultPortModel,
  DefaultLinkModel,
  DiagramWidget,
  NodeModel
} from 'storm-react-diagrams'

import SceneEditor from './SceneEditor'
import Workspace from './Workspace'

import './Editor.css'
import './FlowChart.css'
import { StateConsumer, ApplicationState } from '../Store'
import { save } from '../persistance'

interface EditorState {
  ready: boolean
  selected: string | null
  saving: boolean
  smartRouting: boolean
}

interface EditorProps {
  state: ApplicationState
  viewOnly: boolean
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
}

class Editor extends React.Component<EditorProps, EditorState> {
  engine: DiagramEngine
  model: DiagramModel

  constructor(props: EditorProps) {
    super(props)

    this.state = {
      ready: false,
      selected: null,
      saving: false,
      smartRouting: true
    }

    this.engine = new DiagramEngine()
    this.model = new DiagramModel()

    this.engine.installDefaultFactories()

    this.model.deSerializeDiagram(this.props.state.story, this.engine)

    for (let key in this.model.nodes) {
      this.watchNode(this.model.nodes[key])
    }

    this.engine.setDiagramModel(this.model)
  }

  async componentDidMount() {
    setTimeout(() => {
      this.setState({ ready: true })

      /**
       * If smartRouting is initialized as false, toggling to true breaks
       * the flow chart engine.
       */
      this.setState({ smartRouting: false })
    }, 100)
  }

  render() {
    const { ready, smartRouting } = this.state
    const { viewOnly } = this.props

    if (ready !== true) {
      return null
    }

    this.calculateNodeColors()
    this.ensureValidLinks()

    return (
      <>
        <Workspace
          onClear={this.clearSelection}
          onRelease={this.eventuallyForceUpdate}
          saveStory={this.saveStory}
        >
          <menu className="EditorTools">
            { viewOnly ? null : this.renderAddScene() }
            { viewOnly ? null : this.renderSave() }

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

            <label className="EditorButton">
              <input type="checkbox" checked={smartRouting} onChange={this.toggleRouting} /> Routing
            </label>
          </menu>
          <DiagramWidget
            diagramEngine={this.engine}
            maxNumberPointsPerLink={0}
            smartRouting={smartRouting}
          />
        </Workspace>

        <SceneEditor
          focus={this.getFocus()}
          requestPaint={this.eventuallyForceUpdate}
          onClear={this.clearSelection}
        />
      </>
    )
  }

  private renderAddScene() {
    return (
      <>
        <button className="EditorButton" onClick={this.addScene}>
          Add scene
        </button>

        <hr className="EditorToolsDivider" />
      </>
    )
  }

  private renderSave() {
    return (
      <button className="EditorButton" onClick={this.saveStory}>
        {this.state.saving ? 'Saving...' : 'Save'}
      </button>
    )
  }

  private clearSelection = () => {
    this.model.clearSelection()
    this.eventuallyForceUpdate()
  }

  private watchNode = (node: NodeModel) => {
    node.addListener({
      entityRemoved: () => {
        this.clearSelection()
        this.repaint()
        this.forceUpdate()
      }
    })
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
      ...this.props.state,
      story: this.model.serializeDiagram(),
    }
  }

  private rand = (num: number) => {
    return (Math.random() * num) - (num / 2)
  }

  private addScene = () => {
    let node = new DefaultNodeModel('New Scene')

    let workspace = document.getElementsByClassName("EditorWorkspace")[0]
    let width = workspace.clientWidth * 0.4
    let height = workspace.clientHeight * 0.75

    let zoomModifier = (100 / this.model.zoom)
    let targetX = (width + this.rand(100) - this.model.offsetX) * zoomModifier
    let targetY = (height + this.rand(100) - this.model.offsetY) * zoomModifier

    node.setPosition(targetX, targetY)
    node.addInPort('In')

    this.watchNode(node)

    this.model.addNode(node)

    this.clearSelection()
    node.selected = true

    this.repaint()
  }

  private toFile() {
    let dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(this.serialize()))
    let anchor = document.createElement('a')

    anchor.setAttribute('href', dataStr)
    anchor.setAttribute('download', this.props.state.slug + '.json')
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
    reader.onload = function () {
      try {
        scope.props.updateState(JSON.parse(`${this.result}`))
      } catch (error) {
        alert("Sorry, we couldn't parse your file :(")
      }
    }

    reader.readAsText(file)
  }

  private saveStory = async () => {
    return
    if (this.props.viewOnly) {
    }

    this.setState({ saving: true })

    const then = Date.now()

    try {
      await save(this.props.state.slug, this.serialize())
    } catch (error) {
      alert(
        "Sorry! We couldn't save! It's possible you do not have internet access. Be sure to export your scene before closing the browser!"
      )
    } finally {
      let timeLeft = 400 - Math.min(Date.now() - then, 400)

      // Add a stupid delay to make it look like it really did save
      setTimeout(() => {
        this.setState({ saving: false })
      }, timeLeft)
    }
  }

  private toggleRouting = () => {
    this.setState({
      smartRouting: !this.state.smartRouting
    })
  }

  private calculateNodeColors = () => {
    let ids = Object.keys(this.model.nodes)

    ids.map((id) => {
      let node = this.model.nodes[id] as DefaultNodeModel

      let inPortsWithLinks = []
      let outPortsWithLinks = []
      let outPorts = []

      for (let key in node.ports) {
        let port = node.ports[key] as DefaultPortModel
        if (port.in === true) {
          if (Object.keys(port.links).length) {
            inPortsWithLinks.push(port)
          }
        } else {
          outPorts.push(port)

          if (Object.keys(port.links).length) {
            outPortsWithLinks.push(port)
          }
        }
      }

      if (!inPortsWithLinks.length && outPortsWithLinks.length) {
        // start: has no [in ports with links], [has out ports with links]
        node.color = '#4CAF50'
      } else if (!inPortsWithLinks.length && !outPortsWithLinks.length) {
        // orphan: has no [in/out ports with links]
        node.color = '#ffeb3b'
      } else if (!outPorts.length) {
        // end: has no out ports
        node.color = '#f6412d'
      } else  {
        // connected
        node.color = '#00bfff'
      }
    })
  }

  private ensureValidLinks = () => {
    for (let key in this.model.links) {
      let link = this.model.links[key]

      if (link.targetPort === null) {
        this.model.links[key].remove()
      }

      if (link.sourcePort && link.targetPort) {
        let sourcePort = link.sourcePort as DefaultPortModel
        let targetPort = link.targetPort as DefaultPortModel

        if (sourcePort.in && !targetPort.in) {
          // link was dragged from target to source, switch the ports
          link.targetPort = sourcePort
          link.sourcePort = targetPort
        }
      }
    }
  }
}

interface InboundProps {
  viewOnly: boolean
}
export default (inbound: InboundProps) => (
  <StateConsumer>{props => (
    <Editor {...inbound} {...props} />
  )}</StateConsumer>
)
