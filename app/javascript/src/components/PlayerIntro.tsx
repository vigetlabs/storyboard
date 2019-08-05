import * as React from 'react'

interface Props {
  title: string
  description: string
  onStart: () => void
}

export const PlayerIntro: React.SFC<Props> = props => {
  const { title, description, onStart } = props

  return (
    <main className="PlayerIntro">
      <div className="PlayerForeground">
        <header className="PlayerIntroHeader">
          <h1 className="PlayerIntroTitle">{title}</h1>
        </header>

        <div className="PlayerIntroContent">
          <div
            className="PlayerIntroBody"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          <button className="PlayerIntroStart" onClick={onStart}>
            Begin
          </button>
        </div>
      </div>
    </main>
  )
}
