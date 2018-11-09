class AdventuresController < ApplicationController
  before_action :set_story, only: [:show, :edit, :update, :destroy]

  def index
    @adventures = Adventure.where(private: false)
  end

  def mine
    redirect_to root_url unless current_user

    @adventures = current_user.adventures
  end

  def show
  end

  def new
    @adventure = Adventure.new
  end

  def edit
  end

  def create
    @adventure = Adventure.new(story_params)
    @adventure.user = current_user if current_user

    if @adventure.save
      redirect_to [:edit, @adventure]
    else
      render :new
    end
  end

  def update
    if @adventure.update(story_params)
      redirect_to [:edit, @adventure]
    else
      render :edit
    end
  end

  def destroy
    @adventure.destroy
    redirect_to adventures_url, notice: 'Adventure was successfully destroyed.'
  end

  private

  def set_story
    @adventure = Adventure.find_by_slug(params[:id])
  end

  def story_params
    params.require(:adventure).permit(:title, :description, :private)
  end
end
