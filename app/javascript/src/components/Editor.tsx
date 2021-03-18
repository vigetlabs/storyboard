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
import * as _ from 'lodash'

let offset = 100

import { Undo, Redo } from '@material-ui/icons'

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
  copiedNodes: DefaultNodeModel[]
  pastedNodes: DefaultNodeModel[]
  copiedLinks: DefaultLinkModel[]
  pastedLinks: DefaultLinkModel[]
  lastSavedState: ApplicationState
  past: ApplicationState[]
  future: ApplicationState[]

  constructor(props: EditorProps) {
    super(props)

    this.state = {
      ready: false,
      selected: null,
      saving: false
    }
    this.engine = new DiagramEngine()
    this.engine.installDefaultFactories()

    this.past = [this.props.state]
    this.future = []
    this.updateStory(this.props.state.story)
    this.lastSavedState = clone(this.serialize())
  }

  async componentDidMount() {
    setTimeout(() => {
      this.setState({ ready: true })
    })

    document.onkeydown = e => {
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key == 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key == 'y')
      ) {
        this.redo()
        e.preventDefault()
      } else if ((e.metaKey || e.ctrlKey) && e.key == 'z') {
        this.undo()
        e.preventDefault()
      } else if ((e.metaKey || e.ctrlKey) && e.key == 's') {
        this.saveStory({ force: true })
        e.preventDefault()
      }
    }
  }

  componentDidUpdate({ state: { story } }: EditorProps) {
    let {
      state: { story: newStory }
    } = this.props
    if (JSON.stringify(story) !== JSON.stringify(newStory)) {
      this.updateStory(newStory)
      this.forceUpdate()
    }

    // track history
    let currentState = clone(this.serialize())
    let pastState = this.past[this.past.length - 1]

    if(currentState.story.links > pastState.story.links) {
      this.handleSceneName(currentState, newStory)
    }

    if (JSON.stringify(currentState) != JSON.stringify(pastState)) {
      this.past.push(currentState)
      this.future = []
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

  private handleSceneName = (
    currentState: any,
    newStory: any,
    ) => {
    let currentNodes = [...currentState.story.nodes]
    let updatedName: string = ''
    let latestLink = Object.assign(new DefaultLinkModel(), currentState.story.links[currentState.story.links.length - 1])
    let sourcePort = Object.assign(new DefaultPortModel(false, ''))
    let targetNode = Object.assign(new DefaultNodeModel())

    currentNodes.forEach(node => {
      if(node.id === latestLink.source) {
        sourcePort = node.ports.filter((port: DefaultPortModel) => port.id === latestLink.sourcePort)
        updatedName = sourcePort[0].label
      }

      if(node.id === latestLink.target) {
         targetNode = node
      }
    })

    if(targetNode.name === "New Scene") {
      let targetNodeIndex = currentNodes.indexOf(targetNode)

      targetNode.name = updatedName

      currentNodes.splice(targetNodeIndex, 1, targetNode)
      newStory.links = currentState.story.links
      newStory.nodes = currentNodes

      this.updateStory(newStory)
    }
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
          onCopy={this.onCopy}
          onPaste={this.onPaste}
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
              <button onClick={() => this.undo()}>
                <Undo />
              </button>
              <button onClick={() => this.redo()}>
                <Redo />
              </button>
            </div>

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
          updateDiagram={this.updateWithSerialization}
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

  private undo() {
    if (this.past.length > 1) {
      let currentState = this.past.pop()
      if (currentState) this.future.push(currentState)

      let previousState = clone(this.past[this.past.length - 1])

      this.updateStory(previousState.story)
      this.forceUpdate()
    }
  }

  private redo() {
    if (this.future.length) {
      let futureState = this.future.pop()
      if (futureState) {
        this.past.push(futureState)

        this.updateStory(futureState.story)
        this.forceUpdate()
      }
    }
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
    const selected = this.model
      .getSelectedItems()
      .filter(item => item instanceof DefaultNodeModel)

    if (selected.length == 1) {
      return selected[0] as DefaultNodeModel
    }

    return null
  }

  private repaint = () => this.engine.repaintCanvas()

  private updateWithSerialization = () => {
    this.eventuallyForceUpdate()
    this.updateStory(this.model.serializeDiagram())
  }

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
    const noChange =
      JSON.stringify(newState) === JSON.stringify(this.lastSavedState)

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

  private getLinksThatShouldBeSelected = () => {
    const { copiedNodes } = this
    let linksToAdd: DefaultLinkModel[] = []

    copiedNodes.forEach(sourceNode => {
      sourceNode.getOutPorts().forEach(outPort => {
        for (const [key, value] of Object.entries(outPort.getLinks())) {
          if (!value.isSelected()) {
            let targetNode = value.getTargetPort().getNode() as DefaultNodeModel
            if (copiedNodes.includes(targetNode)) {
              linksToAdd.push(value as DefaultLinkModel)
            }
          }
        }
      })
    })

    return linksToAdd
  }

  private onCopy = () => {
    const { model } = this

    const selectedNodes = model
      .getSelectedItems()
      .filter(item => item instanceof DefaultNodeModel) as DefaultNodeModel[]
    const selectedLinks = this.model
      .getSelectedItems()
      .filter(item => item instanceof DefaultLinkModel) as DefaultLinkModel[]
    this.copiedNodes = selectedNodes
    this.copiedLinks = selectedLinks.concat(this.getLinksThatShouldBeSelected())

    this.pastedNodes = []
    this.pastedLinks = []
  }

  private onPaste = () => {
    const { copiedNodes, model, pastedNodes, pastedLinks, copiedLinks } = this

    model.clearSelection()

    copiedNodes.forEach(node => {
      let copiedNode = this.createCopiedNode(
        node,
        node.x + offset,
        node.y + offset
      )
      if (copiedNode) {
        pastedNodes.push(copiedNode)
      }
    })
    copiedLinks.forEach(link => {
      let copiedLink = this.createCopiedLink(link)
      if (copiedLink) {
        pastedLinks.push(copiedLink)
      }
    })
    pastedNodes.forEach(node => model.addNode(node))
    pastedLinks.forEach(link => model.addLink(link))

    this.repaint()
  }

  private getRelatedPorts = (oldLink: DefaultLinkModel) => {
    const { copiedNodes, pastedNodes } = this

    let ret: DefaultPortModel[] = []
    copiedNodes.forEach(node => {
      // Iterates over the nodes that were copied to clipboard and then over their ports, returning them for the pasted links to use
      let copiedOutPorts = node.getOutPorts()
      let copiedInPorts = node.getInPorts()
      let nodeIndex = copiedNodes.indexOf(node)

      copiedOutPorts.forEach(outPort => {
        if (outPort === oldLink.getSourcePort()) {
          let portIndex = copiedOutPorts.indexOf(outPort)
          ret.push(pastedNodes[nodeIndex].getOutPorts()[portIndex])
        }
      })
      copiedInPorts.forEach(inPort => {
        if (inPort === oldLink.getTargetPort()) {
          let portIndex = copiedInPorts.indexOf(inPort)
          ret.push(pastedNodes[nodeIndex].getInPorts()[portIndex])
        }
      })
    })
    // Returns the array with the first element being the source, and second being the target
    return ret
  }

  private createCopiedLink = (copiedLink: DefaultLinkModel) => {
    let pastedLink = new DefaultLinkModel()
    let relatedPorts = this.getRelatedPorts(copiedLink)
    if (relatedPorts.length < 2) {
      // The user copied one or more danging links (i.e. links that don't have a source and target port)
      return
    }
    // Sets the source/destination of the link, and adds the link to the related nodes
    let sourcePort = relatedPorts[0]
    let targetPort = relatedPorts[1]

    pastedLink.sourcePort = sourcePort
    pastedLink.targetPort = targetPort
    // These lines below seem redundant, but removing them causes the pasted link(s) not to move with the rest of the objects until page reload
    sourcePort.addLink(pastedLink)
    targetPort.addLink(pastedLink)

    pastedLink.getPoints().forEach(point => {
      // Ensures the link moves with nodes visually
      let copiedPoint = copiedLink.getPoints()[
        pastedLink.getPoints().indexOf(point)
      ]
      point.x = copiedPoint.x + offset
      point.y = copiedPoint.y + offset
    })

    pastedLink.selected = true
    return pastedLink
  }

  private createCopiedNode = (
    nodeToCopy: DefaultNodeModel,
    targetX: Number,
    targetY: Number
  ) => {
    let node = _.cloneDeep(nodeToCopy)

    // Cleanup dangling references from the copied items
    node.clearListeners()
    this.copyPorts(node)
    node.parent = new DiagramModel()
    node.id = node.parent.id

    // Set attributes of this new scene
    node.setPosition(targetX, targetY)
    node.color = '#ffeb3b'
    this.watchNode(node)
    node.selected = true

    return node
  }

  private copyPorts = (node: DefaultNodeModel) => {
    let ports = node.getPorts()

    Object.keys(ports).forEach(function(key) {
      let oldPort = ports[key] as DefaultPortModel
      let newPort = new DefaultPortModel(
        oldPort.in,
        oldPort.getName(),
        oldPort.label
      )
      node.removePort(oldPort)
      node.addPort(newPort)
    })
  }

  private calculateNodeColors = () => {
    let ids = Object.keys(this.model.nodes)

    ids.map(id => {
      let node = this.model.nodes[id] as DefaultNodeModel
      let meta = this.props.state.meta[id]

      let inPortsWithLinks = []
      let outPortsWithLinks = []
      let outPorts = []
      let isFinal = meta ? meta.isFinal : false

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
      } else if (isFinal) {
        // has been marked as complete
        node.color = '#808080'
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
