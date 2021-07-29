import * as React from 'react'
import { get } from 'lodash'

import {
  DiagramModel,
  DiagramEngine,
  DefaultNodeModel,
  DefaultPortModel
} from 'storm-react-diagrams'

import './Player.css'

import {
  MetaData,
  PortMeta,
  ShowIfItem,
  ItemChange,
  ShowIfStat,
  StatChange
} from '../Store'
import { PlayerIntro } from './PlayerIntro'
import { PlayerInvalid } from './PlayerInvalid'
import { PlayerEnd, PlayerDeadEnd } from './PlayerEnd'
import { clone } from '../clone'
import { Parser } from 'expr-eval'

var CryptoJS = require('crypto-js')

interface PlayerProps {
  description: string
  meta: MetaData
  portMeta: PortMeta
  story: Object
  theme: string
  title: string
  isOffline: boolean
  backButton: boolean
  debug: boolean
}

interface Stat {
  name: string
  value: number
}

interface StateSnapshot {
  focus?: string
  currentItems: string[]
  currentStats: Stat[]
}

interface PlayerState {
  started: boolean
  focus?: string
  currentItems: string[]
  currentStats: Stat[]
  history: StateSnapshot[]
}

class Player extends React.Component<PlayerProps, PlayerState> {
  engine: DiagramEngine
  model: DiagramModel

  private passphrase = 'labrats'

  state: PlayerState = {
    started: false,
    currentItems: [],
    currentStats: [],
    history: []
  }

  constructor(props: PlayerProps) {
    super(props)

    this.engine = new DiagramEngine()
    this.model = new DiagramModel()

    this.engine.installDefaultFactories()
    this.model.deSerializeDiagram(this.props.story, this.engine)

    import(`./themes/${props.theme}Theme.css`)
  }

  componentDidMount() {
    if (window.location.hash == '' || window.location.hash == null) {
      this.setState({
        focus: this.findStartKey()
      })
    } else {
      let bytes = CryptoJS.AES.decrypt(
        window.location.hash.replace(/^\#/, ''),
        this.passphrase
      )
      let currentState = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      this.setState(currentState)
    }
  }

  start = () => {
    this.setState({ started: true })
  }

  componentDidUpdate() {
    if (this.props.debug) {
      window.location.hash = CryptoJS.AES.encrypt(
        JSON.stringify(this.state),
        this.passphrase
      ).toString()
    }
  }

  render() {
    this.hideSourceButton()

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
      return <PlayerDeadEnd
        onReplay={this.restart}
        onGoBack={this.revertToPreviousState.bind(this)}
      />
    }

    let node = this.model.getNode(focus) as DefaultNodeModel

    if (node == null) {
      return <PlayerInvalid />
    }

    let meta = this.props.meta[focus] || { text: '', image: '' }
    let translatedText = this.translate(meta.text)
    let choices = this.ports(node)

    if (choices.length <= 0) {
      this.showSourceButton()

      return (
        <PlayerEnd
          title={node.name}
          body={translatedText}
          image= {meta.image}
          onReplay={this.restart}
          onGoBack={this.revertToPreviousState.bind(this)}
        />
      )
    }

    const imageContent = () => {
      if (meta.image) {
        return <img src={meta.image} alt='' width='400' />
      } else {
        return
      }
    }

    return (
      <main className="PlayerScene">
        {this.goBackButton()}
        <div className="PlayerForeground">
          <h1 className="PlayerSceneTitle">{node.name}</h1>

          <div className="PlayerSceneContent">
            {imageContent()}
            <div
              className="PlayerSceneBody"
              dangerouslySetInnerHTML={{ __html: translatedText }}
            />
            {this.renderChoices(node)}
          </div>
        </div>
      </main>
    )
  }

  private hideSourceButton() {
    let a: any = document.getElementsByClassName('-source-link')[0]
    if (a) {
      a.style.display = 'none'
    }
  }

  private showSourceButton() {
    let a: any = document.getElementsByClassName('-source-link')[0]
    if (a) {
      a.style.display = 'inherit'
    }
  }

