import * as React from 'react'

import 'redactor/redactor.css'
import 'redactor/redactor'
import './SceneEditor.css'

import { get, set } from 'lodash'
import { DefaultNodeModel } from 'storm-react-diagrams'
import { StateConsumer, ApplicationState } from '../Store'
import ChoiceEditor from './ChoiceEditor'

declare function $R(el: HTMLElement, options: any): void
declare function $R(el: HTMLElement, fun: string, arg: string): void

interface SceneEditorProps {
  state: ApplicationState
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
  focus: DefaultNodeModel
  requestPaint: () => void
  onClear: () => void
}

class SceneEditor extends React.Component<SceneEditorProps> {
  editor: React.RefObject<HTMLTextAreaElement> = React.createRef()

  componentDidMount() {
    this.install()
  }

  render() {
    const { state, focus, requestPaint } = this.props

    // TODO: replace this. It doesn't matter much here but this breaks typechecking as get always returns `any`
    const text = get(state, `meta.${focus.id}.text`)

    return (
      <aside className="SceneEditor" onKeyUp={this.trapKeys}>
        <div className="SceneEditorField">
          <label className="SceneEditorHeading" htmlFor="title">Name</label>
          <input
            name="title"
            defaultValue={focus.name}
            onChange={this.onNameChange}
          />
        </div>

        <div className="SceneEditorField">
          <label className="SceneEditorHeading" htmlFor="content">Content</label>
          <textarea name="content" ref={this.editor} defaultValue={text} />
        </div>

        <div className="SceneEditorField">
          <h3 className="SceneEditorHeading">Choices</h3>

          <ChoiceEditor focus={focus} requestPaint={requestPaint} />
        </div>
      </aside>
    )
  }

  private install() {
    if (this.editor.current) {
      $R(this.editor.current, {
        buttons: ['format', 'bold', 'italic', 'lists'],
        callbacks: {
          synced: (html: string) => this.onChange(html)
        }
      })
    }
  }

  private onChange(html: string) {
    const { focus, state, updateState } = this.props

    updateState(set(state, `meta.${focus.id}.text`, html))
  }

  private onNameChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.focus.name = event.currentTarget.value
    this.props.requestPaint()
  }

  /**
   * Important: We trap key presses in the sidebar so that backspaces
   * do not delete nodes!
   */
  private trapKeys = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        this.props.onClear()
        break
      default:
        event.stopPropagation()
    }
  }
}

interface ConsumerProps {
  focus: DefaultNodeModel | null
  requestPaint: () => void
  onClear: () => void
}

export default ({ focus, requestPaint, onClear }: ConsumerProps) => {
  if (focus == null) {
    return null
  }

  return (
    <StateConsumer>
      {props => (
        <SceneEditor
          key={focus.id}
          requestPaint={requestPaint}
          focus={focus}
          onClear={onClear}
          {...props}
        />
      )}
    </StateConsumer>
  )
}
