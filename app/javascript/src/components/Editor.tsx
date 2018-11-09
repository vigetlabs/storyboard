import * as React from 'react'

import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  LinkModel,
  DiagramWidget,
  DefaultLinkModel,
  DefaultPortModel,
  DefaultLabelModel
} from 'storm-react-diagrams'
import SceneEditor from './SceneEditor';

import './Editor.css'
import './FlowChart.css'

const nodes = {
  hungry: new DefaultNodeModel('You are hungry. Sooo hungry.', '#4CAF50'),
  cooking: new DefaultNodeModel(
    'You frying bacon. It smells amazing.',
    '#ffeb3b'
  ),
  starve: new DefaultNodeModel('You ded', '#f44336')
}

const ports = {
  findFood: nodes.hungry.addOutPort('Find Food'),
  wait: nodes.hungry.addOutPort('Wait'),
  cook: nodes.cooking.addInPort('Input'),
  dead: nodes.starve.addInPort('Input')
}

function link(a: DefaultPortModel, b: DefaultPortModel) {
  return a.link(b)
}

interface EditorState {
  ready: Boolean
}

class Editor extends React.Component<{}, EditorState> {
  state: EditorState = {
    ready: false
  }

  async componentDidMount() {
    setTimeout(() => {
      this.setState({ ready: true })
    }, 100)
  }

  render() {
    if (this.state.ready !== true) {
      return null
    }

    const engine = new DiagramEngine()
    const model = new DiagramModel()

    engine.installDefaultFactories()

    nodes.hungry.setPosition(100, 100)
    nodes.cooking.setPosition(400, 300)
    nodes.starve.setPosition(100, 300)

    model.addAll(
      nodes.hungry,
      nodes.cooking,
      nodes.starve,
      link(ports.findFood, ports.cook),
      link(ports.wait, ports.dead)
    )

    engine.setDiagramModel(model)

<<<<<<< HEAD
    return <DiagramWidget className="srd-demo-canvas" diagramEngine={engine} />
  }
||||||| merged common ancestors
  return <DiagramWidget className="srd-demo-canvas" diagramEngine={engine} />
=======
  return <>
    <DiagramWidget className="srd-demo-canvas" diagramEngine={engine} />
    <SceneEditor />
  </>
>>>>>>> Add Scene Editor
}

export default Editor
