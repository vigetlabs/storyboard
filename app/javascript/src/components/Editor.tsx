import * as React from 'react'

import {
  DiagramEngine,
  DiagramModel,
  DefaultLinkModel,
  DefaultNodeModel,
  DefaultPortModel,
  DiagramWidget,
  NodeModel
} from 'storm-react-diagrams'

import SceneEditor from './SceneEditor'
import Workspace from './Workspace'
import Easing from '../utilities/Easing'

import './Editor.css'
import './FlowChart.css'
import { StateConsumer, ApplicationState } from '../Store'
import { save } from '../persistance'
import { clone } from '../clone'

interface EditorState {
  ready: boolean
  selected: string | null
  saving: boolean
}

interface EditorProps {
  state: ApplicationState
  viewOnly: boolean
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
}

class Editor extends React.Component<EditorProps, EditorState> {
  engine: DiagramEngine
  model: DiagramModel
  lastSavedState: string

  constructor(props: EditorProps) {
    super(props)

    this.state = {
      ready: false,
      selected: null,
      saving: false
    }
    this.engine = new DiagramEngine()
    this.engine.installDefaultFactories()

    this.updateStory(this.props.state.story)
    this.lastSavedState = clone(this.serialize())
  }

  async componentDidMount() {
    setTimeout(() => {
      this.setState({ ready: true })
    })
  }

  componentDidUpdate({ state: { story } }: EditorProps) {
    let {
      state: { story: newStory }
    } = this.props
    if (JSON.stringify(story) !== JSON.stringify(newStory)) {
      this.updateStory(newStory)
      this.forceUpdate()
    }
  }

  updateStory(story: any) {
    let model = new DiagramModel()
    model.deSerializeDiagram(story, this.engine)

    for (let key in model.nodes) {
      this.watchNode(model.nodes[key])
    }

    this.engine.setDiagramModel(model)
    this.model = model
  }

  render() {
    const { ready } = this.state
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
            {viewOnly ? null : this.renderAddScene()}
            {viewOnly ? null : this.renderSave()}

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

            <div className="EditorButton -zooms">
              <button onClick={() => this.setZoom(-1)}>-</button>

              <button onClick={() => this.setZoom(1)}>+</button>
            </div>
          </menu>
          <DiagramWidget
            diagramEngine={this.engine}
            maxNumberPointsPerLink={0}
            inverseZoom={true}
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
      <button
        className="EditorButton"
        onClick={() => {
          this.saveStory({ force: true })
        }}
      >
        {this.state.saving ? 'Saving...' : 'Save'}
      </button>
    )
  }

  private setZoom = (direction: number) => {
    let delta: number

    if (direction > 0) {
      delta = 0.5 * this.model.zoom
    } else {
      delta = -1 * 0.33 * this.model.zoom
    }

    let startZoom = this.model.zoom

    // restrict zooming to 10 - 150
    if (startZoom + delta > 150 && delta > 0) {
      delta = 150 - startZoom
    }
    if (startZoom + delta < 10 && delta < 0) {
      delta = 10 - startZoom
    }

    Easing.queueEasing((progress: number) => {
      let addition = delta * progress

      // pulling zooming centering logic from:
      // https://github.com/projectstorm/react-diagrams/blob/fa34f5c98b42eb4b6770a64d9d06373cc153e4c6/src/widgets/DiagramWidget.tsx#L452-L471
      let oldZoomFactor = this.model.getZoomLevel() / 100
      this.model.setZoomLevel(startZoom + addition)
      let zoomFactor = this.model.getZoomLevel() / 100

      // determine workspace width and height
      let workspace = document.getElementsByClassName('EditorWorkspace')[0]
      let clientWidth = workspace.clientWidth
      let clientHeight = workspace.clientHeight

      // compute difference between rect before and after scroll
      let widthDiff = clientWidth * zoomFactor - clientWidth * oldZoomFactor
      let heightDiff = clientHeight * zoomFactor - clientHeight * oldZoomFactor
      // compute center of screen (formerly: compute mouse coords relative to canvas)
      let clientX = clientWidth * 0.5
      let clientY = clientHeight * 0.5

      // compute width and height increment factor
      let xFactor =
        (clientX - this.model.getOffsetX()) / oldZoomFactor / clientWidth
      let yFactor =
        (clientY - this.model.getOffsetY()) / oldZoomFactor / clientHeight

      this.model.setOffset(
        this.model.getOffsetX() - widthDiff * xFactor,
        this.model.getOffsetY() - heightDiff * yFactor
      )

      this.eventuallyForceUpdate()
    })
  }

  private clearSelection = () => {
    if (this.model.getSelectedItems().length == 1) {
      this.model.clearSelection()
      this.eventuallyForceUpdate()
    }
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
      story: this.model.serializeDiagram()
    }
  }

  private rand = (num: number) => {
    return Math.random() * num - num / 2
  }

  private addScene = () => {
    let node = new DefaultNodeModel('New Scene')

    let workspace = document.getElementsByClassName('EditorWorkspace')[0]
    let clientWidth = workspace.clientWidth * 0.4
    let clientHeight = workspace.clientHeight * 0.75

    let zoomModifier = 100 / this.model.zoom
    let targetX =
      (clientWidth + this.rand(100) - this.model.offsetX) * zoomModifier
    let targetY =
      (clientHeight + this.rand(100) - this.model.offsetY) * zoomModifier

    node.setPosition(targetX, targetY)
    node.addInPort('In')
    node.color = '#ffeb3b'

    this.watchNode(node)

    this.model.addNode(node)

    this.model.clearSelection()
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
    reader.onload = function() {
      try {
        scope.props.updateState({
          ...JSON.parse(`${this.result}`),
          slug: scope.props.state.slug
        })
      } catch (error) {
        alert("Sorry, we couldn't parse your file :(")
      }
    }

    reader.readAsText(file)
  }

  private saveStory = async (opts: { force: boolean }) => {
    if (this.props.viewOnly) {
      return
    }

    const saveStart = Date.now()
    const newState = this.serialize()
    const noChange = JSON.stringify(newState) === this.lastSavedState

    // Don't save if nothing happened
    if (noChange && !opts.force) return

    try {
      this.setState({ saving: true })

      if (noChange) {
        // Do nothing, but let the UI change around
      } else {
        // Clone newState so changes to the sub objects won't tarnish lastSavedState
        this.lastSavedState = clone(newState)
        await save(this.props.state.slug, newState)
      }
    } catch (error) {
      alert(
        "Sorry! We couldn't save! It's possible you do not have internet access. Be sure to export your scene before closing the browser!"
      )
    } finally {
      let timeLeft = 250 - Math.min(Date.now() - saveStart, 400)

      // Add a stupid delay to make it look like it really did save
      setTimeout(() => {
        this.setState({ saving: false })
      }, timeLeft)
    }
  }

  private calculateNodeColors = () => {
    let ids = Object.keys(this.model.nodes)

    ids.map(id => {
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
      } else {
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
          this.model.links[key].remove()

          let link = new DefaultLinkModel()
          link.setSourcePort(targetPort)
          link.setTargetPort(sourcePort)

          this.model.addLink(link)
        }
      }
    }
  }
}

interface InboundProps {
  viewOnly: boolean
}
export default (inbound: InboundProps) => (
  <StateConsumer>{props => <Editor {...inbound} {...props} />}</StateConsumer>
)
