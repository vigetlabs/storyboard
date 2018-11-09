class AdventuresController < ApplicationController
  before_action :set_adventure, only: [:show, :edit, :update, :destroy]

  def index
    @adventures = Adventure.where(private: false)

    if params[:q]
      @adventures = @adventures.where("title LIKE ?", "%#{params[:q]}%")
    end
  end

  def mine
    if !current_user
      flash[:alert] = "You must be logged in to view your Adventures"
      return redirect_to root_url
    end

    @adventures = current_user.adventures
  end

  def show
  end

  def new
    @adventure = Adventure.new
  end

  def edit
    if @adventure.user && @adventure.user != current_user
      flash[:alert] = "You can't modify that Adventure"
      redirect_to root_url
    end
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
      render :edit
    end
  end

  def destroy
    @adventure.destroy
    redirect_to adventures_url, notice: 'Adventure was successfully destroyed.'
  end

  private

  def set_adventure
    @adventure = Adventure.find_by_slug(params[:id])
  end

  def adventure_params
    params.require(:adventure).permit(:title, :description, :private)
  end
end
