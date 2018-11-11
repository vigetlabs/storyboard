class AdventuresController < ApplicationController
  before_action :set_adventure, only: [:show, :edit, :update, :destroy, :details]

  def index
    @featured_adventures = Adventure.where(featured: true).first(6)
  end

  def mine
    if !current_user
      flash[:alert] = "You must be logged in to view your Adventures"
      return redirect_to root_url
    end

    @adventures = current_user.adventures
  end

  def show
    render layout: 'player'
  end

  def new
    @adventure = Adventure.new
  end

  def edit
    if !@adventure.editable_by?(current_user)
      flash[:alert] = "You can't modify that Adventure"
      return redirect_to root_url
    end

    render layout: 'editor'
  end

  def create
    @adventure = Adventure.new(adventure_params)
    @adventure.user = current_user if current_user

    if @adventure.save
      redirect_to [:edit, @adventure]
    else
      render :new
    end
  end

  def update
    if @adventure.update(adventure_params)
      redirect_to [:edit, @adventure]
    else
      render :details
    end
  end

  def details
  end

  def destroy
    @adventure.destroy
    redirect_to my_adventures_url, notice: 'Adventure was successfully destroyed.'
  end

  private

  def set_adventure
    @adventure = Adventure.find_by_slug(params[:id])
  end

  def adventure_params
    params.require(:adventure).permit(
      :title,
      :slug,
      :description,
      :private,
      :theme
    )
  end
end
