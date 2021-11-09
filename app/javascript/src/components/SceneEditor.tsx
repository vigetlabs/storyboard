import * as React from 'react'

import 'redactor/redactor.css'
import 'redactor/redactor'

import './ReactVoiceRecorder.css'
import './SceneEditor.css'

import { get, set } from 'lodash'
import { DefaultNodeModel } from 'storm-react-diagrams'
import ReactAudioPlayer from 'react-audio-player'
import { StateConsumer, ApplicationState } from '../Store'
import ChoiceEditor from './ChoiceEditor'
import SettingsEditor from './SettingsEditor'
import { savePhoto, removePhoto, saveAudio, removeAudio } from '../persistance'

declare function $R(el: HTMLElement, options: any): void
declare function $R(el: HTMLElement, fun: string, arg: string): void

const ReactVoiceRecorder = require('react-voice-recorder')

interface Duration {
  h: number
  m: number
  s: number
}

interface AudioDetails {
  url: any
  blob: any
  chunks: any
  duration: Duration
}

interface SceneEditorState {
  audioDetails: AudioDetails
  audioOpen: boolean
}

interface SceneEditorProps {
  state: ApplicationState
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
  focus: DefaultNodeModel
  requestPaint: () => void
  updateDiagram: () => void
  onClear: () => void
}

interface AudioData {
  url: string
}

class SceneEditor extends React.Component<SceneEditorProps, SceneEditorState> {
  constructor(props: SceneEditorProps) {
    super(props)

    const { state, focus } = props
    const audio = get(state, `meta.${focus.id}.audio`)

    this.state = {
      audioDetails: {
        url: null,
        blob: null,
        chunks: null,
        duration: {
          h: 0,
          m: 0,
          s: 0
        }
      },
      audioOpen: !!audio
    }
  }

  render() {
    const { state, focus, requestPaint, updateDiagram } = this.props
    const { audioOpen } = this.state

    // TODO: replace this. It doesn't matter much here but this breaks typechecking as get always returns `any`
    const text = get(state, `meta.${focus.id}.text`)
    const notes = get(state, `meta.${focus.id}.notes`)
    const isFinal = get(state, `meta.${focus.id}.isFinal`)
    const image = get(state, `meta.${focus.id}.image`)
    const audio = get(state, `meta.${focus.id}.audio`)

    const renderImageSection = () => {
      if (image) {
        return (
          <div>
            <img src={image} alt='' width='100%' />
            <button onClick={this.removeImage}>Remove Image</button>
          </div>
        )
      } else {
        return <input type="file" accept="image/*" onChange={this.onImageChange} />
      }
    }

    const renderAudioSection = () => {
      if (audio) {
        return (
          <div>
            <ReactAudioPlayer
              src={audio}
              controls
            />
            <button onClick={this.removeAudio}>Remove Audio</button>
          </div>
        )
      } else {
        return (
          <div className="recorderSection">
            <input type="file" accept="audio/*" onChange={this.onAudioChange} />
            <h3 className="recorderHeader">Record your own audio!</h3>
            <ReactVoiceRecorder.Recorder
              record={true}
              hideHeader
              showUIAudio
              audioURL={this.state.audioDetails.url}
              handleAudioStop={(data: AudioDetails) => this.handleAudioStop(data)}
              handleAudioUpload={(data: any) => this.handleAudioUpload(data)}
              handleReset={() => this.handleReset()}
            />
          </div>
        )
      }
    }

    return (
      <aside className="SceneEditor" onKeyUp={this.trapKeys}>
        <div className="SceneEditorField">
          <label className="SceneEditorHeading" htmlFor="title">
            Name
          </label>
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
          linkUrl="/formatting-help"
          linkText="Formatting Help"
          onChange={this.onChangeContent}
        />
        <div className="SceneEditorField">
          <h3 className="SceneEditorHeading">Choices</h3>
          <ChoiceEditor focus={focus} requestPaint={requestPaint} updateDiagram={updateDiagram} />
        </div>

        <div className="SceneEditorField">
          <h3 className="SceneEditorHeading">Image</h3>
          {renderImageSection()}
        </div>

        <div className="SceneEditorField">
          <label className="SceneEditorHeading">
            Audio

            <button className="audioButton" onClick={this.audioButtonClick}>
              {audioOpen ? 'v' : '>'}
            </button>
          </label>
          <section>
            {audioOpen && (
              <>
                {renderAudioSection()}
              </>
            )}
          </section>
        </div>

        <SceneEditorTextAreaField
          name="notes"
          title="Editor Notes"
          placeholderText="Enter any editor-only notes you have here"
          instructionalText="This box is for adding comments, new ideas, or general notes for this scene. These notes are not visible to the user."
          defaultValue={notes}
          onChange={this.onChangeNotes}
        />
        <SettingsEditor
          state={this.props.state}
          updateState={this.props.updateState}
          focus={focus}
          checkboxDefault={isFinal}
        />
        <br/><br/>
      </aside>
    )
  }

