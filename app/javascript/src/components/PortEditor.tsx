import * as React from "react";
import { DefaultPortModel } from "storm-react-diagrams";
import { StateConsumer, ApplicationState, PortMetaContent } from "../Store";
import { get } from "lodash";
import { clone } from "../clone";

import './PortEditor.css'

interface PortEditorProps {
  port: DefaultPortModel
  removeChoice: () => void
  updateChoice: () => void
}

interface PortEditorStateProps {
  state: ApplicationState
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
}

interface PortEditorState {
  optionsOpen: boolean
  thisPortMeta: PortMetaContent
}

class PortEditor extends React.Component<PortEditorProps & PortEditorStateProps, PortEditorState> {
  constructor(props: PortEditorProps & PortEditorStateProps) {
    super(props);

    let { state, port } = props

    this.state = {
      optionsOpen: false,
      thisPortMeta: clone(get(state, `portMeta.${port.id}`) || {})
    }
  }

  render() {
    const { port, removeChoice, updateChoice } = this.props

    const { optionsOpen, thisPortMeta: { showIfItems, showIfStats, itemChanges, statChanges } } = this.state
    return <>
      <li>
        <input
          defaultValue={port.label}
          onChange={updateChoice}
        />{' '}
        <button onClick={this.optionsButtonClick}>
          {optionsOpen ? 'v' : '>'}
        </button>
        <button onClick={removeChoice}>
          Delete
          </button>
      </li>
      <section>

        {optionsOpen && <>
          <input id="items" type="radio" name="grp" defaultChecked />
          <label htmlFor="items">Items</label>

          <div className="flexDiv">
              <table>
              <thead>
                <tr>
                  <th>Add/Remove</th>
                  <th>Item</th>
                </tr>
              </thead>

              <tbody>
                {itemChanges && itemChanges.map((itemChange, i) => (
                  <tr key={itemChange.name.concat(i.toString())}>
                    <td>
                      <select value={itemChange.action} onChange={this.toggleItemChange.bind(this, i)}>
                        <option key="add" value="add">Add</option>
                        <option key="remove" value="remove">Remove</option>
                      </select>
                    </td>
                    <td>
                      <input
                        onBlur={this.setItemChange.bind(this, i)}
                        defaultValue={itemChange.name}
                      />
                    </td>
                    <td><a onClick={this.removeItemChanges.bind(this, i)}>❌</a></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <a onClick={this.addItemChanges.bind(this)}>➕</a>
              </tfoot>
            </table>

          </div>
          <input id="stats" type="radio" name="grp" />
          <label htmlFor="stats">Stats</label>

          <div className="flexDiv">
            <table>
              <thead>
                <tr>
                  <th>Stat</th>
                  <th></th>
                  <th>#</th>
                </tr>
              </thead>
              <tbody>
                {statChanges && statChanges.map((statChange, i) => (
                  <tr key={statChange.name.concat(i.toString())}>
                    <td>
                      <input
                        onBlur={this.setStatName.bind(this, i)}
                        defaultValue={statChange.name}
                      />
                    </td>
                    <td>
                      <select value={statChange.action} onChange={this.toggleStatChanges.bind(this, i)}>
                        <option key="+" value="+">➕</option>
                        <option key="-" value="-">➖</option>
                      </select>
                    </td>
                    <td>
                      <input
                        onBlur={this.setStatValue.bind(this, i)}
                        defaultValue={(statChange.value) ? statChange.value.toString() : ""}
                      />
                    </td>
                    <td><a onClick={this.removeStatChanges.bind(this, i)}>❌</a></td>

                  </tr>
                ))}
              </tbody>
              <tfoot>
                <a onClick={this.addStatChanges.bind(this)}>➕</a>
              </tfoot>
            </table>
          </div>
          <input id="showif" type="radio" name="grp" />
          <label htmlFor="showif">Show If</label>
          <div className="flexDiv">

            <table cellSpacing="10">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Has It?</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {showIfItems && showIfItems.map((showIf, i) => (
                  <tr key={i}>
                    <td>
                      <select value={showIf.name} onChange={this.selectShowIfItem.bind(this, i)}>
                        <option key="-1"></option>
                        {this.possibleItemModifiers(showIf.name).map((item, i) => (
                          <option key={i} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td><a onClick={this.toggleShowIfItem.bind(this, i)}>{showIf.hasIt ? "✔️" : "X"}</a></td>
                    <td><a onClick={this.removeShowIfItem.bind(this, i)}>❌</a></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
               <a onClick={this.addShowIfItem.bind(this)}>➕</a>
              </tfoot>
            </table>
            <hr />
            <table>
              <thead>
                <tr>
                  <th>Stat</th>
                  <th> &gt; &lt;</th>
                  <th> # </th>
                </tr>
              </thead>
              <tbody>
                {showIfStats && showIfStats.map((showIf, i) => (
                  <tr key={i}>
                    <td>
                      <select value={showIf.name} onChange={this.selectShowIfStat.bind(this, i)}>
                        <option key="-1"></option>
                        {this.possibleStatModifiers(showIf.name).map((item, i) => (
                          <option key={i} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={showIf.operator} onChange={this.selectShowIfStatOperator.bind(this, i)}>
                        <option key="-1"></option>
                        {["<", ">", "≤", "≥"].map((item, i) => (
                          <option key={i} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        onBlur={this.setShowIfStatValue.bind(this, i)}
                        defaultValue={(showIf.value) ? showIf.value.toString() : ""}
                      />
                    </td>

                    <td><a onClick={this.removeShowIfStat.bind(this, i)}>❌</a></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
               <a onClick={this.addShowIfStat.bind(this)}>➕</a>
              </tfoot>
            </table>

          </div>


        </>}


      </section>




    </>
  }

  optionsButtonClick = () => {
    this.setState(prevState => ({ optionsOpen: !prevState.optionsOpen }))
  }

  /**
   * Show If Items
   */
  selectShowIfItem = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems[index].name = e.target.value

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  toggleShowIfItem = (index: number, e: React.MouseEvent) => {
    e.preventDefault()

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
    newShowIfItems.push({ name: "", hasIt: true })

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  /**
   * Show If Stats
   */
  selectShowIfStat = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    let newShowIfStats = clone(this.state.thisPortMeta.showIfStats || [])
    newShowIfStats[index].name = e.target.value

    this.state.thisPortMeta.showIfStats = newShowIfStats
    this.savePortMeta()
  }

  selectShowIfStatOperator = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault()

    let newShowIfStats = clone(this.state.thisPortMeta.showIfStats || [])
    newShowIfStats[index].operator = e.target.value

    this.state.thisPortMeta.showIfStats = newShowIfStats
    this.savePortMeta()
  }

  setShowIfStatValue = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newShowIfStats = clone(this.state.thisPortMeta.showIfStats || [])
    newShowIfStats[index].value = e.target.value

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
    newShowIfStats.push({ name: "", operator: "", value: 0 })

    this.state.thisPortMeta.showIfStats = newShowIfStats
    this.savePortMeta()
  }

  /**
   * Items and Item Changes
   */
  addItemChanges = (e: React.MouseEvent) => {
    e.preventDefault()

    let newItemChanges = clone(this.state.thisPortMeta.itemChanges || [])
    newItemChanges.push({ name: "", action: "add" })

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
    console.log("Here:", index)
    let newItemChanges = clone(this.state.thisPortMeta.itemChanges || [])
    newItemChanges[index].name = e.target.value

    this.state.thisPortMeta.itemChanges = newItemChanges
    this.savePortMeta()
  }

  toggleItemChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()

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
    newStatChanges.push({ name: "", value: undefined, action: "+" })

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
    newStatChanges[index].value = e.target.value

    this.state.thisPortMeta.statChanges = newStatChanges
    this.savePortMeta()
  }

  toggleStatChanges = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()

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

    // Clone here and elsewhere so we get immutable objects in global state
    updateState({
      ...state,
      portMeta: {
        ...state.portMeta,
        [port.id]: newPortMeta
      }
    })
  }

  possibleItemModifiers: (c: string) => string[] = (current) => {
    let { portMeta } = this.props.state
    let { thisPortMeta } = this.state
    let toReturn: string[] = []

    for (let key in portMeta) {
      let changes = portMeta[key].itemChanges || []

      changes.forEach((change) => {
        if (change.action === "add" && toReturn.indexOf(change.name) === -1) {
          toReturn.push(change.name)
        }
      })
    }

    let existing = (thisPortMeta.showIfItems || []).map((showIf) => {
      return showIf.name
    })

    return toReturn.filter((name) => {
      return name && (name === current || (existing.indexOf(name) === -1))
    })
  }

  possibleStatModifiers: (c: string) => string[] = (current) => {
    let { portMeta } = this.props.state
    let { thisPortMeta } = this.state
    let toReturn: string[] = []

    for (let key in portMeta) {
      let changes = portMeta[key].statChanges || []

      changes.forEach((change) => {
        if (toReturn.indexOf(change.name) === -1) {
          toReturn.push(change.name)
        }
      })
    }

    let existing = (thisPortMeta.showIfStats || []).map((showIf) => {
      return showIf.name
    })

    return toReturn.filter((name) => {
      return name && (name === current || (existing.indexOf(name) === -1))
    })
  }

}


export default (props: PortEditorProps) => <StateConsumer>
  {({ state, updateState }) =>
    <PortEditor
      {...props}
      state={state}
      updateState={updateState}
    />
  }
</StateConsumer>
