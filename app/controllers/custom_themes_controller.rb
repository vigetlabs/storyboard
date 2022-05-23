class CustomThemesController < ApplicationController

  def index
    if !current_user
      flash[:alert] = "You must be logged in to view your custom themes."
      return redirect_to new_user_session_path
    end

    @custom_themes = current_user.custom_themes
  end

  def show
    if custom_theme.user != current_user
      flash[:alert] = "You can't view that custom theme."
      return redirect_to root_url
    end

    @adventure = Adventure.find_by_slug!('lemonade-stand')
    render layout: 'custom_theme_preview'
  end

  def new
    if !current_user
      flash[:alert] = "You must be logged in to create a custom theme."
      return redirect_to new_user_session_path
    end

    @custom_theme = CustomTheme.new
  end

  def create
    if !current_user
      flash[:alert] = "You must be logged in to create a custom theme."
      return redirect_to new_user_session_path
    end

    @custom_theme = CustomTheme.new(custom_theme_params)
    custom_theme.user = current_user

    if custom_theme.save
      redirect_to custom_theme
    else
      display_errors(:create)
      render :new
    end
  end

  def edit
    if custom_theme.user != current_user
      flash[:alert] = "You can't modify that custom theme."
      return redirect_to root_url
    end
  end

  def update
    if custom_theme.user != current_user
      flash[:alert] = "You can't modify that custom theme."
      return redirect_to root_url
    end

    if custom_theme.update(custom_theme_params)
      redirect_to custom_theme_path(custom_theme)
    else
      display_errors(:update)
      render :edit
    end
  end

  private

  def custom_theme
    @custom_theme ||= CustomTheme.find_by_slug!(params[:id])
  end
  helper_method :custom_theme

  def custom_theme_params
    params.require(:custom_theme).permit(
      :title,
      :background_color,
      :border_color,
      :intro_image,
      :scene_image,
      :end_image,
      :header_font_family,
      :header_font_color,
      :body_font_family,
      :body_font_color,
      :choice_font_family,
      :choice_font_color,
      :button_color,
      :button_font_family,
      :button_font_color
    )
  end

  def display_errors(method)
    # the slug validation technically "runs" on create, even though it is not a field
    if method == :create
      custom_theme.errors.delete(:slug)
    end
    if custom_theme.errors.any?
      flash[:alert] = custom_theme.errors.full_messages.join(", ")
    end
  end
end
