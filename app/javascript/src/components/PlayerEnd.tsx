import * as React from 'react'

interface Props {
  title: string
  body: string
  onReplay: () => void
}

export const PlayerEnd: React.SFC<Props> = ({ title, body, onReplay }) => {
  return (
    <main className="PlayerEnd">
      <div className="PlayerForeground">
        <h1 className="PlayerEndTitle">{title}</h1>

        <div className="PlayerEndContent">
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
}

export const PlayerDeadEnd: React.SFC<DeadEndProps> = ({ onReplay }) => {
  return (
    <PlayerEnd
      title="Dead End"
      body="That choice wasn't tied to a new scene. You should fix that. Try replaying the story."
      onReplay={onReplay}
    />
  )
}