  private renderChoices(node: DefaultNodeModel) {
    return (
      <menu className="PlayerChoices">
        {this.ports(node).map(port => {
          let showItem = this.showIfItem(port)
          let showStat = this.showIfStat(port)
          return showItem && showStat ? (
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

  private goBackButton() {
    return this.props.backButton ? (
      <a className="SlantButton" id="back-button" onClick={this.revertToPreviousState.bind(this)} >
        Back
      </a>
    ) : null
  }

  private revertToPreviousState() {
    let newHistory = clone(this.state.history)

    // remove last element from history array and assign it to lastHistory
    let lastHistory = newHistory.pop()
    this.setState(
      {
        ...this.state,
        ...lastHistory,
        history: newHistory
      },
      this.resetScroll
    )
  }

  private showIfItem(port: DefaultPortModel): boolean {
    const { currentItems } = this.state
    const showIfItems: ShowIfItem[] = get(
      this.props.portMeta as any,
      `${port.id}.showIfItems`
    )

    // If no data set, show the option
    if (!showIfItems) return true

    // Otherwise, loop over showIf config
    // Bail if a negative case is found, otherwise return true
    for (let showIf of showIfItems) {
      // Should have it but doesn't
      if (showIf.hasIt && currentItems.indexOf(showIf.name) === -1) {
        return false
      }

      // Should not have it but does
      if (!showIf.hasIt && currentItems.indexOf(showIf.name) !== -1) {
        return false
      }
    }

    return true
  }

  private showIfStat(port: DefaultPortModel): boolean {
    const showIfStats: ShowIfStat[] = get(
      this.props.portMeta as any,
      `${port.id}.showIfStats`
    )

    // If no data set, show the option
    if (!showIfStats) return true
    // Otherwise, loop over showIf config
    for (let showIf of showIfStats) {
      // Get the stat related to this stat check
      let currentStat = this.state.currentStats.filter(obj => {
        return obj.name === showIf.name
      })[0]

      let currentValue = currentStat ? Number(currentStat.value) : 0
      let targetValue = Number(showIf.value)

      // Performs the various operations on the two numbers
      switch (showIf.operator) {
        case '<':
          return currentValue < targetValue
        case '≤':
          return currentValue <= targetValue
        case '>':
          return currentValue > targetValue
        case '≥':
          return currentValue >= targetValue
        case '=':
          return currentValue == targetValue
        case '!=':
          return currentValue != targetValue
      }
    }

    return true
  }

  private ports(node: DefaultNodeModel): DefaultPortModel[] {
    let ports = []

    for (let key in node.ports) {
      let port = node.ports[key]
      // return out ports for given node (choices)
      if (port.in === false) {
        ports.push(port)
      }
    }

    return ports
  }

  private restart = () => {
    this.setState({
      started: false,
      focus: this.findStartKey(),
      currentItems: [],
      currentStats: []
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

  private resetScroll() {
    window.scrollTo(0, 0)
  }

  private makeChoice(port: DefaultPortModel, event: Event) {
    event.preventDefault()

    const itemChanges: ItemChange[] =
      get(this.props.portMeta as any, `${port.id}.itemChanges`) || []
    const statChanges: StatChange[] =
      get(this.props.portMeta as any, `${port.id}.statChanges`) || []

    let newItems = clone(this.state.currentItems)
    let newStats = clone(this.state.currentStats)

    itemChanges.forEach(change => {
      if (change.action === 'add') {
        // Add item if it isn't in the set already
        if (newItems.indexOf(change.name) === -1) {
          newItems.push(change.name)
        }
      } else {
        // Remove item if it's in the set
        let itemIndex = newItems.indexOf(change.name)
        if (itemIndex !== -1) {
          newItems.splice(itemIndex, 1)
        }
      }
    })

    statChanges.forEach(change => {
      let indexOfStat = newStats.findIndex((obj: Stat) => {
        return obj.name === change.name
      })

      // Need to add it to the list of stats
      if (indexOfStat === -1) {
        let curStat: Stat = {
          name: change.name,
          value: change.action === '+' ? change.value : change.value * -1
        }
        newStats.push(curStat)
      } else {
        if (change.action === '+') {
          // Add it to the total if it already exists
          newStats[indexOfStat].value =
            Number(newStats[indexOfStat].value) + Number(change.value)
        } else {
          // Subtract it from the total
          newStats[indexOfStat].value =
            Number(newStats[indexOfStat].value) - Number(change.value)
        }
      }
    })

    // If port links to multiple scenes, select one at random
    // Odds are there's just one link but you never know
    let targetNodes = []
    for (let key in port.links) {
      let link = port.links[key]

      if (link.targetPort) {
        targetNodes.push(link.targetPort.parent.id)
      }
    }
    let nextNode = this.getRandom(targetNodes) || 'empty'

    let newHistory = clone(this.state.history)
    newHistory.push({
      focus: this.state.focus,
      currentItems: this.state.currentItems,
      currentStats: this.state.currentStats
    })

    this.setState(
      {
        focus: nextNode,
        currentItems: newItems,
        currentStats: newStats,
        history: newHistory
      },
      this.resetScroll
    )
  }

  private strip(html: string) {
    var doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }

  private translate(text: string) {
    const tags = text.match(/\{\{(.+?)\}\}/g)
    if (tags) {
      tags.forEach(tag => {
        const tagName = tag.replace(/[\{\}]/g, '')
        var cleanedTag = this.strip(tagName)

        const operands = cleanedTag.split(/[+*/-]/g)
        const statArray = operands.map(item => {
          return this.findStat(item.trim())
        })

        var expressionVariables = {} as any
        statArray.forEach(stat => {
          if (stat) {
            expressionVariables[stat.name] = stat.value
          }
        })
        var evaluated

        try {
          evaluated = Parser.evaluate(
            cleanedTag.replace(/\s/g, ''),
            expressionVariables
          )
        } catch (err) {
          var errors = [] as any
          operands.forEach(item => {
            if (this.findInvalidStat(item.trim())) {
              errors += item
            }
          })
          evaluated = 'Unidentified variable(s): ' + errors
        }
        text = text.replace(tag, evaluated.toString())
      })
    }

    return text
  }

  private findInvalidStat(item: string) {
    return (
      !this.state.currentStats.some((stat: { name: string }) => {
        return item === stat.name
      }) && isNaN(Number(item))
    )
  }

  private findStat(item: string) {
    return this.state.currentStats.find((stat: { name: string }) => {
      return stat.name == item
    })
  }

  private getRandom(nodes: string[]) {
    return nodes[Math.floor(Math.random() * nodes.length)]
  }
}

export default Player
