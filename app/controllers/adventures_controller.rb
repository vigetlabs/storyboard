class AdventuresController < ApplicationController
  before_action :set_adventure, only: [:show, :edit, :update, :destroy, :details, :source, :offline, :authenticate, :duplicate]
  before_action :check_authentication, only: [:show]

  def index
  end

  def mine
    if !current_user
      flash[:alert] = "You must be logged in to view your Adventures"
      return redirect_to root_url
    end

    @adventures = current_user.adventures.where(archived: false)
  end

  def archived
    if !current_user
      flash[:alert] = "You must be logged in to view your archived Adventures"
      return redirect_to root_url
    end

    @adventures = current_user.adventures.where(archived: true)
  end

  def show
    if @adventure.archived && @adventure.user != current_user
      flash[:alert] = "You can't view that Adventure"
      return redirect_to root_url
    end

    render layout: 'player'
  end

  def authenticate
    value, type = get_type_and_value

    if @adventure.authenticate(value, type)
      session["#{@adventure.slug}-#{type}"] = true
      redirect_to adventure_path
    else
      flash[:alert] = "Access Restricted Due to #{type}"
      render :authenticate_player_password if type == "Password"
      render :authenticate_player_age if type == "Age"
    end
  end

  def new
    if !current_user
      flash[:alert] = "You must be logged in to create a story."
      return redirect_to new_user_session_path
    end

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
    if @adventure.archived && @adventure.user != current_user
      flash[:alert] = "You can't view the source of that Adventure"
      return redirect_to root_url
    end

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
    Rails.logger.info @adventure.content
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

  def duplicate
    if !@adventure.editable_by?(current_user)
      flash[:alert] = "You can't modify that Adventure"
      return redirect_to root_url
    end

    duplicated_adventure = @adventure.dup
    duplicated_adventure.title = "Copy of #{@adventure.title}"
    duplicated_adventure.save

    redirect_to [:edit, duplicated_adventure]
  end

  private

  def set_adventure
    @adventure = Adventure.find_by_slug!(params[:id])
  end

  def custom_theme
    @adventure.custom_theme
  end
  helper_method :custom_theme

  def adventure_params
    params.require(:adventure).permit(
      :title,
      :slug,
      :description,
      :public,
      :theme,
      :password,
      :has_password,
      :age_limit,
      :has_age_limit,
      :back_button,
      :show_source,
      :character_card,
      :archived,
      :custom_theme_id
    )
  end

  def check_authentication

    if !@adventure.editable_by?(current_user) && (@adventure.has_password? && !session["#{@adventure.slug}-Password"])
      render :authenticate_player_password
    elsif !@adventure.editable_by?(current_user) && (@adventure.has_age_limit? && !session["#{@adventure.slug}-Age"])
      render :authenticate_player_age
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

  def get_type_and_value
    if params[:adventure][:password]
      [params[:adventure][:password], "Password"]
    elsif params[:adventure][:age_limit]
      [params[:adventure][:age_limit], "Age"]
    end
  end
end
