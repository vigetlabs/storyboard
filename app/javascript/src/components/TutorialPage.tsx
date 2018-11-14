import * as React from 'react'

interface TPProps {
  onClose: () => void
}

interface TPState {
  index: number
}

interface TutorialPageContent {
  title: string
  text: string
  intro?: boolean
  image?: string
}

const pages: TutorialPageContent[] = [
  {
    title: "Tutorial",
    text: "Welcome to the Storyboard Editor! Here are a few tips to build your first story",
    intro: true
  },
  {
    title: "#1 - Do this thing",
    text: "Scenes have names, content, and choices that you want a reader to take based on the scene. Edit these values in the sidebar that comes up when you click on a scene.",
    image: "this_thing"
  },
  {
    title: "#2 - Do this thing",
    text: "Names are used in the overview, but aren’t shown to readers as they go through your story."
  },
  {
    title: "#3 - Do this thing",
    text: "Content is the scenario that will be presented to readers."
  },
  {
    title: "#4 - Do this thing",
    text: "Choices are options readers will select to shape their story. A scene can have zero to many choices."
  },
  {
    title: "#5 - Do this thing",
    text: "Click “Add Scene” to add a new scene to the story."
  },
  {
    title: "#6 - Do this thing",
    text: "As you’re building out your story, you can re-arrange scenes to keep your story organized. Protip: zoom and pan using the mouse, and select multiple scenes with Shift + Click"
  },
  {
    title: "#7 - Do this thing",
    text: "Delete a scene or link by selecting it and hitting delete or pressing the delete button."
  },
  {
    title: "#8 - Do this thing",
    text: "Once your story is complete, press “Save” to keep your progress."
  },
  {
    title: "#9 - Do this thing",
    text: "Press Play to read your story and get a shareable link."
  }
]

class TutorialPage extends React.Component<TPProps, TPState> {
  constructor(props: TPProps) {
    super(props)

    this.state = {
      index: 0
    }
  }

  render() {
    return (
      <>
        <div className="TutorialHeader">
          <h2>{this.getTitle()}</h2>
        </div>
        <div className="TutorialContent">
          <p>
            {this.getText()}
          </p>

          { this.currentPage().intro ? this.renderSkipLink() : null }
          { !this.hasNext() ? this.renderOkayLink() : null }

          <img src={this.getImage()} />
        </div>

        <div className="TutorialPagination">
          <button onClick={this.previous} disabled={!this.hasPrevious()}>
            previous
          </button>

          <div className="ProgressBar">
            {this.renderProgress()}
          </div>

          <button onClick={this.next} disabled={!this.hasNext()}>
            next
          </button>
        </div>
      </>
    )
  }

  private currentPage() {
    return pages[this.state.index]
  }

  private getTitle() {
    return this.currentPage().title
  }

  private getText() {
    return this.currentPage().text
  }

  private getImage() {
    return this.currentPage().image
  }

  private renderSkipLink() {
    return (
      <button onClick={this.props.onClose} className="LegacySlantButton">
        Skip
      </button>
    )
  }

  private renderProgress() {
    let bubbles = pages.map((page, index) => {
      if (page.intro) {
        return
      }

      let className = "bubble"
      if (this.state.index == index) {
        className += " active"
      }

      return (<div className={className} onClick={() => this.setPage(index)} />)
    })

    return bubbles
  }

  private setPage = (index: number) => {
    this.setState({
      index: index
    })
  }

  private renderOkayLink() {
    return (
      <button onClick={this.props.onClose} className="LegacySlantButton">
        Got it!
      </button>
    )
  }

  private hasPrevious() {
    // skip the intro page
    return this.state.index > 1
  }

  private hasNext() {
    return this.state.index < pages.length - 1
  }

  private previous = () => {
    if (this.hasPrevious()) {
      this.setState({index: this.state.index - 1})
    }
  }

  private next = () => {
    if (this.hasNext()) {
      this.setState({index: this.state.index + 1})
    }
  }
}

export default TutorialPage
