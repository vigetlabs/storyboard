import * as React from 'react'

export const PlayerInvalid: React.SFC<{}> = () => {
  return (
    <main className="PlayerScene">
      <div className="PlayerForeground">
        <h1 className="PlayerTitle">Your story's all messed up</h1>
        <div className="PlayerSceneContent">
          <div className="PlayerSceneBody">
            <p>Dead end. Donzo. You probably deleted the start scene.</p>
            <p>
              <strong>Shouldn't have done that.</strong>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
