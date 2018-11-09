import * as React from "react"

import "redactor/redactor.css"
import "redactor/redactor"

import { StateConsumer, ApplicationState } from "../Store"
import "./SceneEditor.css"

declare function $R(el: HTMLElement, options: any): void;
declare function $R(el: HTMLElement, fun: string, arg: string): void;

interface SceneEditorProps {
  state: ApplicationState;
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>;
}

class SceneEditor extends React.Component<SceneEditorProps> {
  editor: React.RefObject<HTMLTextAreaElement> = React.createRef()

  componentDidMount() {
    this.install()
  }

  componentDidUpdate(prevProps: SceneEditorProps) {
    if (this.props.state.currentFocusedScene !== prevProps.state.currentFocusedScene) {
      this.editor.current && $R(this.editor.current, 'source.setCode', this.currentText)
    }
  }

  render() {
    return (
      <aside className="SceneEditor">
        <textarea ref={this.editor} />
      </aside>
    )
  }

  private get currentText() {
    const { state: { meta, currentFocusedScene } } = this.props;
    console.log(currentFocusedScene)
    return currentFocusedScene
      ? meta[currentFocusedScene] ? meta[currentFocusedScene].text : ""
      : ""
  }

  private install() {
    if (this.editor.current) $R(this.editor.current, {
      callbacks: {
        synced: (html: string) => this.onChange(html)
      }
    })
  }

  private onChange(html?: string) {
    const { state: { meta, currentFocusedScene }, updateState } = this.props;
    if (!currentFocusedScene || !html) return
    const metaItem = {
      ...meta[currentFocusedScene],
      text: html
    }

    updateState({
      ...this.props.state, meta: {
        ...meta,
        [currentFocusedScene]: metaItem
      }
    })
  }
}

export default () => <StateConsumer>
  {(props) => <SceneEditor {...props} />}
</StateConsumer>
