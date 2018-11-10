import * as React from "react";
import { DefaultNodeModel, DefaultPortModel } from "storm-react-diagrams";

interface ChoiceEditorProps {
  focus: DefaultNodeModel
  requestPaint: () => void
}

class ChoiceEditor extends React.Component<ChoiceEditorProps> {
  render() {
    return <>
      <ul className="SceneEditorPortList">
        {this.ports.map(port => (
          <li key={port.id}>
            <input
              defaultValue={port.label}
              onChange={this.updateChoice.bind(this, port)}
            />{' '}
            <button onClick={this.removeChoice.bind(this, port)}>
              Delete
                </button>
          </li>
        ))}
      </ul>

      <form onSubmit={this.addChoice} className="SceneEditorPortForm">
        <input name="label" defaultValue="" min="1" required={true} />
        <button>Add choice</button>
      </form>
    </>
  }

  get ports(): DefaultPortModel[] {
    let ports = []

    for (let key in this.props.focus.ports) {
      let port = this.props.focus.ports[key]
      if (port.in === false) {
        ports.push(port)
      }
    }

    return ports
  }

  updateChoice = (
    port: DefaultPortModel,
    event: React.FormEvent<HTMLInputElement>
  ) => {
    port.label = event.currentTarget.value
    this.props.requestPaint()
  }

  removeChoice = (port: DefaultPortModel) => {
    const { focus, requestPaint } = this.props

    // Avoids zombie links attached to the input node
    Object.keys(port.links).forEach(id => {
      // This removes the link itself. It is different than
      // port.removeLink(), which only disconnects the port
      port.links[id].remove()
    })

    focus.removePort(port)

    requestPaint()
  }

  addChoice = (event: React.FormEvent) => {
    event.preventDefault()

    const { focus } = this.props

    const form = event.target as HTMLFormElement
    const input = form.elements.namedItem('label') as HTMLInputElement

    focus.addOutPort(input.value)

    input.value = ''

    this.props.requestPaint()
  }
}

export default ChoiceEditor
