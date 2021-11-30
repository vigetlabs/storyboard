import * as React from 'react'
import { FC } from 'react'
import { get } from 'lodash'

import {
  DiagramModel,
  DiagramEngine,
  DefaultNodeModel,
  DefaultPortModel
} from 'storm-react-diagrams'
import ReactAudioPlayer from 'react-audio-player'
import { isMobile } from "react-device-detect";

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
import * as Handlebars from "handlebars"

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
  debuggable: boolean
  characterCard: boolean
  showSource: boolean
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
  showItemsStats: boolean
}

const DebuggerRemoveButton: FC<{ onClick: () => void }> = props => (
  <button className="d-remove-btn" {...props}>
    <span className="sr-only">Remove Item</span>
  </button>
)

const DebuggerFooter: FC<{ onClick: () => void }> = props => (
  <footer className="d-footer">
    <button className="d-add-btn" {...props}>
      <span className="sr-only">Add Item</span>
    </button>
  </footer>
)

const DebuggerStatAddButton: FC<{ onClick: () => void }> = props => (
  <button className="d-stat-add-btn" {...props}>
    <span className="sr-only">Remove Item</span>
  </button>
)

const DebuggerStatSubtractButton: FC<{ onClick: () => void }> = props => (
  <button className="d-stat-subtract-btn" {...props}>
    <span className="sr-only">Remove Item</span>
  </button>
)

class Player extends React.Component<PlayerProps, PlayerState> {
  engine: DiagramEngine
  model: DiagramModel

  private passphrase = 'labrats'

  state: PlayerState = {
    started: false,
    currentItems: [],
    currentStats: [],
    history: [],
    showItemsStats: false
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
      return <PlayerDeadEnd
        onReplay={this.restart}
        onGoBack={this.revertToPreviousState.bind(this)}
        showSource={this.props.showSource}
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
      return (
        <PlayerEnd
          title={node.name}
          body={translatedText}
          image={meta.image}
          audio={meta.audio}
          onReplay={this.restart}
          onGoBack={this.revertToPreviousState.bind(this)}
          showSource={this.props.showSource}
        />
      )
    }

    const renderImage = () => {
      if (meta.image) {
        return <img src={meta.image} alt='' width='400' />
      } else {
        return
      }
    }

    const renderAudioSection = () => {
      if (meta.audio) {
        return (
          <ReactAudioPlayer
            src={meta.audio}
            autoPlay={!isMobile}
            controls
          />
        )
      } else {
        return
      }
    }

