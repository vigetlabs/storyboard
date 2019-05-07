class Api::AdventuresController < ApplicationController
  skip_before_action :verify_authenticity_token

  def show
    return render json: {success: true, content: adventure.content}
  end

  def update
    if !adventure.editable_by?(current_user)
      return render json: {success: false, error: "unauthorized"}
    end

    if adventure.update(adventure_params)
      render json: {success: true}
    else
      render json: {success: false, error: adventure.errors.messages}
    end
  end

  private

  def adventure
    @adventure ||= Adventure.find_by_slug!(params[:id])
  end

  def adventure_params
    {
      content: params.require(:adventure).permit![:content]
    }
  end
end
