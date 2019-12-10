import * as React from "react";
import { DefaultPortModel } from "storm-react-diagrams";
import { StateConsumer, ApplicationState, PortMetaContent } from "../Store";
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
  thisPortMeta: PortMetaContent
}

class PortEditor extends React.Component<PortEditorProps & PortEditorStateProps, PortEditorState> {
  constructor(props: PortEditorProps & PortEditorStateProps) {
    super(props);

    let { state, port } = props

    this.state = {
      optionsOpen: false,
      thisPortMeta: get(state, `portMeta.${port.id}`)
    }
  }

  optionsButtonClick = () => {
    this.setState(prevState => ({ optionsOpen: !prevState.optionsOpen }))
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
                {showIfItems && showIfItems.map(item => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.hasIt ? "✔️" : "X"}</td>
                    <td><a onClick={this.removeShowIf.bind(this, item.name)}>remove</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                {itemChanges && itemChanges.map(item => (
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

  removeShowIf = (itemName: string, e: React.MouseEvent<HTMLTableDataCellElement>) => {
    e.preventDefault()

    let newShowIfItems = (this.state.thisPortMeta.showIfItems || []).filter((item) => {
      return item.name != itemName
    })

    this.state.thisPortMeta.showIfItems = newShowIfItems

    this.savePortMeta()
  }

  savePortMeta = () => {
    const { thisPortMeta } = this.state
    const { state, updateState, port } = this.props

    updateState({
      ...state,
      portMeta: {
        ...state.portMeta,
        [port.id]: thisPortMeta
      }
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
