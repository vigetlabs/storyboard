import * as React from 'react'
import { DefaultNodeModel, DefaultPortModel } from 'storm-react-diagrams'
import PortEditor from './PortEditor'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

interface PortsObject {
  [s: string]: DefaultPortModel
}

interface ChoiceEditorProps {
  focus: DefaultNodeModel
  requestPaint: () => void
  updateDiagram: () => void
}

class ChoiceEditor extends React.Component<ChoiceEditorProps> {
  render() {
    return (
      <>
        <DndProvider backend={HTML5Backend}>
            {this.renderChoiceList()}
        </DndProvider>
        {this.renderForm()}
      </>
    )
  }

  renderChoiceList() {
    if (this.portArray.length <= 0) {
      return (
        <p>
          Choices let users advance in the story. Use the form below to create
          this scene's first choice:
        </p>
      )
    }

    return (
      <ul className="SceneEditorPortList">
        {this.portArray.map(port => (
          <PortEditor
            index={this.portArray.indexOf(port)}
            key={port.id}
            port={port}
            removeChoice={this.removeChoice.bind(this, port)}
            updateChoice={this.updateChoice.bind(this, port)}
            moveChoice={this.moveChoice.bind(this, port)}
          />
        ))}
      </ul>
    )
  }

  renderForm() {
    return (
      <form onSubmit={this.addChoice} className="SceneEditorPortForm">
        <input name="label" defaultValue="" min="1" required={true} />
        <button className="SceneEditorPortFormCreateChoice">Add choice</button>
      </form>
    )
  }

  get ports(): PortsObject {
    let ports: PortsObject = {}

    // Filter out the in ports, we only care about the out ports
    for (let key in this.props.focus.ports) {
      let port = this.props.focus.ports[key]
      if (port.in === false) {
        ports[key] = port
      }
    }

    return ports
  }

  set ports(ports: PortsObject) {
    let outPorts: PortsObject = {}
    let inPorts: PortsObject = {}
    let allPorts: PortsObject = {}

    // loop over the reordered ports
    // there will be no 'in' ports here, since we are ordering the choices
    for(let key in ports) {
      let port = ports[key]
      outPorts[key] = port
    }

    // loop over the ports of this node to grab the 'in' ports
    for(let key in this.props.focus.ports) {
      let port = this.props.focus.ports[key]
      if(port.in) {
        inPorts[key] = port
      }
    }

    allPorts = {
      ...inPorts,
      ...outPorts
    }

    this.props.focus.ports = allPorts
  }

  // this.ports returns an unsorted object of keys -> out ports
  // we just want an array to work with in this ChoiceEditor though
  get portArray(): DefaultPortModel[] {
    let array = []

    for (let key in this.ports) {
      let port = this.ports[key]
      array.push(port)
    }

    return array
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

  moveChoice = (
    port: DefaultPortModel,
    dragIndex: number,
    hoverIndex: number
   ) => {
    let originalKeys = Object.keys(this.ports)
    let newKeys = [...originalKeys]

    let dragChoice = originalKeys[dragIndex]

    newKeys.splice(dragIndex, 1)
    newKeys.splice(hoverIndex, 0, dragChoice)

    let portsCopy: PortsObject = {}
    newKeys.forEach(key => {
      portsCopy[key] = this.ports[key]
    })

    this.ports = portsCopy

    this.props.updateDiagram()
  }
}

export default ChoiceEditor
