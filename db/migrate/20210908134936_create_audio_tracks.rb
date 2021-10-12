class CreateAudioTracks < ActiveRecord::Migration[5.2]
  def change
    create_table :audio_tracks do |t|
      t.string :meta_id
      t.string :audio_track_uid
    end

    add_index :audio_tracks, :meta_id, unique: true
  end
end
