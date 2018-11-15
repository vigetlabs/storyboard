import * as React from 'react'
import TutorialPage from './TutorialPage'

import './Tutorial.css'

interface TutorialState {
  open: boolean
}

class Tutorial extends React.Component<{}, TutorialState> {
  open: boolean

  constructor(props: {}) {
    super(props)

    this.state = {
      open: localStorage.getItem("tutorial") != "seen",
    }

    document.onkeyup = this.onKeyUp
  }

  render() {
    if (!this.state.open) {
      return null
    }

    return (
      <div className="TutorialBackdrop">
        <div className="Tutorial">
          <div>
            <button className="delete" onClick={this.handleClose}>X</button>
          </div>

          <TutorialPage onClose={this.handleClose}/>
        </div>
      </div>
    )
  }

  private onKeyUp = (event: KeyboardEvent) => {
    if (this.state.open && event.key == "Escape") {
      this.handleClose()
    }
  }

  handleClose = () => {
    localStorage.setItem("tutorial", "seen")
    this.setState({open: false})
  }
}

export default Tutorial
