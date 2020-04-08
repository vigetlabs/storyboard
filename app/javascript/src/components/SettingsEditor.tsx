import * as React from 'react'

import 'redactor/redactor.css'
import 'redactor/redactor'
import { ApplicationState } from '../Store'
import { DefaultNodeModel } from 'storm-react-diagrams'
import { get, set } from 'lodash'

interface SettingsState {
  optionsOpen: boolean,
}

interface SettingsStateProps {
  state: ApplicationState
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
  focus: DefaultNodeModel,
  checkboxDefault: boolean
}

class SettingsEditor extends React.Component<
SettingsStateProps,
SettingsState
> {

  constructor(props: SettingsStateProps) {
    super(props)

    let { state } = props

    this.state = {
      optionsOpen: false,
    }

  }
  render() {
    const { optionsOpen } = this.state
    const { checkboxDefault } = this.props

    return(
      <div className="SceneEditorField">
        <label className="SceneEditorHeading">
          Settings

          <button className="settingsButton" onClick={this.optionsButtonClick}>
            {optionsOpen ? 'v' : '>'}
          </button>
        </label>
        <section>
          {optionsOpen && (
            <>
              <div className="checkboxes">
              <label htmlFor="finalCheckbox"><input type="checkbox" id="finalCheckbox" defaultChecked={checkboxDefault} onClick={this.onChangeFinal} />
                Mark this scene as final?</label>
              </div>
            </>
          )}
        </section>
      </div>
    )
  }
  optionsButtonClick = () => {
    this.setState(prevState => ({ optionsOpen: !prevState.optionsOpen }))
  }

  onChangeFinal = () => {
    const { focus, state, updateState } = this.props
    const isFinal = get(state, `meta.${focus.id}.isFinal`)
    updateState(set(state, `meta.${focus.id}.isFinal`, !isFinal))
  }



}

export default SettingsEditor

