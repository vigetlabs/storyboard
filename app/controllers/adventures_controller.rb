class AdventuresController < ApplicationController
  before_action :set_adventure, only: [:show, :edit, :update, :destroy, :details, :source, :offline, :authenticate]
  before_action :check_authentication, only: [:show]

  def index
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

  def authenticate
    if @adventure.authenticate(params[:adventure][:password])
      session[@adventure.title] = true
      redirect_to adventure_path
    else
      flash[:alert] = "Incorrect Password"
      render :authenticate_player
    end
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

  def source
    render 'edit',
      layout: 'editor',
      locals: { view_only: true }
  end

  def offline
    render layout: 'player'
  end


  def create
    @adventure = Adventure.new(adventure_params)
    if current_user
      @adventure.user = current_user
    else
      @adventure.public = true
    end

    if @adventure.save
      redirect_to [:edit, @adventure]
    else
      display_errors(:create)
      render :new
    end
  end

  def update
    if !@adventure.editable_by?(current_user)
      flash[:alert] = "You can't modify that Adventure"
      return redirect_to root_url
    end

    if @adventure.update(adventure_params)
      redirect_to [:edit, @adventure]
    else
      display_errors(:update)
      render :details
    end
  end

  def details
    if !@adventure.editable_by?(current_user)
      flash[:alert] = "You can't modify that Adventure"
      return redirect_to root_url
    end
  end

  def destroy
    @adventure.destroy
    if current_user
      redirect_to my_adventures_url, notice: 'Adventure was successfully destroyed.'
    else
      redirect_to root_url, notice: 'Adventure was successfully destroyed.'
    end
  end

  def csv
    if current_user.try(:is_admin?)
      send_data(AdventureExport.export, filename: "storyboard_adventures_#{Date.current.strftime("%x").gsub("/", "-")}.csv")
    end
  end

  private

  def set_adventure
    @adventure = Adventure.find_by_slug!(params[:id])
  end

  def adventure_params
    params.require(:adventure).permit(
      :title,
      :slug,
      :description,
      :public,
      :theme,
      :password,
      :has_password
    )
  end

  def check_authentication
    if @adventure.has_password? && !session[@adventure.title]
      render :authenticate_player
    end
  end

  def display_errors(method)
    # the slug validation technically "runs" on create, even though it is not a field
    if method == :create
      @adventure.errors.delete(:slug)
    end
    if @adventure.errors.any?
      flash[:alert] = @adventure.errors.full_messages.join(", ")
    end
  end
end
