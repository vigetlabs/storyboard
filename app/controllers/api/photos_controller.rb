class Api::PhotosController < ApplicationController
  skip_before_action :verify_authenticity_token

  def update
    if params[:image] && photo.update(image_url: params[:image])
      return render json: {success: true, url: photo.image.url}
    else
      return render json: {success: false}
    end
  end

  def remove
    photo.update(image: nil)
    return render json: {success: true}
  end

  private

  def photo
    @photo ||= Photo.find_or_initialize_by(meta_id: params[:meta_id])
  end
end
