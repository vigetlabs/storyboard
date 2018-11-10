import * as React from "react";
import { DefaultPortModel } from "storm-react-diagrams";
import { StateConsumer, ApplicationState } from "../Store";
import { get } from "lodash";

interface PortEditorProps {
  port: DefaultPortModel
  removeChoice: () => void
  updateChoice: () => void
}

interface PortEditorStateProps {
  state: ApplicationState
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
}

interface ModifierSelectProps {
  modifiers: string[]
  value: string
  onChange(value: string): void
}

const ModifierSelect: React.SFC<ModifierSelectProps> = ({ modifiers, value, onChange }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}>
    <option value=""></option>
    {modifiers.map(modifier =>
      <option key={modifier} value={modifier}>{modifier}</option>)
    }
  </select>
)

class PortEditor extends React.Component<PortEditorProps & PortEditorStateProps, { optionsOpen: boolean }> {
  state = { optionsOpen: false }

  optionsButtonClick = () => {
    this.setState(prevState => ({ optionsOpen: !prevState.optionsOpen }))
  }

  render() {
    const { port, removeChoice, updateChoice, updateState, state: { modifiers } } = this.props
    const { optionsOpen } = this.state
    const showIf = get(this.props.state, `portMeta.${port.id}.showIf`)
    const showUnless = get(this.props.state, `portMeta.${port.id}.showUnless`)
    const addsModifier = get(this.props.state, `portMeta.${port.id}.addsModifier`)

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
          <span>Show If</span>
          <ModifierSelect
            value={showIf}
            modifiers={modifiers}
            onChange={(val) => this.handleShowChange({ showIf: val })}
          />
          <span>Show Unless</span>
          <ModifierSelect
            value={showUnless}
            modifiers={modifiers}
            onChange={(val) => this.handleShowChange({ showUnless: val })}
          />
        </li>
        <li>
          <span>Add Modifier When Selected:</span>
          <input onBlur={this.handleAddModifier} defaultValue={addsModifier} />
        </li>
      </>
      }
    </>
  }

  updatePortMeta = (value: { [key: string]: string }) => {
    const { port, state } = this.props
    const { portMeta } = state;
    const thisPortMeta = portMeta[port.id] || {};

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

    if (state.modifiers.indexOf(value) === -1) {
      updateState({
        ...state,
        modifiers: [
          ...state.modifiers,
          value
        ],
        portMeta: this.updatePortMeta({ addsModifier: value })
      })
    }
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
