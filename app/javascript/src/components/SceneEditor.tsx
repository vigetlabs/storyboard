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
    const { state: { meta, currentFocusedScene } } = this.props;
    const text = currentFocusedScene ? meta[currentFocusedScene].text : ""

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
    const { state: { meta, currentFocusedScene }, updateState } = this.props;
    if (!currentFocusedScene || !html) return
    const metaItem = {
      ...meta[currentFocusedScene],
      text: html
    }

    updateState({
      ...this.props.state, meta: {
        [currentFocusedScene]: metaItem
      }
    })
  }
}

export default () => <StateConsumer>
  {(props) => <SceneEditor {...props} />}
</StateConsumer>
