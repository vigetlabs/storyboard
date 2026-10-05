import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
} from 'storm-react-diagrams'
import seed from '../src/seed'

export const START_ID = '94913fcb-4d8e-4314-b99e-e24646d5e551'
export const CHOICE_1_PORT = 'a0786b8b-8508-4328-b367-3c3a28976a0d'
export const CHOICE_2_PORT = '5681e7ad-2b1f-4629-9ff4-0a4092e75a89'
export const DECISION_1_ID = '38388378-6f4c-4631-884a-f63ff3ac8fb1'
export const DECISION_2_ID = '9e59af2a-a4dd-4e2d-ac68-14f344ecb4db'

export function loadSeedModel() {
  const engine = new DiagramEngine()
  engine.installDefaultFactories()
  const model = new DiagramModel()
  model.deSerializeDiagram(seed.story, engine)
  return { engine, model }
}

export function startNode() {
  const { model } = loadSeedModel()
  return model.getNode(START_ID) as DefaultNodeModel
}

export function portById(node: DefaultNodeModel, portId: string) {
  return Object.values(node.ports).find(port => port.id === portId)!
}

export const defaultPortMeta = {
  isTimer: false,
  hideChoice: false,
  timeoutSeconds: 0,
  isLoop: false,
}
