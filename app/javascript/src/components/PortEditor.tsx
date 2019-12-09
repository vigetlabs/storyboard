import * as React from "react";
import { DefaultPortModel } from "storm-react-diagrams";
import { StateConsumer, ApplicationState, PortMeta, ShowIfItem, ItemChange } from "../Store";
import { get } from "lodash";

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
  portMeta: {
    showIfItems: ShowIfItem[]
    itemChanges: ItemChange[]
  }
}

class PortEditor extends React.Component<PortEditorProps & PortEditorStateProps, PortEditorState> {
  constructor(props: PortEditorProps & PortEditorStateProps) {
    super(props);

    let { state, port } = props
    // Legacy state
    const showIf = get(state, `portMeta.${port.id}.showIf`)
    const showUnless = get(state, `portMeta.${port.id}.showUnless`)
    const addsModifier = get(state, `portMeta.${port.id}.addsModifier`)

    // New State
    let showIfItems = get(state, `portMeta.${port.id}.showIfItems`) || []
    let itemChanges = get(state, `portMeta.${port.id}.itemChanges`) || []

    if (showIf) {
      showIfItems.push({
        name: showIf,
        hasIt: true
      })
    }

    if (showUnless) {
      showIfItems.push({
        name: showUnless,
        hasIt: false
      })
    }

    if (addsModifier) {
      itemChanges = [
        {
          name: addsModifier,
          action: "add"
        }
      ]
    }

    this.state = {
      optionsOpen: false,
      portMeta: {
        showIfItems: showIfItems,
        itemChanges: itemChanges
      }
    }
  }

  optionsButtonClick = () => {
    this.setState(prevState => ({ optionsOpen: !prevState.optionsOpen }))
  }

  render() {
    const { port, removeChoice, updateChoice } = this.props
    const { optionsOpen, portMeta: { showIfItems, itemChanges } } = this.state

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
              <tr>
                <th>Item</th>
                <th>Has It?</th>
                <th></th>
              </tr>

              {showIfItems.map(item => (
                <tr>
                  <td>{item.name}</td>
                  <td>{item.hasIt ? "✔️" : "X"}</td>
                  <td><a onClick={this.removeShowIf.bind(this, item.name)}>remove</a></td>
                </tr>
              ))}
            </table>
          </div>
        </li>
        <li>
          <div>
            <b>Items</b>

            <table className="attributeTable">
              <tr>
                <th>Add/Remove</th>
                <th>Item</th>
              </tr>

              {itemChanges.map(item => (
                <tr>
                  <td>{item.action}</td>
                  <td>{item.name}</td>
                </tr>
              ))}
            </table>
          </div>
        </li>
      </>
      }
    </>
  }

  removeShowIf = (itemName: string, e: React.MouseEvent<HTMLTableDataCellElement>) => {
    e.preventDefault()

    let newShowIfItems = this.state.portMeta.showIfItems.filter((item) => {
      return item.name != itemName
    })

    this.state.portMeta.showIfItems = newShowIfItems

    this.savePortMeta()
  }

  savePortMeta = () => {
    const { state, updateState, port } = this.props
    const { portMeta } = this.state

    updateState({
      ...state,
      portMeta: {
        ...state.portMeta,
        [port.id]: portMeta
      }
    })
  }

  updatePortMeta = (value: { [key: string]: string }) => {
    const { port, state } = this.props
    const { portMeta } = state;
    const thisPortMeta = portMeta[port.id] || {};

    // If we're deleting the addsModifier, let's clear the value
    if (value.addsModifier == "") {
      delete thisPortMeta.addsModifier
      delete value.addsModifier
    }

    return {
      ...portMeta,
      [port.id]: {
        ...thisPortMeta,
        ...value
      }
    }
  }

  handleShowChange = (value: { [key: string]: string }) => {
    const { state, updateState } = this.props
    updateState({
      ...state,
      portMeta: this.updatePortMeta(value)
    })
  }

  handleAddModifier = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { state, updateState } = this.props
    const value = e.target.value;

    let newPortMeta = this.updatePortMeta({ addsModifier: value })
    let newModifiers = this.gatherModifiers(newPortMeta)

    updateState({
      ...state,
      portMeta: newPortMeta,
      modifiers: newModifiers
    })


  }

  // Returns a list of unique and existing modifiers
  gatherModifiers = (portMeta: PortMeta) => {
    const { updateState } = this.props

    let existingModifiers = []

    for (let key in portMeta) {
      let meta = portMeta[key]

      if (meta.addsModifier) {
        let value = meta.addsModifier

        if (existingModifiers.indexOf(value) === -1) {
          existingModifiers.push(value)
        }
      }
    }

    return existingModifiers
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
