import * as React from 'react'

import ReactAudioPlayer from 'react-audio-player'
import { isMobile } from "react-device-detect";

interface Props {
  title: string
  body: string
  image: string
  audio: string
  hideTitle: boolean
  onReplay: () => void
  onGoBack: () => void
  showSource: boolean
}

export const PlayerEnd: React.SFC<Props> = ({ title, body, image, audio, hideTitle, onReplay, onGoBack, showSource }) => {
  const renderImage = () => {
    if (image) {
      return <img src={image} alt='' width='400' />
    } else {
      return
    }
  }

  const renderAudioSection = () => {
    if (audio) {
      if (isMobile) {
        return (
          <ReactAudioPlayer
            src={audio}
            controls
          />
        )
      } else {
        return (
          <ReactAudioPlayer
            src={audio}
            autoPlay
            controls
          />
        )
      }
    } else {
      return
    }
  }

  const renderSourceButton = () => {
    return showSource ? (
      <a className="SlantButton" id="source-button" href={window.location.href + "/source"} >
        Source
      </a>
    ) : null
  }

  return (
    <main className="PlayerEnd">
      <a className="SlantButton" id="back-button" onClick={(onGoBack)}>
        Back
      </a>
      {renderSourceButton()}
      <div className="PlayerForeground">
        <h1 className="PlayerEndTitle">{!hideTitle && title}</h1>
        <div className="PlayerEndContent">
          {renderImage()}
          {renderAudioSection()}
          <div
            className="PlayerEndBody"
            dangerouslySetInnerHTML={{ __html: body }}
          />
          <button className="PlayerEndReplay" onClick={onReplay} type="button">
            Replay
          </button>
        </div>
      </div>
    </main>
  )
}

interface DeadEndProps {
  onReplay: () => void
  onGoBack: () => void
  showSource: boolean
}

export const PlayerDeadEnd: React.SFC<DeadEndProps> = ({ onReplay, onGoBack, showSource }) => {
  return (
    <PlayerEnd
      title="Dead End"
      body="That choice wasn't tied to a new scene. You should fix that. Try replaying the story."
      image=''
      audio=''
      hideTitle
      onReplay={onReplay}
      onGoBack={onGoBack}
      showSource={showSource}
    />
  )
}