    return (
      <main className="PlayerScene">
        {this.renderBackButton()}
        <div className="PlayerForeground">
          <h1 className="PlayerSceneTitle">{node.name}</h1>

          <div className="PlayerSceneContent">
            {renderImage()}
            {renderAudioSection()}
            <div
              className="PlayerSceneBody"
              dangerouslySetInnerHTML={{ __html: translatedText }}
            />
            {this.renderChoices(node)}
          </div>
        </div>
        {this.renderItemsStatsSection()}
      </main>
    )
  }

  private renderItemsStatsSection() {
    if (this.hasItemsOrStats()) {
      if (this.props.debuggable) {
        return this.state.showItemsStats ? this.renderDebugger() : this.renderItemsStatsButton("Debug")
      } else if (this.props.characterCard) {
        return this.state.showItemsStats ? this.renderCharacterCard() : this.renderItemsStatsButton("View Character Card")
      }
    }
    return null
  }

  private hasItemsOrStats() {
    return this.allItems().length || this.allStats().length
  }

  private renderDebugger() {
    return (
      <div>
        <div className="d-helper"></div>
        <div className="debugger">
          <div className="d-section">
            <h4><u>Current Items</u></h4>
            <ul className="d-list">
              {this.state.currentItems.map((item, i) => {
                return (
                  <li key={item.concat(i.toString())}>
                    <div>
                      <label
                        className="sr-only"
                        htmlFor={`name-for-${item}`}
                      >
                        Item Name
                      </label>
                      <select
                        id={`name-for-${item}`}
                        value={item}
                        onChange={this.setItem.bind(this, i)}
                      >
                        {this.possibleItems(item).map(
                          (item, i) => (
                            <option key={i} value={item}>
                              {item}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <DebuggerRemoveButton
                      onClick={this.removeItem.bind(this, i)}
                    />
                  </li>
                )
              })}
            </ul>
            <DebuggerFooter onClick={this.addItem.bind(this)} />
          </div>
          <div className="d-section">
            <h4><u>Current Stats</u></h4>
            <ul className="d-list">
              {this.state.currentStats.map((stat, i) => {
                return (
                  <li key={stat.name.concat(i.toString())}>
                    <div>
                      <label
                        className="sr-only"
                        htmlFor={`stat-name-${stat.name}`}
                      >
                        Stat Name
                      </label>
                      <select
                        id={`stat-name-${stat.name}`}
                        value={stat.name}
                        onChange={this.setStatName.bind(this, i)}
                      >
                        {this.possibleStats(stat.name).map(
                          (item, i) => (
                            <option key={i} value={item}>
                              {item}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="d-stat-edit">
                      <div>
                        <label
                          className="sr-only"
                          htmlFor={`stat-value-${stat.name}`}
                        >
                          Number Value (#)
                        </label>
                        <p>{stat.value}</p>
                      </div>
                      <DebuggerStatAddButton
                        onClick={this.incrementStat.bind(this, i)}
                      />
                      <DebuggerStatSubtractButton
                        onClick={this.decrementStat.bind(this, i)}
                      />
                    </div>
                    <DebuggerRemoveButton
                      onClick={this.removeStat.bind(this, i)}
                    />
                  </li>
                )
              })}
            </ul>
            <DebuggerFooter onClick={this.addStat.bind(this)} />
          </div>
          <a className="SlantButton" id="close-debug-button" onClick={this.toggleItemsStatsSection.bind(this)} >
            Close
          </a>
        </div>
      </div>
    )
  }

  private renderItemsStatsButton(title: string) {
    return (
      <a className="SlantButton" id="debug-button" onClick={this.toggleItemsStatsSection.bind(this)} >
        {title}
      </a>
    )
  }

  private renderCharacterCard() {
    return (
      <div>
        <div className="d-helper"></div>
        <div className="debugger">
          <div className="d-section">
            <h4><u>Current Items</u></h4>
            <ul className="d-list">
              {this.state.currentItems.map((item, i) => {
                return (
                  <li key={item.concat(i.toString())}>
                    {item}
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="d-section">
            <h4><u>Current Stats</u></h4>
            <ul className="d-list">
              {this.state.currentStats.map((stat, i) => {
                return (
                  <li key={stat.name.concat(i.toString())}>
                    {stat.name}: {stat.value}
                  </li>
                )
              })}
            </ul>
          </div>
          <a className="SlantButton" id="close-debug-button" onClick={this.toggleItemsStatsSection.bind(this)} >
            Close
          </a>
        </div>
      </div>
    )
  }

  private toggleItemsStatsSection() {
    this.setState({
      showItemsStats: !this.state.showItemsStats
    });
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

  private renderBackButton() {
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

  private translate(text: string): string {
    if (text) {
      this.prepareHandlebars()
      var expressionVariables = {} as any
      [text, expressionVariables] = this.prepareTextForTranslation(text)
      try {
        const template = Handlebars.compile(text)
        text = template(expressionVariables)
      } catch (error) {
        alert("There was a problem translating your template.")
      }
      text = this.repairTextAfterTranslation(text)
    }
    return text
  }

  private prepareHandlebars() {
    Handlebars.registerHelper('add', (a: number, b: number) => {
      return a + b
    })
    Handlebars.registerHelper('subtract', (a: number, b: number) => {
      return a - b
    })
    Handlebars.registerHelper('multiply', (a: number, b: number) => {
      return a * b
    })
    Handlebars.registerHelper('divide', (a: number, b: number) => {
      return a / b
    })
    Handlebars.registerHelper('greater', (a: number, b: number) => {
      return a > b
    })
    Handlebars.registerHelper('greater_or_equal', (a: number, b: number) => {
      return a >= b
    })
    Handlebars.registerHelper('less', (a: number, b: number) => {
      return a < b
    })
    Handlebars.registerHelper('less_or_equal', (a: number, b: number) => {
      return a <= b
    })
    Handlebars.registerHelper('equal', (a: number, b: number) => {
      return a == b
    })
    Handlebars.registerHelper('not', (a: boolean) => {
      return !a
    })
    Handlebars.registerHelper('either', (a: boolean, b: boolean) => {
      return a || b
    })
    Handlebars.registerHelper('both', (a: boolean, b: boolean) => {
      return a && b
    })
  }

  private prepareTextForTranslation(text: string) {
    var expressionVariables = {} as any
    this.allItems().forEach(item => {
      if (item) {
        var itemName = item.slice()
        if (itemName.includes(' ')) {
          itemName = itemName.split(' ').join('')
          text = text.split(item).join(itemName)
        }
        expressionVariables[itemName] = this.state.currentItems.indexOf(item) !== -1
      }
    })
    this.allStats().forEach(stat => {
      if (stat) {
        var statName = stat.name
        if (statName.includes(' ')) {
          statName = statName.split(' ').join('')
          text = text.split(stat.name).join(statName)
        }
        expressionVariables[statName] = stat.value
      }
    })
    return [text, expressionVariables]
  }

  private repairTextAfterTranslation(text: string) {
    this.allStats().forEach(stat => {
      if (stat) {
        var statName = stat.name
        if (statName.includes(' ')) {
          statName = statName.split(' ').join('')
          text = text.split(statName).join(stat.name)
        }
      }
    })
    this.allItems().forEach(item => {
      if (item) {
        var itemName = item
        if (itemName.includes(' ')) {
          itemName = itemName.split(' ').join('')
          text = text.split(itemName).join(item)
        }
      }
    })
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

  removeItem = (index: number, e: React.MouseEvent) => {
    e.preventDefault()

    let newItems = clone(this.state.currentItems || [])
    newItems.splice(index, 1)

    this.setState({
      currentItems: newItems
    })
  }

  addItem = (e: React.MouseEvent) => {
    e.preventDefault()

    let possibleItems = this.possibleItems(null)
    if (possibleItems.length == 0) {
      alert("There are no more possible items for you to add.")
      return
    }

    let newItems = clone(this.state.currentItems || [])
    newItems.push(possibleItems[0])

    this.setState({
      currentItems: newItems
    })
  }

  setItem = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newItems = clone(this.state.currentItems || [])
    newItems[index] = e.target.value

    this.setState({
      currentItems: newItems
    })
  }

  removeStat = (index: number, e: React.MouseEvent) => {
    e.preventDefault()

    let newStats = clone(this.state.currentStats || [])
    newStats.splice(index, 1)

    this.setState({
      currentStats: newStats
    })
  }

  addStat = (e: React.MouseEvent) => {
    e.preventDefault()

    let possibleStats = this.possibleStats(null)
    if (possibleStats.length == 0) {
      alert("There are no more possible stats for you to add.")
      return
    }

    let newStats = clone(this.state.currentStats || [])
    newStats.push({ name: possibleStats[0], value: 0 })

    this.setState({
      currentStats: newStats
    })
  }

  setStatName = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newStats = clone(this.state.currentStats || [])
    newStats[index].name = e.target.value

    this.setState({
      currentStats: newStats
    })
  }

  incrementStat = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newStats = clone(this.state.currentStats || [])
    newStats[index].value++

    this.setState({
      currentStats: newStats
    })
  }

  decrementStat = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newStats = clone(this.state.currentStats || [])
    newStats[index].value--

    this.setState({
      currentStats: newStats
    })
  }

  possibleItems = (current: string | null) => {
    let portMeta = this.props.portMeta
    let toReturn: string[] = []

    for (let key in portMeta) {
      let changes = portMeta[key].itemChanges || []

      changes.forEach(change => {
        if (change.action === 'add' && toReturn.indexOf(change.name) === -1) {
          toReturn.push(change.name)
        }
      })
    }

    return toReturn.filter(name => {
      return name && (name === current || this.state.currentItems.indexOf(name) === -1)
    })
  }

  possibleStats = (current: string | null) => {
    let portMeta = this.props.portMeta
    let toReturn: string[] = []

    for (let key in portMeta) {
      let changes = portMeta[key].statChanges || []

      changes.forEach(change => {
        if (toReturn.indexOf(change.name) === -1) {
          toReturn.push(change.name)
        }
      })
    }

    let existing = (this.state.currentStats || []).map(stat => {
      return stat.name
    })

    return toReturn.filter(name => {
      return name && (name === current || existing.indexOf(name) === -1)
    })
  }

  allItems = () => {
    let portMeta = this.props.portMeta
    let toReturn: string[] = []

    for (let key in portMeta) {
      let changes = portMeta[key].itemChanges || []

      changes.forEach(change => {
        if (change.action === 'add' && toReturn.indexOf(change.name) === -1) {
          toReturn.push(change.name)
        }
      })
    }

    return toReturn
  }

  allStats = () => {
    let portMeta = this.props.portMeta
    let toReturn: { name: string, value: number }[] = []
    let existing: string[] = []

    let currentStats = {} as any
    this.state.currentStats.forEach(stat => {
      currentStats[stat.name] = stat.value
    })

    for (let key in portMeta) {
      let changes = portMeta[key].statChanges || []

      changes.forEach(change => {
        if (existing.indexOf(change.name) === -1) {
          existing.push(change.name)
          toReturn.push({ name: change.name, value: currentStats[change.name] || 0 })
        }
      })
    }

    return toReturn
  }
}

export default Player
