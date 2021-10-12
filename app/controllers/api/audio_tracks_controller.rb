class Api::AudioTracksController < ApplicationController
  skip_before_action :verify_authenticity_token

  def update
    if params[:audio_track_url] && audio_track.update(audio_track_url: params[:audio_track_url])
      return render json: {success: true, url: audio_track.audio_track.url}
    else
      return render json: {success: false}
    end
  end

  def remove
    audio_track.update(audio_track: nil)
    return render json: {success: true}
  end

  private

  def audio_track
    @audio_track ||= AudioTrack.find_or_initialize_by(meta_id: params[:meta_id])
  end
end
