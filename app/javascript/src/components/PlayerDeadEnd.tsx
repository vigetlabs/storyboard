import * as React from 'react'

interface Props {
  goBack: () => void
}

export const PlayerDeadEnd: React.SFC<Props> = ({ goBack }) => {
  return (
    <main className="PlayerScene">
      <h1 className="PlayerTitle">Dead End!</h1>

      That choice wasn't tied to a new scene. You should fix that. In the
      meantime though:

      <ul className="PlayerChoiceList">
        <li onClick={goBack}>
          <button title="Go Back">‹</button>
          <p className="-onRight">Go Back</p>
        </li>
      </ul>
    </main>
  )
}
