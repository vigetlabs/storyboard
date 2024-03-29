import * as React from 'react'
import { FC } from 'react'
import { DefaultPortModel } from 'storm-react-diagrams'
import { StateConsumer, ApplicationState, PortMetaContent } from '../Store'
import { get } from 'lodash'
import { clone } from '../clone'
import { Choice } from './Choice'

import './PortEditor.css'
import { link } from 'fs'

interface PortEditorProps {
  port: DefaultPortModel
  removeChoice: () => void
  updateChoice: () => void
  moveChoice: () => void
  index: number
}

interface PortEditorStateProps {
  state: ApplicationState
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
}

interface PortEditorState {
  selectedTab: string
  optionsOpen: boolean
  thisPortMeta: PortMetaContent
}

const deSpace = (str: string) => {
  return str.replace(/\s/g, '')
}

const PortEditorHeader: FC = ({ children }) => (
  <header className="pe-header">
    <h3 className="pe-heading">{children}</h3>
  </header>
)

const PortEditorRemoveButton: FC<{ onClick: () => void }> = props => (
  <button className="pe-remove-btn" {...props}>
    <span className="sr-only">Remove Item</span>
  </button>
)

const PortEditorFooter: FC<{ onClick: () => void }> = props => (
  <footer className="pe-footer">
    <button className="pe-add-btn" {...props}>
      <span className="sr-only">Add Item</span>
    </button>
  </footer>
)

class PortEditor extends React.Component<
  PortEditorProps & PortEditorStateProps,
  PortEditorState
