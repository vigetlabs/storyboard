import * as React from 'react'

import 'redactor/redactor.css'
import 'redactor/redactor'
import './SceneEditor.css'

import { get, set } from 'lodash'
import { DefaultNodeModel, DefaultPortModel } from 'storm-react-diagrams'
import { StateConsumer, ApplicationState } from '../Store'

declare function $R(el: HTMLElement, options: any): void
declare function $R(el: HTMLElement, fun: string, arg: string): void

interface SceneEditorProps {
  state: ApplicationState
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
  focus: DefaultNodeModel
  requestPaint: () => void
}

class SceneEditor extends React.Component<SceneEditorProps> {
  editor: React.RefObject<HTMLTextAreaElement> = React.createRef()

  componentDidMount() {
    this.install()
  }

  render() {
    const { state, focus } = this.props

    const text = get(state, `meta.${focus.id}.text`)

    return (
      <aside className="SceneEditor" onKeyUp={this.trapKeys}>
        <div className="SceneEditorField">
          <label htmlFor="title">Name</label>
          <input name="title" defaultValue={focus.name} onChange={this.onNameChange} />
        </div>

        <div className="SceneEditorField">
          <label htmlFor="content">Content</label>
          <textarea name="content" ref={this.editor} defaultValue={text} />
        </div>

        <div className="SceneEditorField">
          <h3>Choices</h3>

          <ul className="SceneEditorPortList">
            {this.ports.map(port => (
              <li key={port.id}>
                <input
                  defaultValue={port.label}
                  onChange={this.updateChoice.bind(this, port)}
                />{' '}
                <button onClick={this.removeChoice.bind(this, port)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={this.addChoice} className="SceneEditorPortForm">
            <input name="label" defaultValue="" min="1" required={true} />
            <button>Add choice</button>
          </form>
        </div>
      </aside>
    )
  }

  updateChoice = (
    port: DefaultPortModel,
    event: React.FormEvent<HTMLInputElement>
  ) => {
    port.label = event.currentTarget.value
    this.props.requestPaint()
  }

  removeChoice = (port: DefaultPortModel) => {
    const { focus, requestPaint } = this.props

    focus.removePort(port)
    requestPaint()
  }

  addChoice = (event: React.FormEvent) => {
    event.preventDefault()

    const { focus } = this.props

    const form = event.target as HTMLFormElement
    const input = form.elements.namedItem('label') as HTMLInputElement

    focus.addOutPort(input.value)

    input.value = ''

    this.props.requestPaint()
  }

  get ports(): DefaultPortModel[] {
    let ports = []

    for (let key in this.props.focus.ports) {
      let port = this.props.focus.ports[key]
      if (port.in === false) {
        ports.push(port)
      }
    }

    return ports
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
    event.stopPropagation()
  }
}

interface ConsumerProps {
  focus: DefaultNodeModel | null
  requestPaint: () => void
}

export default ({ focus, requestPaint }: ConsumerProps) => {
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
          {...props}
        />
      )}
    </StateConsumer>
  )
}
