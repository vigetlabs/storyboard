import * as React from "react";

interface ApplicationState {
  story: any,
  currentFocusedScene: any,
}
const applicationState: ApplicationState = {
  story: {},
  currentFocusedScene: null
}

const ApplicationStateContext = React.createContext({
  state: applicationState,

  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState> {
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
