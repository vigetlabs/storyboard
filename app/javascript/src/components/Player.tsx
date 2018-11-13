import * as React from 'react'
import { get } from "lodash"

import {
  DiagramModel,
  DiagramEngine,
  DefaultNodeModel,
  DefaultPortModel
} from 'storm-react-diagrams'

import './Player.css'

import { MetaData, PortMeta } from '../Store'

interface PlayerProps {
  story: Object
  meta: MetaData
  portMeta: PortMeta
}

interface PlayerState {
  focus?: string
  currentModifiers: string[]
}

class Player extends React.Component<PlayerProps, PlayerState> {
  engine: DiagramEngine
  model: DiagramModel
  state: PlayerState = { currentModifiers: [] }

  constructor(props: PlayerProps) {
    super(props)

    this.engine = new DiagramEngine()
    this.model = new DiagramModel()

    this.engine.installDefaultFactories()
    this.model.deSerializeDiagram(this.props.story, this.engine)
  }

  componentDidMount() {
    this.setState({
      focus: this.findStartKey()
    })
  }

  render() {
    let { focus } = this.state

    if (focus == null) {
      return (
        <main>
          Your story's all messed up. You probably deleted the start scene.
          <br />
          <b>Shouldn't have done that.</b>
        </main>
      )
    }

    let node = this.model.getNode(focus) as DefaultNodeModel

    if (node == null) {
      return <main>Oh no! You really shouldn't ever see this message.</main>
    }

    let meta = this.props.meta[focus] || { text: '' }
    let choices = this.ports(node)

    return (
      <main>
        <header className="PlayerSectionTitle">{node.name}</header>

        <div dangerouslySetInnerHTML={{ __html: meta.text }} />

        <ul className="PlayerChoiceList" hidden={choices.length <= 0}>
          {this.ports(node)
            .map(port => {
              const showIf = get(this.props.portMeta as any, `${port.id}.showIf`)
              const showUnless = get(this.props.portMeta as any, `${port.id}.showUnless`)
              let show = !showIf || this.state.currentModifiers.indexOf(showIf) !== -1
              show = show && !showUnless || !(this.state.currentModifiers.indexOf(showUnless) === -1)

              return show ? (
                <li key={port.id} onClick={this.makeChoice.bind(this, port)}>
                  <p>{port.label}{showIf ? ` (${showIf})` : ''}</p>
                  <button title="Follow this path">›</button>
                </li>
              ) : null
            })}
        </ul>
      </main>
    )
  }

  private ports(node: DefaultNodeModel): DefaultPortModel[] {
    let ports = []

    for (let key in node.ports) {
      let port = node.ports[key]
      if (port.in === false) {
        ports.push(port)
      }
    }

    return ports
  }

  private findStartKey() {
    let viableStartNodes = Object.keys(this.model.nodes).filter(id => {
      let node = this.model.nodes[id]

      let linkedInPorts = []
      let linkedOutPorts = []

      for (let key in node.ports) {
        let port = node.ports[key] as DefaultPortModel

        if (Object.keys(port.links).length) {
          if (port.in) {
            linkedInPorts.push(port)
          } else {
            linkedOutPorts.push(port)
          }
        }
      }

      return !linkedInPorts.length && linkedOutPorts.length
    })

    return this.getRandom(viableStartNodes)
  }

  private makeChoice(port: DefaultPortModel) {
    const modiifier = get(this.props.portMeta as any, `${port.id}.addsModifier`)
    let targetNodes = []

    for (let key in port.links) {
      let link = port.links[key]

      if (link.targetPort) {
        targetNodes.push(link.targetPort.parent.id)
      }
    }

    let randomNode = this.getRandom(targetNodes)

    this.setState(state => ({
      focus: randomNode,
      currentModifiers: modiifier
        ? [...state.currentModifiers, modiifier]
        : state.currentModifiers
    }))
  }

  private getRandom(nodes: string[]) {
    return nodes[Math.floor(Math.random() * nodes.length)]
  }
}

export default Player
