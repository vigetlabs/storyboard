import * as React from 'react'
import seed from './seed'

export interface ApplicationState {
  slug: String
  story?: any
  meta: MetaData
  portMeta: PortMeta
  modifiers: string[]
  currentFocusedScene?: string
}

export interface MetaData {
  [id: string]: {
    title: string
    text: string
    notes: string
    isFinal: boolean
    image: string
    audio: string
  }
}

export interface PortMeta {
  [port_id: string]: PortMetaContent
}

export interface PortMetaContent {
  showIfItems?: ShowIfItem[]
  showIfStats?: ShowIfStat[]
  itemChanges?: ItemChange[]
  statChanges?: StatChange[]
  isTimer: boolean
  timeoutSeconds: number
}

export interface ShowIfItem {
  name: string
  hasIt: boolean
}

export interface ShowIfStat {
  name: string
  operator: string
  value: number
}

export interface ItemChange {
  name: string
  action: 'add' | 'remove'
}

export interface StatChange {
  name: string
  value: number
  action: '+' | '-'
}

const applicationState: ApplicationState = {
  slug: '',
  story: seed,
  meta: {},
  portMeta: {},
  modifiers: [],
  currentFocusedScene: undefined
}

const ApplicationStateContext = React.createContext({
  state: applicationState,

  updateState(state: ApplicationState): ApplicationState {
    return state
  }
})

interface Props {
  slug: String
  story: Object
  meta: MetaData
}

export class ApplicationComponent extends React.Component<
  Props,
  ApplicationState
> {
  static defaultProps = {
    story: seed.story,
    meta: seed.meta
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      ...applicationState,
      ...props
    }
  }

  render() {
    const value = {
      state: this.state,
      updateState: this.setState.bind(this)
    }

    return (
      <ApplicationStateContext.Provider value={value}>
        {this.props.children}
      </ApplicationStateContext.Provider>
    )
  }
}

export const StateConsumer = ApplicationStateContext.Consumer
