class StoriesController < ApplicationController
  before_action :set_story, only: [:show, :edit, :update, :destroy]

  def index
    @stories = Story.all
  end

  def show
  end

  def new
    @story = Story.new
  end

  def edit
  end

  def create
    @story = Story.new(story_params)

    if @story.save
      redirect_to [:edit, @story]
    else
      render :new
    end
  end

  def update
    if @story.update(story_params)
      redirect_to [:edit, @story]
    else
      render :edit
    end
  end

  def destroy
    @story.destroy
    redirect_to stories_url, notice: 'Story was successfully destroyed.'
  end

  private

  def set_story
    @story = Story.find_by_slug(params[:id])
  end

  def story_params
    params.require(:story).permit(:title, :description)
  end
end
