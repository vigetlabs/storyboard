import * as React from 'react';

import {
  DiagramModel,
  DiagramEngine,
  DefaultNodeModel,
  DefaultPortModel
} from 'storm-react-diagrams'

import { MetaData } from '../Store'

interface PlayerProps {
  story: Object
  meta: MetaData
}

interface PlayerState {
  focus?: string
}

class Player extends React.Component<PlayerProps, PlayerState> {
  engine: DiagramEngine
  model: DiagramModel
  state: PlayerState = {}

  constructor(props: PlayerProps) {
    super(props)

    this.engine = new DiagramEngine()
    this.model = new DiagramModel()

    this.engine.installDefaultFactories()
    this.model.deSerializeDiagram(this.props.story, this.engine)
  }

  componentDidMount() {
    console.log('mounting');
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
      return (
        <main>
          Oh no! You really shouldn't ever see this message.
        </main>
      )
    }

    let meta = this.props.meta[focus] || { text: "" }

    return (
      <main>
        <header>
          {node.name}
        </header>

        <div dangerouslySetInnerHTML={{ __html: meta.text }} />

        <ul>
          {this.ports(node).map(port => (
            <li key={port.id}>
              <span>
                {port.label}
              </span>
              <button onClick={this.makeChoice.bind(this, port)}>
                Go ->
              </button>
            </li>
          ))}
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
    let viableStartNodes = Object.keys(this.model.nodes).filter((id) => {
      let node = this.model.nodes[id]

      for (let key in node.ports) {
        let port = node.ports[key] as DefaultPortModel

        if (port.in) {
          return Object.keys(port.links).length == 0
        }
      }

      return true
    })

    return this.getRandom(viableStartNodes)
  }

  private makeChoice(port: DefaultPortModel) {
    let targetNodes = []

    for (let key in port.links) {
      let link = port.links[key]

      if (link.targetPort) {
        targetNodes.push(link.targetPort.parent.id)
      }
    }

    let randomNode = this.getRandom(targetNodes)

    this.setState({
      focus: randomNode
    })
  }

  private getRandom(nodes: string[]) {
    return nodes[Math.floor(Math.random() * nodes.length)]
  }
}

export default Player