import * as React from 'react'
import { get } from 'lodash'

import {
  DiagramModel,
  DiagramEngine,
  DefaultNodeModel,
  DefaultPortModel
} from 'storm-react-diagrams'

import './Player.css'

import { MetaData, PortMeta } from '../Store'
import { PlayerIntro } from './PlayerIntro'
import { PlayerInvalid } from './PlayerInvalid'
import { PlayerDeadEnd } from './PlayerDeadEnd'
import { PlayerEnd } from './PlayerEnd'

interface PlayerProps {
  title: string
  description: string
  story: Object
  meta: MetaData
  portMeta: PortMeta
}

interface PlayerState {
  started: boolean
  lastFocus?: string
  focus?: string
  currentModifiers: string[]
}

class Player extends React.Component<PlayerProps, PlayerState> {
  engine: DiagramEngine
  model: DiagramModel

  state: PlayerState = {
    started: false,
    currentModifiers: []
  }

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

  start = () => {
    this.setState({ started: true })
  }

  render() {
    let { focus, started } = this.state
    let { title, description } = this.props

    if (!started) {
      return (
        <PlayerIntro
          title={title}
          description={description}
          onStart={this.start}
        />
      )
    }

    if (focus == null) {
      return <PlayerInvalid />
    }

    if (focus === 'empty') {
      return <PlayerDeadEnd goBack={this.goBack} />
    }

    let node = this.model.getNode(focus) as DefaultNodeModel

    if (node == null) {
      return <PlayerInvalid />
    }

    let meta = this.props.meta[focus] || { text: '' }
    let choices = this.ports(node)

    if (choices.length <= 0) {
      return (
        <PlayerEnd title={node.name} body={meta.text} onReplay={this.restart} />
      )
    }

    return (
      <main className="PlayerScene">
        <div className="PlayerForeground">
          <h1 className="PlayerSceneTitle">{node.name}</h1>

          <div className="PlayerSceneContent">
            <div
              className="PlayerSceneBody"
              dangerouslySetInnerHTML={{ __html: meta.text }}
            />
            {this.renderChoices(node)}
          </div>
        </div>
      </main>
    )
  }

  private renderChoices(node: DefaultNodeModel) {
    return (
      <menu className="PlayerChoices">
        {this.ports(node).map(port => {
          const showIf = get(this.props.portMeta as any, `${port.id}.showIf`)
          const showUnless = get(
            this.props.portMeta as any,
            `${port.id}.showUnless`
          )
          let show =
            !showIf ||
            (this.hasModifier(showIf) &&
              (!showUnless || !this.hasModifier(showUnless)))

          return show ? (
            <div key={port.getID()}>
              <a
                className="PlayerChoice"
                title="Follow this path"
                onClick={this.makeChoice.bind(this, port)}
                href="#"
              >
                {port.label}
              </a>
            </div>
          ) : null
        })}
      </menu>
    )
  }

  private renderEnd() {
    return (
      <div className="PlayerEndPane">
        <button className="SlantButton" onClick={this.restart}>
          Play Again!
        </button>
      </div>
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

  private restart = () => {
    this.setState({
      focus: this.findStartKey()
    })
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

  private hasModifier(modifier: string) {
    return this.state.currentModifiers.indexOf(modifier) !== -1
  }

  private makeChoice(port: DefaultPortModel, event: Event) {
    event.preventDefault()

    const modiifier = get(this.props.portMeta as any, `${port.id}.addsModifier`)
    let targetNodes = []

    for (let key in port.links) {
      let link = port.links[key]

      if (link.targetPort) {
        targetNodes.push(link.targetPort.parent.id)
      }
    }

    let randomTarget = this.getRandom(targetNodes) || 'empty'

    this.setState(state => ({
      lastFocus: this.state.focus,
      focus: randomTarget,
      currentModifiers: modiifier
        ? [...state.currentModifiers, modiifier]
        : state.currentModifiers
    }))
  }

  private goBack = () => {
    this.setState({
      focus: this.state.lastFocus
    })
  }

  private getRandom(nodes: string[]) {
    return nodes[Math.floor(Math.random() * nodes.length)]
  }
}

export default Player