> {
  constructor(props: PortEditorProps & PortEditorStateProps) {
    super(props)

    let { state, port } = props

    this.state = {
      selectedTab: 'items',
      optionsOpen: false,
      thisPortMeta: clone(get(state, `portMeta.${port.id}`) || {})
    }
  }

  render() {
    const { port, removeChoice, updateChoice, moveChoice, index } = this.props
    const {
      selectedTab,
      optionsOpen,
      thisPortMeta: { showIfItems, showIfStats, itemChanges, statChanges, isTimer, hideChoice, timeoutSeconds, isLoop }
    } = this.state

    return (
      <>
        <Choice
          id={port.id}
          index={index}
          port={port}
          removeChoice={removeChoice}
          updateChoice={updateChoice}
          optionsButtonClick={this.optionsButtonClick}
          optionsOpen={optionsOpen}
          moveChoice={moveChoice}
        />

        <section>
          {optionsOpen && (
            <>
              <div className="pe-tabs">
                <button
                  className={
                    selectedTab === 'items'
                      ? 'pe-active-tab'
                      : 'pe-inactive-tab'
                  }
                  onClick={() => this.setSelectedTab('items')}
                >
                  Items
                </button>
                <button
                  className={
                    selectedTab === 'stats'
                      ? 'pe-active-tab'
                      : 'pe-inactive-tab'
                  }
                  onClick={() => this.setSelectedTab('stats')}
                >
                  Stats
                </button>
                <button
                  className={
                    selectedTab === 'showif'
                      ? 'pe-active-tab'
                      : 'pe-inactive-tab'
                  }
                  onClick={() => this.setSelectedTab('showif')}
                >
                  Show If
                </button>
                <button
                  className={
                    selectedTab === 'timer'
                      ? 'pe-active-tab'
                      : 'pe-inactive-tab'
                  }
                  onClick={() => this.setSelectedTab('timer')}
                >
                  Timer
                </button>
                <button
                  className={
                    selectedTab === 'loop'
                      ? 'pe-active-tab'
                      : 'pe-inactive-tab'
                  }
                  onClick={() => this.setSelectedTab('loop')}
                >
                    Loop
                </button>
              </div>

              {selectedTab === 'items' && (
                <div className="flexDiv">
                  <PortEditorHeader>Add/Remove Items</PortEditorHeader>

                  <ul className="pe-list">
                    {itemChanges && itemChanges.length > 0 ? (
                      itemChanges.map((itemChange, i) => (
                        <li key={itemChange.name.concat(i.toString())}>
                          <div>
                            <label
                              className="sr-only"
                              htmlFor={`add-remove-${itemChange.name}`}
                            >
                              Add/Remove
                            </label>
                            <select
                              id={`add-remove-${itemChange.name}`}
                              value={itemChange.action}
                              onChange={this.toggleItemChange.bind(this, i)}
                            >
                              <option key="add" value="add">
                                Add
                              </option>
                              <option key="remove" value="remove">
                                Remove
                              </option>
                            </select>
                          </div>
                          <div>
                            <label
                              className="sr-only"
                              htmlFor={`name-for-${itemChange.name}`}
                            >
                              Item Name
                            </label>
                            <input
                              id={`name-for-${itemChange.name}`}
                              onBlur={this.setItemChange.bind(this, i)}
                              defaultValue={itemChange.name}
                            />
                          </div>
                          <PortEditorRemoveButton
                            onClick={this.removeItemChanges.bind(this, i)}
                          />
                        </li>
                      ))
                    ) : (
                      <li>No items</li>
                    )}
                  </ul>

                  <PortEditorFooter onClick={this.addItemChanges.bind(this)} />
                </div>
              )}

              {selectedTab === 'stats' && (
                <div className="flexDiv">
                  <PortEditorHeader>Modify Stats</PortEditorHeader>

                  <ul className="pe-list">
                    {statChanges && statChanges.length > 0 ? (
                      statChanges.map((statChange, i) => (
                        <li key={statChange.name.concat(i.toString())}>
                          <div>
                            <label
                              className="sr-only"
                              htmlFor={`stat-name-${statChange.name}`}
                            >
                              Stat Name
                            </label>
                            <input
                              id={`stat-name-${statChange.name}`}
                              onBlur={this.setStatName.bind(this, i)}
                              defaultValue={statChange.name}
                            />
                          </div>
                          <div>
                            <label
                              className="sr-only"
                              htmlFor={`stat-decrease-increase-${statChange.name}`}
                            >
                              Increase/Decrease/Reset
                            </label>
                            <select
                              id={`stat-decrease-increase-${statChange.name}`}
                              value={statChange.action}
                              onChange={this.toggleStatChanges.bind(this, i)}
                            >
                              <option key="+" value="+">
                                ➕
                              </option>
                              <option key="-" value="-">
                                ➖
                              </option>
                              <option key="=" value="=">
                                =
                              </option>
                              <option key="?" value="?">
                                ?
                              </option>
                            </select>
                          </div>
                          {statChange.action !== '?' ? (
                            <div>
                              <label
                                className="sr-only"
                                htmlFor={`stat-value-${statChange.name}`}
                              >
                                Number Value (#)
                              </label>
                              <input
                                id={`stat-value-${statChange.name}`}
                                onBlur={this.setStatValue.bind(this, i)}
                                defaultValue={
                                  statChange.value != undefined
                                    ? statChange.value.toString()
                                    : ''
                                }
                              />
                            </div>
                          ) : (
                            <div>
                              <div>
                                <label
                                  className="sr-only"
                                  htmlFor={`stat-min-${statChange.name}`}
                                >
                                  Random Number Min (#)
                                </label>
                                <input
                                  id={`stat-min-${statChange.name}`}
                                  onBlur={this.setStatMin.bind(this, i)}
                                  placeholder="Min"
                                  defaultValue={
                                    statChange.min != undefined
                                      ? statChange.min.toString()
                                      : ''
                                  }
                                />
                              </div>
                              <div>
                                <label
                                  className="sr-only"
                                  htmlFor={`stat-max-${statChange.name}`}
                                >
                                  Random Number Max (#)
                                </label>
                                <input
                                  id={`stat-max-${statChange.name}`}
                                  onBlur={this.setStatMax.bind(this, i)}
                                  placeholder="Max"
                                  defaultValue={
                                    statChange.max != undefined
                                      ? statChange.max.toString()
                                      : ''
                                  }
                                />
                              </div>
                            </div>
                          )}
                          <PortEditorRemoveButton
                            onClick={this.removeStatChanges.bind(this, i)}
                          />
                        </li>
                      ))
                    ) : (
                      <li>No Stats</li>
                    )}
                  </ul>

                  <PortEditorFooter onClick={this.addStatChanges.bind(this)} />
                </div>
              )}

              {selectedTab === 'showif' && (
                <div className="flexDiv">
                  <PortEditorHeader>
                    Add/Remove Item Conditions
                  </PortEditorHeader>

                  <ul className="pe-list">
                    {showIfItems && showIfItems.length > 0 ? (
                      showIfItems.map((showIf, i) => (
                        <li key={i}>
                          <div>
                            <label
                              className="sr-only"
                              htmlFor={`show-if-item-${deSpace(showIf.name)}`}
                            >
                              Item
                            </label>
                            <select
                              id={`show-if-item-${deSpace(showIf.name)}`}
                              value={showIf.name}
                              onChange={this.selectShowIfItem.bind(this, i)}
                            >
                              {this.possibleItemModifiers(showIf.name).map(
                                (item, i) => (
                                  <option key={i} value={item}>
                                    {item}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                          <div>
                            <input
                              id={`has-item-${deSpace(showIf.name)}`}
                              type="checkbox"
                              checked={showIf.hasIt}
                              onChange={this.toggleShowIfItem.bind(this, i)}
                            />
                            <label htmlFor={`has-item-${deSpace(showIf.name)}`}>
                              <span className="sr-only">Has it?</span>
                            </label>
                          </div>
                          <PortEditorRemoveButton
                            onClick={this.removeShowIfItem.bind(this, i)}
                          />
                        </li>
                      ))
                    ) : (
                      <li>No item conditions</li>
                    )}
                  </ul>

                  <PortEditorFooter onClick={this.addShowIfItem.bind(this)} />
                  <hr />

                  <PortEditorHeader>
                    Add/Remove Stat Conditions
                  </PortEditorHeader>

                  <ul className="pe-list">
                    {showIfStats && showIfStats.length > 0 ? (
                      showIfStats.map((showIf, i) => (
                        <li key={i}>
                          <div>
                            <label
                              className="sr-only"
                              htmlFor={`show-if-stat-${deSpace(showIf.name)}`}
                            >
                              Stat Name
                            </label>
                            <select
                              id={`show-if-stat-${deSpace(showIf.name)}`}
                              value={showIf.name}
                              onChange={this.selectShowIfStat.bind(this, i)}
                            >
                              {this.possibleStatModifiers(showIf.name).map(
                                (item, i) => (
                                  <option key={i} value={item}>
                                    {item}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                          <div>
                            <label
                              className="sr-only"
                              htmlFor={`show-if-stat-condition-${deSpace(
                                showIf.name
                              )}`}
                            >
                              Condition
                            </label>
                            <select
                              id={`show-if-stat-condition-${deSpace(
                                showIf.name
                              )}`}
                              value={showIf.operator}
                              onChange={this.selectShowIfStatOperator.bind(
                                this,
                                i
                              )}
                            >
                              {['>', '<', '≥', '≤', '=', '!='].map(
                                (item, i) => (
                                  <option key={i} value={item}>
                                    {item}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                          <div>
                            <label
                              className="sr-only"
                              htmlFor={`show-if-stat-value-${deSpace(
                                showIf.name
                              )}`}
                            >
                              Condition
                            </label>
                            <input
                              id={`show-if-stat-value-${deSpace(showIf.name)}`}
                              onBlur={this.setShowIfStatValue.bind(this, i)}
                              defaultValue={
                                showIf.value != undefined ? showIf.value.toString() : ''
                              }
                            />
                          </div>

                          <PortEditorRemoveButton
                            onClick={this.removeShowIfStat.bind(this, i)}
                          />
                        </li>
                      ))
                    ) : (
                      <li>No Stat Conditions</li>
                    )}
                  </ul>

                  <PortEditorFooter onClick={this.addShowIfStat.bind(this)} />
                </div>
              )}

              {selectedTab === 'timer' && (
                <div className="flexDiv">
                  <PortEditorHeader>Set Up Timer</PortEditorHeader>

                  <ul className="pe-list">
                    <li>
                      <div>
                        <input
                          id={`is-timer-${port.id}`}
                          type="checkbox"
                          checked={isTimer}
                          onChange={this.toggleTimer.bind(this)}
                        />
                        <label htmlFor={`is-timer-${port.id}`} className="checkbox-label">
                          Is Timer?
                        </label>
                      </div>
                    </li>
                    <li>
                      <div>
                        <input
                          id={`hide-choice-${port.id}`}
                          type="checkbox"
                          checked={hideChoice}
                          onChange={this.toggleHideChoice.bind(this)}
                        />
                        <label htmlFor={`hide-choice-${port.id}`} className="checkbox-label">
                          Hide Choice?
                        </label>
                      </div>
                    </li>
                    <li>
                      <div className="labeled-select">
                        <label htmlFor="timeout-seconds">
                          Seconds
                        </label>
                        <input
                          id="timeout-seconds"
                          onBlur={this.setTimeoutSeconds.bind(this)}
                          defaultValue={
                            timeoutSeconds != undefined ? timeoutSeconds.toString() : ''
                          }
                        />
                      </div>
                    </li>
                  </ul>
                </div>
              )}

              {selectedTab === 'loop' && (
                <div className="flexDiv">
                  <PortEditorHeader>Set Up Loop</PortEditorHeader>

                  <ul className="pe-list">
                    <li>
                      <div>
                        <input
                          id={`is-loop-${port.id}`}
                          type="checkbox"
                          checked={isLoop}
                          onChange={this.toggleLoop.bind(this)}
                        />
                        <label htmlFor={`is-loop-${port.id}`} className="checkbox-label">
                          Loop Back to Same Scene?
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      </>
    )
  }

  setSelectedTab = (str: string) => {
    this.setState({
      selectedTab: str
    })
  }

  optionsButtonClick = () => {
    this.setState(prevState => ({ optionsOpen: !prevState.optionsOpen }))
  }

  /**
   * Timer
   */
  toggleTimer = (e: React.MouseEvent) => {
    this.state.thisPortMeta.isTimer = !this.state.thisPortMeta.isTimer
    this.savePortMeta()
  }

  toggleHideChoice = (e: React.MouseEvent) => {
    this.state.thisPortMeta.hideChoice = !this.state.thisPortMeta.hideChoice
    this.savePortMeta()
  }

  setTimeoutSeconds = (e: React.FocusEvent<HTMLInputElement>) => {
    this.state.thisPortMeta.timeoutSeconds = parseInt(e.target.value, 0)
    this.savePortMeta()
  }

  /**
   * Loop
   */
  toggleLoop = (e: React.MouseEvent) => {
    this.state.thisPortMeta.isLoop = !this.state.thisPortMeta.isLoop
    this.savePortMeta()
  }

  /**
   * Show If Items
   */
  selectShowIfItem = (
    index: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems[index].name = e.target.value

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  toggleShowIfItem = (index: number, e: React.MouseEvent) => {
    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems[index].hasIt = !newShowIfItems[index].hasIt

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  removeShowIfItem = (index: number, e: React.MouseEvent) => {
    e.preventDefault()

    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems.splice(index, 1)

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  addShowIfItem = (e: React.MouseEvent) => {
    e.preventDefault()

    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    let name = this.possibleItemModifiers('')[0] || ''
    newShowIfItems.push({ name: name, hasIt: true })

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  /**
   * Show If Stats
   */
  selectShowIfStat = (
    index: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    let newShowIfStats = clone(this.state.thisPortMeta.showIfStats || [])
    newShowIfStats[index].name = e.target.value

    this.state.thisPortMeta.showIfStats = newShowIfStats
    this.savePortMeta()
  }

  selectShowIfStatOperator = (
    index: number,
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    e.preventDefault()

    let newShowIfStats = clone(this.state.thisPortMeta.showIfStats || [])
    newShowIfStats[index].operator = e.target.value

    this.state.thisPortMeta.showIfStats = newShowIfStats
    this.savePortMeta()
  }

  setShowIfStatValue = (
    index: number,
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    let newShowIfStats = clone(this.state.thisPortMeta.showIfStats || [])
    newShowIfStats[index].value = parseInt(e.target.value, 0)

    this.state.thisPortMeta.showIfStats = newShowIfStats
    this.savePortMeta()
  }

  removeShowIfStat = (index: number, e: React.MouseEvent) => {
    e.preventDefault()

    let newShowIfStats = clone(this.state.thisPortMeta.showIfStats || [])
    newShowIfStats.splice(index, 1)

    this.state.thisPortMeta.showIfStats = newShowIfStats
    this.savePortMeta()
  }

  addShowIfStat = (e: React.MouseEvent) => {
    e.preventDefault()

    let newShowIfStats = clone(this.state.thisPortMeta.showIfStats || [])
    let name = this.possibleStatModifiers('')[0] || ''
    newShowIfStats.push({ name: name, operator: '', value: 0 })

    this.state.thisPortMeta.showIfStats = newShowIfStats
    this.savePortMeta()
  }

  /**
   * Items and Item Changes
   */
  addItemChanges = (e: React.MouseEvent) => {
    e.preventDefault()

    let newItemChanges = clone(this.state.thisPortMeta.itemChanges || [])
    newItemChanges.push({ name: '', action: 'add' })

    this.state.thisPortMeta.itemChanges = newItemChanges
    this.savePortMeta()
  }

  removeItemChanges = (index: number, e: React.MouseEvent) => {
    e.preventDefault()

    let newItemChanges = clone(this.state.thisPortMeta.itemChanges || [])
    newItemChanges.splice(index, 1)

    this.state.thisPortMeta.itemChanges = newItemChanges
    this.savePortMeta()
  }

  setItemChange = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newItemChanges = clone(this.state.thisPortMeta.itemChanges || [])
    newItemChanges[index].name = e.target.value

    this.state.thisPortMeta.itemChanges = newItemChanges
    this.savePortMeta()
  }

  toggleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.preventDefault()
    if (e.target.value !== 'add' && e.target.value !== 'remove') return

    let newItemChanges = clone(this.state.thisPortMeta.itemChanges || [])
    newItemChanges[index].action = e.target.value

    this.state.thisPortMeta.itemChanges = newItemChanges
    this.savePortMeta()
  }

  /**
   * Stat Changes
   */
  addStatChanges = (e: React.MouseEvent) => {
    e.preventDefault()

    let newStatChanges = clone(this.state.thisPortMeta.statChanges || [])
    newStatChanges.push({ name: '', value: 0, action: '+', min: 0, max: 0 })

    this.state.thisPortMeta.statChanges = newStatChanges
    this.savePortMeta()
  }

  removeStatChanges = (index: number, e: React.MouseEvent) => {
    e.preventDefault()

    let newStatChanges = clone(this.state.thisPortMeta.statChanges || [])
    newStatChanges.splice(index, 1)

    this.state.thisPortMeta.statChanges = newStatChanges
    this.savePortMeta()
  }
  setStatName = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newStatChanges = clone(this.state.thisPortMeta.statChanges || [])
    newStatChanges[index].name = e.target.value

    this.state.thisPortMeta.statChanges = newStatChanges
    this.savePortMeta()
  }
  setStatValue = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newStatChanges = clone(this.state.thisPortMeta.statChanges || [])
    newStatChanges[index].value = parseInt(e.target.value, 0)

    this.state.thisPortMeta.statChanges = newStatChanges
    this.savePortMeta()
  }
  setStatMin = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newStatChanges = clone(this.state.thisPortMeta.statChanges || [])
    newStatChanges[index].min = parseInt(e.target.value, 0)

    this.state.thisPortMeta.statChanges = newStatChanges
    this.savePortMeta()
  }
  setStatMax = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newStatChanges = clone(this.state.thisPortMeta.statChanges || [])
    newStatChanges[index].max = parseInt(e.target.value, 0)

    this.state.thisPortMeta.statChanges = newStatChanges
    this.savePortMeta()
  }

  toggleStatChanges = (
    index: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.preventDefault()
    if (e.target.value !== '+' && e.target.value !== '-' && e.target.value !== '=' && e.target.value !== '?') return

    let newStatChanges = clone(this.state.thisPortMeta.statChanges || [])
    newStatChanges[index].action = e.target.value

    this.state.thisPortMeta.statChanges = newStatChanges
    this.savePortMeta()
  }

  savePortMeta = () => {
    const { thisPortMeta } = this.state
    const { state, updateState, port } = this.props

    let newPortMeta: PortMetaContent = clone(thisPortMeta)

    // Remove empty showIf conditions
    if (newPortMeta.showIfItems) {
      newPortMeta.showIfItems = newPortMeta.showIfItems.filter(showIf => {
        return !!showIf.name
      })
    }
    if (newPortMeta.showIfStats) {
      newPortMeta.showIfStats = newPortMeta.showIfStats.filter(showIf => {
        return !!showIf.name
      })
    }

    // Remove empty stat changes
    if (newPortMeta.itemChanges) {
      newPortMeta.itemChanges = newPortMeta.itemChanges.filter(itemChange => {
        return !!itemChange.name
      })
    }

    // Remove empty item changes
    if (newPortMeta.statChanges) {
      newPortMeta.statChanges = newPortMeta.statChanges.filter(statChange => {
        return !!statChange.name
      })
    }

    // Clone here and elsewhere so we get immutable objects in global state
    updateState({
      ...state,
      portMeta: {
        ...state.portMeta,
        [port.id]: newPortMeta
      }
    })
  }

  possibleItemModifiers: (c: string) => string[] = current => {
    let { portMeta } = this.props.state
    let { thisPortMeta } = this.state
    let toReturn: string[] = []

    for (let key in portMeta) {
      let changes = portMeta[key].itemChanges || []

      changes.forEach(change => {
        if (change.action === 'add' && toReturn.indexOf(change.name) === -1) {
          toReturn.push(change.name)
        }
      })
    }

    let existing = (thisPortMeta.showIfItems || []).map(showIf => {
      return showIf.name
    })

    return toReturn.filter(name => {
      return name && (name === current || existing.indexOf(name) === -1)
    })
  }

  possibleStatModifiers: (c: string) => string[] = current => {
    let { portMeta } = this.props.state
    let { thisPortMeta } = this.state
    let toReturn: string[] = []

    for (let key in portMeta) {
      let changes = portMeta[key].statChanges || []

      changes.forEach(change => {
        if (toReturn.indexOf(change.name) === -1) {
          toReturn.push(change.name)
        }
      })
    }

    let existing = (thisPortMeta.showIfStats || []).map(showIf => {
      return showIf.name
    })

    return toReturn.filter(name => {
      return name && (name === current || existing.indexOf(name) === -1)
    })
  }
}

export default (props: PortEditorProps) => (
  <StateConsumer>
    {({ state, updateState }) => (
      <PortEditor {...props} state={state} updateState={updateState} />
    )}
  </StateConsumer>
)
