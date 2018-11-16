import * as React from 'react'

interface TPProps {
  onClose: () => void
}

interface TPState {
  index: number
}

interface TutorialPageContent {
  title: string
  text: string[]
  intro?: boolean
  image?: string
}

const pages: TutorialPageContent[] = [
  {
    title: "Tutorial",
    text: ["Welcome to the Storyboard Editor! Here are a few tips to build your first story."],
    intro: true
  },
  {
    title: "#1 - Scenes",
    text: [
      "Scenes are the building blocks of your story. Scenes have names, content, and choices that you want a reader to take based on the scene.",
      "Add scenes with the button in the upper left, and edit their details in the sidebar that comes up when you click on a scene."],
    image: require('../images/tutorial/add-scene.gif')
  },
  {
    title: "#2 - Choices and Links",
    text: ["You can add choices in the sidebar within the scene sidebar. Once a choice has been added, you can then link that choice to another scene. This is how you build the flow of your story."],
    image: require('../images/tutorial/choices.gif')
  },
  {
    title: "#3 - Moving and Deleting Things",
    text: ["You can drag scenes around to help keep your storyboard organized. To delete a scene or a link, select the item and press the BACKSPACE key. If you'd like to move or delete multiple items at once, holding shift while selecting them."],
    image: require('../images/tutorial/delete.gif')
  },
  {
    title: "#4 - Navigation",
    text: ["You can use your mouse to drag the storyboard around, and you can zoom in and out using the +/- buttons or your scroll wheel."],
    image: require('../images/tutorial/navigation.gif')
  },
  {
    title: "#5 - Advance Choice Logic",
    text: [
      "You can attach modifiers to choices, and use those modifiers to hide and show choices in other scenes.",
      "For example, the “Teleport to Moon” choice might only be available to the reader if the “has teleporter” modifier was picked up in an earlier choice."
    ],
    image: require('../images/tutorial/advanced.gif')
  },
  {
    title: "#6 - Saving",
    text: ["Your story will be autosaved as you build it out. You can also manually do so by clicking “Save” to save your progress."],
    image: require('../images/tutorial/saving.gif')
  },
  {
    title: "#6 - Editing Story Details",
    text: ["You can change the title, description, and theme of your story by clicking the “Edit” button."],
  },
  {
    title: "#7 - Time to Play!",
    text: ["Press “Play” to read your story and get a shareable link."],
  },
  {
    title: "#8 - Disclaimer",
    text: [
      "This project was primarily built in a weekend, so you may encounter some quirks along the way. If something doesn't look right, saving your story and refreshing the page might do the trick. If saving isn't working, you can export your story as a last resort.",
      "And of course, feel free to drop us a note in our feedback form (available from the footer on the homepage).",
      "Thanks for making it all the way through the tutorial, hope you make a fun story!"
    ],
    image: require('../images/tutorial/pointless-corp.svg')
  },
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
          {this.getText()}

          { this.currentPage().intro ? this.renderSkipLink() : null }
          { !this.hasNext() ? this.renderOkayLink() : null }
          { this.hasImage() ? this.renderImage() : null }
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
    let paragraphs = []

    for (let i = 0; i < this.currentPage().text.length; i++) {
      let blob = this.currentPage().text[i];
      paragraphs.push(<p>{blob}</p>)
    }

    return paragraphs
  }

  private getImage() {
    return this.currentPage().image
  }

  private renderSkipLink() {
    return (
      <button onClick={this.props.onClose} className="LegacySlantButton">
        No Thanks
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

      return (
        <div
          key={index}
          className={className}
          onClick={() => this.setPage(index)}
        />
      )
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
        Let's Go!
      </button>
    )
  }

  private renderImage() {
    return (<div className="ImageContainer">
      <img src={this.getImage()} />
    </div>)
  }

  private hasImage() {
    return !!this.getImage()
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
