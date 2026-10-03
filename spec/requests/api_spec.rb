require "rails_helper"

RSpec.describe "API" do
  let(:user) { create(:user) }
  let(:adventure) { create(:adventure, user: user, public: false) }

  describe "GET /api/:id" do
    it "returns adventure content" do
      get "/api/#{adventure.slug}"

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to include("success" => true)
      expect(response.parsed_body["content"]).to eq(adventure.content)
    end
  end

  describe "POST /api/:id" do
    it "rejects an unauthorized editor" do
      post "/api/#{adventure.slug}", params: { adventure: { content: { "x" => 1 } } }

      expect(response.parsed_body).to eq("success" => false, "error" => "unauthorized")
    end

    it "updates content for an authorized editor" do
      sign_in user

      post "/api/#{adventure.slug}", params: { adventure: { content: { "intro" => "updated" } } }

      expect(response.parsed_body).to eq("success" => true)
      expect(adventure.reload.content).to include("intro" => "updated")
    end

    it "returns validation errors when the update fails" do
      sign_in user
      adventure
      allow_any_instance_of(Adventure).to receive(:update).and_return(false)
      allow_any_instance_of(Adventure).to receive_message_chain(:errors, :messages).and_return(title: ["blank"])

      post "/api/#{adventure.slug}", params: { adventure: { content: { "intro" => "updated" } } }

      expect(response.parsed_body).to eq("success" => false, "error" => { "title" => ["blank"] })
    end
  end

  describe "photos" do
    it "stores an image url" do
      photo = Photo.new(meta_id: "meta-1")
      allow(Photo).to receive(:find_or_initialize_by).with(meta_id: "meta-1").and_return(photo)
      allow(photo).to receive(:update).with(image_url: "https://example.com/a.png").and_return(true)
      allow(photo).to receive_message_chain(:image, :url).and_return("/media/a.png")

      post "/api/photos/meta-1", params: { image: "https://example.com/a.png" }

      expect(response.parsed_body).to eq("success" => true, "url" => "/media/a.png")
    end

    it "fails without an image" do
      post "/api/photos/meta-2"

      expect(response.parsed_body).to eq("success" => false)
    end

    it "clears an image" do
      Photo.create!(meta_id: "meta-3")

      delete "/api/photos/meta-3"

      expect(response.parsed_body).to eq("success" => true)
    end
  end

  describe "audio tracks" do
    it "stores an audio url" do
      track = AudioTrack.new(meta_id: "audio-1")
      allow(AudioTrack).to receive(:find_or_initialize_by).with(meta_id: "audio-1").and_return(track)
      allow(track).to receive(:update).with(audio_track_url: "https://example.com/a.mp3").and_return(true)
      allow(track).to receive_message_chain(:audio_track, :url).and_return("/media/a.mp3")

      post "/api/audio-tracks/audio-1", params: { audio_track_url: "https://example.com/a.mp3" }

      expect(response.parsed_body).to eq("success" => true, "url" => "/media/a.mp3")
    end

    it "fails without an audio url" do
      post "/api/audio-tracks/audio-2"

      expect(response.parsed_body).to eq("success" => false)
    end

    it "clears an audio track" do
      AudioTrack.create!(meta_id: "audio-3")

      delete "/api/audio-tracks/audio-3"

      expect(response.parsed_body).to eq("success" => true)
    end
  end
end
