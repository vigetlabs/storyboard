import * as React from "react";
import seed from "./seed";

export interface ApplicationState {
  story: Object,
  meta: MetaData,
  currentFocusedScene?: string,
}

interface MetaData {
  [id: string]: {
    title: string,
    text: string
  }
}

const applicationState: ApplicationState = {
  story: seed,
  meta: {},
  currentFocusedScene: undefined
}

const ApplicationStateContext = React.createContext({
  state: applicationState,

  updateState(state: ApplicationState): ApplicationState {
    return applicationState;
  }
})

export class ApplicationComponent extends React.Component {
  state = applicationState

  render() {
    return <ApplicationStateContext.Provider value={{ state: this.state, updateState: this.setState.bind(this) }}>
      {this.props.children}
    </ApplicationStateContext.Provider>
  }
}

export const StateConsumer = ApplicationStateContext.Consumer;
