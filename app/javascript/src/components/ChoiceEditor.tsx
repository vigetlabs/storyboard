import * as React from 'react'
import { DefaultNodeModel, DefaultPortModel } from 'storm-react-diagrams'
import PortEditor from './PortEditor'

interface ChoiceEditorProps {
  focus: DefaultNodeModel
  requestPaint: () => void
}

class ChoiceEditor extends React.Component<ChoiceEditorProps> {
  render() {
    return (
      <>
        {this.renderChoiceList()}
        {this.renderForm()}
      </>
    )
  }

  renderChoiceList() {
    if (this.ports.length <= 0) {
      return <p>Choices let users advance in the story. Use the form below to create this scene's first choice:</p>
    }

    return (
      <ul className="SceneEditorPortList">
        {this.ports.map(port => (
          <PortEditor
            key={port.id}
            port={port}
            removeChoice={this.removeChoice.bind(this, port)}
            updateChoice={this.updateChoice.bind(this, port)}
          />
        ))}
      </ul>
    )
  }

  renderForm() {
    return (
      <form onSubmit={this.addChoice} className="SceneEditorPortForm">
        <input name="label" defaultValue="" min="1" required={true} />
        <button class="SceneEditorPortFormCreateChoice">Add choice</button>
      </form>
    )
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
