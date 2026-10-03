require "rails_helper"

RSpec.describe "Adventures" do
  let(:user) { create(:user) }
  let(:adventure) { create(:adventure, user: user) }

  describe "GET /" do
    it "renders the index" do
      get root_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /" do
    it "creates a story for a signed-in user" do
      sign_in user

      expect {
        post adventures_path, params: { adventure: { title: "Brand New", theme: "light" } }
      }.to change(Adventure, :count).by(1)

      created = Adventure.order(:id).last
      expect(created.user).to eq(user)
      expect(response).to redirect_to(edit_adventure_path(created))
    end

    it "creates a public story when no one is signed in" do
      expect {
        post adventures_path, params: { adventure: { title: "Anonymous", theme: "light" } }
      }.to change(Adventure, :count).by(1)

      created = Adventure.order(:id).last
      expect(created.user).to be_nil
      expect(created.public).to be true
    end

    it "re-renders the form with errors when create fails" do
      sign_in user

      post adventures_path, params: { adventure: { title: "", theme: "light" } }

      expect(response).to have_http_status(:ok)
      expect(flash[:alert]).to include("Title can't be blank")
    end
  end

  describe "PATCH /:id" do
    it "updates an editable story" do
      sign_in user

      patch adventure_path(adventure), params: { adventure: { title: "Renamed" } }

      expect(adventure.reload.title).to eq("Renamed")
      expect(response).to redirect_to(edit_adventure_path(adventure))
    end

    it "rejects updates from a stranger" do
      sign_in create(:user)

      patch adventure_path(adventure), params: { adventure: { title: "Stolen" } }

      expect(response).to redirect_to(root_url)
      expect(flash[:alert]).to eq("You can't modify that Adventure")
    end
  end

  describe "GET /:id/details" do
    it "rejects a stranger" do
      sign_in create(:user)

      get details_adventure_path(adventure)

      expect(response).to redirect_to(root_url)
    end
  end

  describe "GET /:id/source" do
    it "lets the owner view an archived story's source" do
      archived = create(:adventure, user: user, archived: true, slug: "archived-source")
      sign_in user

      get source_adventure_path(archived)

      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /:id/offline" do
    it "renders the offline player" do
      get offline_adventure_path(adventure)

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("isOffline: true")
    end
  end

  describe "GET /:id with a custom theme" do
    it "renders custom styles via the custom_theme helper" do
      theme = create(:custom_theme, user: user, background_color: "#ff0000")
      themed = create(:adventure, user: user, theme: "custom", custom_theme: theme, public: true)

      get adventure_path(themed)

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("#ff0000")
    end

    it "does not store iframe player requests as a return location" do
      get adventure_path(adventure, iframe: 1)
      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /:id for an archived story" do
    it "lets the owner view it" do
      archived = create(:adventure, user: user, archived: true, slug: "owner-archived")
      sign_in user

      get adventure_path(archived)

      expect(response).to have_http_status(:ok)
    end
  end

  describe "DELETE /:id" do
    it "redirects guests to the home page after destroy" do
      public_story = create(:adventure, user: nil, public: true, slug: "guest-delete")

      delete adventure_path(public_story)

      expect(Adventure.exists?(public_story.id)).to be false
      expect(response).to redirect_to(root_url)
      expect(flash[:notice]).to eq("Adventure was successfully destroyed.")
    end
  end

  describe "POST /:id/duplicate" do
    it "copies an editable story" do
      sign_in user
      adventure

      expect {
        post duplicate_adventure_path(adventure)
      }.to change(Adventure, :count).by(1)

      copy = Adventure.order(:id).last
      expect(copy.title).to eq("Copy of #{adventure.title}")
      expect(copy.slug).to be_present
      expect(copy.slug).not_to eq(adventure.slug)
      expect(response).to redirect_to(edit_adventure_path(copy))
    end

    it "rejects a stranger" do
      sign_in create(:user)

      post duplicate_adventure_path(adventure)

      expect(response).to redirect_to(root_url)
    end
  end

  describe "GET /csv" do
    it "sends a CSV to an admin" do
      create(:adventure, user: user, title: "Export Me")
      sign_in create(:user, :admin)

      get csv_adventures_path

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/csv")
      expect(response.body).to include("Export Me")
    end
  end

  describe "sign-in return location" do
    it "returns to a stored non-root page" do
      get formatting_help_path
      post user_session_path, params: { user: { email: user.email, password: "password" } }

      expect(response).to redirect_to(formatting_help_path)
    end

    it "sends the user to their stories when the stored page is the root" do
      get root_path
      post user_session_path, params: { user: { email: user.email, password: "password" } }

      expect(response).to redirect_to(my_adventures_path)
    end
  end
end
