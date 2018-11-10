import * as React from "react";
import { DefaultPortModel } from "storm-react-diagrams";

interface PortEditorProps {
  port: DefaultPortModel
  removeChoice: () => void
  updateChoice: () => void
}

class PortEditor extends React.Component<PortEditorProps> {
  state = { optionsOpen: false }
  render() {
    const { port, removeChoice, updateChoice } = this.props

    return <li key={port.id}>
      <input
        defaultValue={port.label}
        onChange={updateChoice}
      />{' '}
      <button onClick={removeChoice}>
        Delete
      </button>
    </li>
  }
}

export default PortEditor
