module Admin
  class ApplicationController < Administrate::ApplicationController
    before_action :authenticate_admin

    def authenticate_admin
      if current_user && current_user.is_admin?
        # you shall pass
      else
        # go away
        redirect_to root_url
      end
    end
  end
end
