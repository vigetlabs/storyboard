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
    text: string,
    notes: string
  }
}

export interface PortMeta {
  [port_id: string]: {
    showIf?: string
    showUnless?: string
    addsModifier: string
  }
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
