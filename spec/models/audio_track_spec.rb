require "rails_helper"

RSpec.describe AudioTrack do
  it "persists a record that can hold a Dragonfly audio file" do
    track = described_class.create!(meta_id: "audio-1")

    expect(track).to be_persisted
    expect(track.audio_track).to be_nil
  end
end
