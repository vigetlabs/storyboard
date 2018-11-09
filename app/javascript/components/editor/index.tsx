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

import 'storm-react-diagrams/dist/style.min.css'

import './editor.css'

const nodes = {
  hungry: new DefaultNodeModel(
    'You are hungry. Sooo hungry.',
    'rgb(0,192,255)'
  ),
  cooking: new DefaultNodeModel(
    'You frying bacon. It smells amazing.',
    'rgb(0,192,255)'
  ),
  starve: new DefaultNodeModel('You ded', 'rgb(0,192,255)')
}

const ports = {
  findFood: nodes.hungry.addOutPort('Find Food'),
  wait: nodes.hungry.addOutPort('Wait'),
  cook: nodes.cooking.addInPort('Cook'),
  dead: nodes.starve.addInPort('Death')
}

function link(a: DefaultPortModel, b: DefaultPortModel, label: string) {
  const edge = a.link(b)
  const labelModel = new DefaultLabelModel()
  labelModel.setLabel(label)

  edge.addLabel(labelModel)

  return edge
}

const Editor = () => {
  let engine = new DiagramEngine()
  engine.installDefaultFactories()

  let model = new DiagramModel()

  nodes.hungry.setPosition(100, 100)
  nodes.cooking.setPosition(400, 300)
  nodes.starve.setPosition(100, 300)

  model.addAll(
    nodes.hungry,
    nodes.cooking,
    nodes.starve,
    link(ports.findFood, ports.cook, 'Make bacon'),
    link(ports.wait, ports.dead, 'Your hearts deplete')
  )

  engine.setDiagramModel(model)

  return <DiagramWidget className="srd-demo-canvas" diagramEngine={engine} />
}

export default Editor