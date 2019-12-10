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
    const { optionsOpen, thisPortMeta: { showIfItems, itemChanges } } = this.state

    return <>
      <li>
        <input
          defaultValue={port.label}
          onChange={updateChoice}
        />{' '}
        <button onClick={this.optionsButtonClick}>
          {optionsOpen ? '>' : 'v'}
        </button>
        <button onClick={removeChoice}>
          Delete
        </button>
      </li>

      {optionsOpen && <>
        <li>
          <div>
            <b>Show If</b>

            <table className="attributeTable">
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
                      <select value={showIf.name} onChange={this.selectShowIf.bind(this, i)}>
                        <option key="-1"></option>
                        {this.possibleModifiers(showIf.name).map((item, i) => (
                          <option key={i} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td><a onClick={this.toggleShowIf.bind(this, i)}>{showIf.hasIt ? "✔️" : "X"}</a></td>
                    <td><a onClick={this.removeShowIf.bind(this, i)}>remove</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a onClick={this.addShowIf.bind(this)}>+</a>
          </div>
        </li>
        <li>
          <div>
            <b>Items</b>

            <table className="attributeTable">
              <thead>
                <tr>
                  <th>Add/Remove</th>
                  <th>Item</th>
                </tr>
              </thead>

              <tbody>
                {itemChanges && itemChanges.map((item, i) => (
                  <tr key={item.name}>
                    <td>{item.action}</td>
                    <td>{item.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </li>
      </>
      }
    </>
  }

  optionsButtonClick = () => {
    this.setState(prevState => ({ optionsOpen: !prevState.optionsOpen }))
  }

  selectShowIf = (i: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems[i].name = e.target.value

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  toggleShowIf = (i: number, e: React.MouseEvent<HTMLTableDataCellElement>) => {
    e.preventDefault()

    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems[i].hasIt = !newShowIfItems[i].hasIt

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  removeShowIf = (i: number, e: React.MouseEvent<HTMLTableDataCellElement>) => {
    e.preventDefault()

    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems.splice(i, 1)

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  addShowIf = (e: React.MouseEvent<HTMLTableDataCellElement>) => {
    e.preventDefault()

    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems.push({name: "", hasIt: true})

    this.state.thisPortMeta.showIfItems = newShowIfItems
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

    // Clone here and elsewhere so we get immutable objects in global state
    updateState({
      ...state,
      portMeta: {
        ...state.portMeta,
        [port.id]: newPortMeta
      }
    })
  }

  possibleModifiers: (c:string) => string[] = (current) => {
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
      return name === current || (existing.indexOf(name) === -1)
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
