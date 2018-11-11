class ApplicationController < ActionController::Base
  before_action :store_user_location!, if: :storable_location?

  private

  def after_sign_in_path_for(resource)
    # cache since successive method calls are nil
    stored = stored_location_for(resource)

    if stored != root_path
      stored
    else
      my_adventures_path
    end
  end

  def storable_location?
    request.get? && is_navigational_format? && !devise_controller? && !request.xhr? && !params[:iframe]
  end

  def store_user_location!
    store_location_for(:user, request.fullpath)
  end
end
