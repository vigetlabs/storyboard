import * as React from 'react'
import TutorialPage from './TutorialPage'

import './Tutorial.css'

interface TutorialProps {
  isOpen: boolean
  setTutorialOpen(isOpen: boolean): void
}

class Tutorial extends React.Component<TutorialProps> {
  constructor(props: TutorialProps) {
    super(props)

    document.onkeyup = this.onKeyUp
  }

  render() {
    if (!this.props.isOpen) {
      return null
    }

    return (
      <div className="TutorialBackdrop">
        <div className="Tutorial">
          <div>
            <button className="delete" onClick={this.handleClose}>
              X
            </button>
          </div>

          <TutorialPage onClose={this.handleClose} />
        </div>
      </div>
    )
  }

  private onKeyUp = (event: KeyboardEvent) => {
    if (this.props.isOpen && event.key == 'Escape') {
      this.handleClose()
    }
  }

  handleClose = () => {
    localStorage.setItem('tutorial', 'seen')
    this.props.setTutorialOpen(false)
  }
}

export default Tutorial
