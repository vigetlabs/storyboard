import * as React from "react";

export interface ApplicationState {
  story: Story,
  currentFocusedScene?: string,
}

interface Story {
  scenes: { [id: string]: Scene }
}

interface Scene {
  title: string,
  text: string,
  decisions: string[],
}

const applicationState: ApplicationState = {
  story: { scenes: {} },
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