  audioButtonClick = () => {
    this.setState(prevState => ({ audioOpen: !prevState.audioOpen }))
  }

  handleAudioStop(data: AudioDetails) {
    this.setState({ audioDetails: data });
  }

  handleAudioUpload(file: any) {
    const { focus, state, updateState } = this.props

    if (this.state.audioDetails.url) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === "string") {
          saveAudio(focus.id, reader.result, state, updateState)
        }
      }
    }
  }

  handleReset() {
    const reset = {
      url: null,
      blob: null,
      chunks: null,
      duration: {
        h: 0,
        m: 0,
        s: 0
      }
    };
    this.setState({ audioDetails: reset });
  }

  onChangeContent = (html: string) => {
    const { focus, state, updateState } = this.props

    updateState(set(state, `meta.${focus.id}.text`, html))
  }

  onChangeNotes = (html: string) => {
    const { focus, state, updateState } = this.props

    updateState(set(state, `meta.${focus.id}.notes`, html))
  }

  onImageChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { focus, state, updateState } = this.props

    if (event && event.currentTarget && event.currentTarget.files
      && event.currentTarget.files.length > 0) {
      const file = event.currentTarget.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === "string") {
          savePhoto(focus.id, reader.result, state, updateState)
        }
      }
    }
  };

  removeImage = () => {
    const { focus, state, updateState } = this.props

    removePhoto(focus.id)
    updateState(set(state, `meta.${focus.id}.image`, undefined))
  }

  onAudioChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { focus, state, updateState } = this.props

    if (event && event.currentTarget && event.currentTarget.files
      && event.currentTarget.files.length > 0) {
      const file = event.currentTarget.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === "string") {
          saveAudio(focus.id, reader.result, state, updateState)
        }
      }
    }
  };

  removeAudio = () => {
    const { focus, state, updateState } = this.props

    this.handleReset()
    removeAudio(focus.id)
    updateState(set(state, `meta.${focus.id}.audio`, undefined))
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
  updateDiagram: () => void
  onClear: () => void
}

export default ({ focus, requestPaint, onClear, updateDiagram }: ConsumerProps) => {
  if (focus == null) {
    return null
  }

  return (
    <StateConsumer>
      {props => (
        <SceneEditor
          key={focus.id}
          requestPaint={requestPaint}
          updateDiagram={updateDiagram}
          focus={focus}
          onClear={onClear}
          {...props}
        />
      )}
    </StateConsumer>
  )
}



type SceneEditorSettingsFieldsProps = {
  name: string,
  checkboxText: string,
  checkboxDefault: boolean,
  onChange: () => void
}


/**
 *
 * New abstracted-out way of render react components for the text areas, since the Content and Notes areas are very similar
 */
function SceneEditorTextAreaField({
  name,
  title,
  defaultValue,
  placeholderText,
  instructionalText,
  onChange,
  linkUrl,
  linkText
}: SceneEditorTextAreaFieldProps) {
  let inputRef: React.RefObject<HTMLTextAreaElement> = React.createRef()

  React.useEffect(() => {
    if (inputRef.current) {
      $R(inputRef.current, {
        buttons: ['html', 'format', 'bold', 'italic', 'lists'],
        callbacks: {
          synced: (html: string) => onChange(html)
        }
      })
    }
  }, [inputRef.current])

  const linkContent = () => {
    if (linkUrl) {
      return (
        <div>
          <a href={linkUrl} target="_blank" rel="noopener noreferrer">
            {linkText}
          </a>
        </div>
      )
    }
  }

  return (
    <div className="SceneEditorField">
      <label className="SceneEditorHeading" htmlFor={name}>
        {title}
      </label>
      <textarea
        placeholder={placeholderText}
        name={name}
        ref={inputRef}
        defaultValue={defaultValue}
      />
      <p>{instructionalText}</p>
      {linkContent()}
    </div>
  )
}


type SceneEditorTextAreaFieldProps = {
  name: string
  title: string
  defaultValue: string
  placeholderText: string
  instructionalText: string
  onChange: (arg0: string) => void
  linkUrl?: string
  linkText?: string
}
