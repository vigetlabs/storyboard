import * as React from "react"

import "redactor/redactor.css"
import "redactor/redactor"

import { StateConsumer, ApplicationState } from "../Store"
import "./SceneEditor.css"

declare function $R(el: HTMLElement, options: any): void;

interface SceneEditorProps {
  state: ApplicationState;
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>;
}

class SceneEditor extends React.Component<SceneEditorProps> {
  editor: React.RefObject<HTMLTextAreaElement> = React.createRef()

  componentDidMount() {
    this._install()
  }

  render() {
    const { state: { story: { scenes }, currentFocusedScene } } = this.props;
    const text = currentFocusedScene ? scenes[currentFocusedScene].text : ""

    return (
      <aside className="SceneEditor">
        <textarea ref={this.editor} defaultValue={text} />
      </aside>
    )
  }

  _install() {
    if (this.editor.current) $R(this.editor.current, {
      callbacks: {
        synced: (html: string) =>
          this._onChange(this.props.state.currentFocusedScene)
      }
    })
  }

  _onChange(html?: string) {
    const { state: { story: { scenes }, currentFocusedScene }, updateState } = this.props;
    if (!currentFocusedScene) return
    const scene = {
      ...scenes[currentFocusedScene],
      text: html
    }

    updateState({ ...this.props.state, [currentFocusedScene]: scene })
  }
}

export default () => <StateConsumer>
  {(props) => <SceneEditor {...props} />}
</StateConsumer>
