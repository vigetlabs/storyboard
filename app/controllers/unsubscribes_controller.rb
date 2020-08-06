class UnsubscribesController < ApplicationController
  def new
  end

  def create
    if unsubscribe_email.present?
      if user = User.find_by(email: unsubscribe_email)
        user.update(can_be_emailed: false)
      end

      render :success
    else
      render :new
    end
  end

  private

  def unsubscribe_email
    params[:unsubscribe][:email]
  end
  helper_method :unsubscribe_email
end
