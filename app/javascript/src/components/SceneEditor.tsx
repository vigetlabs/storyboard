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


  render() {
    const { state, focus, requestPaint } = this.props

    // TODO: replace this. It doesn't matter much here but this breaks typechecking as get always returns `any`
    const text = get(state, `meta.${focus.id}.text`)
    const notes = get(state, `meta.${focus.id}.notes`)
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

        <SceneEditorTextAreaField
          name="content"
          title="Content"
          defaultValue={text}
          placeholderText=""
          instructionalText=""
          onChange={this.onChangeContent}

        />
        <div className="SceneEditorField">
          <h3 className="SceneEditorHeading">Choices</h3>

          <ChoiceEditor focus={focus} requestPaint={requestPaint} />
        </div>

        <SceneEditorTextAreaField
          name="notes"
          title="Editor Notes"
          placeholderText="Enter any editor-only notes you have here"
          instructionalText="This box is for adding comments, new ideas, or general notes for this scene. These notes are not visible to the user."
          defaultValue={notes}
          onChange={this.onChangeNotes}
        />
      </aside>
    )
  }


  onChangeContent = (html: string) => {
    const { focus, state, updateState } = this.props

    updateState(set(state, `meta.${focus.id}.text`, html))
  }

  onChangeNotes = (html: string) => {
    const { focus, state, updateState } = this.props

    updateState(set(state, `meta.${focus.id}.notes`, html))
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

type SceneEditorTextAreaFieldProps = {
  name: string,
  title: string,
  defaultValue: string,
  placeholderText: string,
  instructionalText: string,
  onChange: (arg0: string) => void
}

/**
 * 
 * New abstracted-out way of render react components for the text areas, since the Content and Notes areas are very similar
 */
function SceneEditorTextAreaField({ name, title, defaultValue, placeholderText, instructionalText, onChange}: SceneEditorTextAreaFieldProps) {
  let inputRef: React.RefObject<HTMLTextAreaElement> = React.createRef()

  
  React.useEffect(() => {
    if (inputRef.current) {
      $R(inputRef.current, {
        buttons: ['format', 'bold', 'italic', 'lists'],
        callbacks: {
          synced: (html: string) => onChange(html)
        }
      })
    }
  }, [inputRef.current])

  return (
    <div className="SceneEditorField">
      <label className="SceneEditorHeading" htmlFor={name}>{title}</label>
      <textarea placeholder={placeholderText} name={name} ref={inputRef} defaultValue={defaultValue} />
      <p>{instructionalText}</p>
    </div>
  )
}