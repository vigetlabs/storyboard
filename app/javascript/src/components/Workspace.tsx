import * as React from 'react'

interface WorkspaceProps {
  onClear: () => void
  onRelease: () => void
  onCopy: () => void
  onPaste: () => void
  saveStory: (opts: {}) => void
}

const C_KEY = 67
const V_KEY = 86

export default class Workspace extends React.Component<WorkspaceProps> {
  isMouseDown: Boolean = false
  isDragging: Boolean = false
  mouseDown: Date

  constructor(props: WorkspaceProps) {
    super(props)

    // Naive auto saving unless you're dragging
    setInterval(this.maybySaveStory, 10000)
  }

  render() {
    return (
      <div
        className="EditorWorkspace"
        tabIndex={0}
        onMouseUp={this.releaseMouse}
        onMouseDown={this.pressMouse}
        onMouseMove={this.dragMouse}
        onKeyDown={this.handleKeyPress}
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

    this.isDragging =
      this.isMouseDown && now.valueOf() - this.mouseDown.valueOf() > 150
  }

  handleKeyPress = (event: any) => {
    if ((event.ctrlKey || event.metaKey) && event.keyCode == C_KEY)
      this.handleCopy()
    if ((event.ctrlKey || event.metaKey) && event.keyCode == V_KEY)
      this.handlePaste()
  }

  handleCopy = () => {
    this.props.onCopy()
  }

  handlePaste = () => {
    this.props.onPaste()
  }

  maybySaveStory = () => {
    if (!this.isMouseDown) {
      this.props.saveStory({ force: false })
    }
  }
}
