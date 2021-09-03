import * as React from 'react'

interface Props {
  title: string
  body: string
  image: string
  onReplay: () => void
  onGoBack: () => void
  showSource: boolean
}

export const PlayerEnd: React.SFC<Props> = ({ title, body, image, onReplay, onGoBack, showSource }) => {
  const imageContent = () => {
    if (image) {
      return <img src={image} alt='' width='400' />
    } else {
      return
    }
  }

  const sourceButton = () => {
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
      {sourceButton()}
      <div className="PlayerForeground">
        <h1 className="PlayerEndTitle">{title}</h1>
        <div className="PlayerEndContent">
          {imageContent()}
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
      onReplay={onReplay}
      onGoBack={onGoBack}
      showSource={showSource}
    />
  )
}
