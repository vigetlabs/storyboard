import * as React from "react";
import { DefaultPortModel } from "storm-react-diagrams";
import { StateConsumer, ApplicationState, PortMeta } from "../Store";
import { get } from "lodash";

import './PortEditor.css'

interface ShowIfItem {
  name: string
  hasIt: boolean
}

interface ItemChange {
  name: string
  action: string
}

interface PortEditorProps {
  port: DefaultPortModel
  removeChoice: () => void
  updateChoice: () => void
}

interface PortEditorStateProps {
  state: ApplicationState
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
}

class PortEditor extends React.Component<PortEditorProps & PortEditorStateProps, { optionsOpen: boolean }> {
  state = { optionsOpen: false }

  optionsButtonClick = () => {
    this.setState(prevState => ({ optionsOpen: !prevState.optionsOpen }))
  }

  render() {
    const { port, removeChoice, updateChoice, updateState, state: { modifiers } } = this.props
    const { optionsOpen } = this.state

    // Legacy state
    const showIf = get(this.props.state, `portMeta.${port.id}.showIf`)
    const showUnless = get(this.props.state, `portMeta.${port.id}.showUnless`)
    const addsModifier = get(this.props.state, `portMeta.${port.id}.addsModifier`)

    // New State
    let showIfItems: [ShowIfItem] = get(this.props.state, `portMeta.${port.id}.showIfItems`) || []
    let itemChanges: [ItemChange] = get(this.props.state, `portMeta.${port.id}.itemChanges`) || []

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
              </tr>

              {showIfItems.map(item => (
                <tr>
                  <td>{item.name}</td>
                  <td>{item.hasIt ? "✔️" : "X"}</td>
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
