import * as React from 'react'

interface Props {
  onClear: () => void
  onRelease: () => void
}

export default class Workspace extends React.Component<Props> {
  isMouseDown: Boolean = false
  isDragging: Boolean = false
  mouseDown: Date

  render() {
    return (
      <div
        className="EditorWorkspace"
        onMouseUp={this.releaseMouse}
        onMouseDown={this.pressMouse}
        onMouseMove={this.dragMouse}
      >
        {this.props.children}
      </div>
    )
  }

  releaseMouse = () => {
    if (this.isDragging) {
      this.props.onClear()
    }

    this.isMouseDown = false
    this.isDragging = false

    this.props.onRelease()
  }

  pressMouse = () => {
    this.isMouseDown = true
    this.mouseDown = new Date()
  }

  dragMouse = () => {
    let now = new Date()

    this.isDragging = (this.isMouseDown && (
      now.valueOf() - this.mouseDown.valueOf() > 250
    ))
  }

}
