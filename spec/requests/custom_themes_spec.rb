require "rails_helper"

RSpec.describe "Custom themes" do
  let(:user) { create(:user) }
  let(:theme) { create(:custom_theme, user: user, title: "Mine") }

  describe "GET /custom_themes" do
    it "requires a signed-in user" do
      get custom_themes_path

      expect(response).to redirect_to(new_user_session_path)
      expect(flash[:alert]).to eq("You must be logged in to view your custom themes.")
    end

    it "lists the current user's themes" do
      theme
      sign_in user

      get custom_themes_path

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("Mine")
    end
  end

  describe "GET /custom_themes/new" do
    it "requires a signed-in user" do
      get new_custom_theme_path

      expect(response).to redirect_to(new_user_session_path)
    end

    it "renders the form" do
      sign_in user

      get new_custom_theme_path

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("Create a")
    end
  end

  describe "POST /custom_themes" do
    it "requires a signed-in user" do
      post custom_themes_path, params: { custom_theme: { title: "Nope" } }

      expect(response).to redirect_to(new_user_session_path)
    end

    it "creates a theme" do
      sign_in user

      expect {
        post custom_themes_path, params: { custom_theme: { title: "Forest" } }
      }.to change(CustomTheme, :count).by(1)

      created = CustomTheme.order(:id).last
      expect(created.user).to eq(user)
      expect(response).to redirect_to(custom_theme_path(created))
    end

    it "re-renders the form when create fails" do
      sign_in user

      post custom_themes_path, params: { custom_theme: { title: "" } }

      expect(response).to have_http_status(:ok)
      expect(flash[:alert]).to include("Title can't be blank")
    end
  end

  describe "GET /custom_themes/:id" do
    before { create(:adventure, slug: "lemonade-stand", title: "Lemonade Stand", user: user) }

    it "shows a preview for the owner" do
      sign_in user

      get custom_theme_path(theme)

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("Mine")
    end

    it "rejects a stranger" do
      sign_in create(:user)

      get custom_theme_path(theme)

      expect(response).to redirect_to(root_url)
      expect(flash[:alert]).to eq("You can't view that custom theme.")
    end
  end

  describe "GET /custom_themes/:id/edit" do
    it "renders the form for the owner" do
      sign_in user

      get edit_custom_theme_path(theme)

      expect(response).to have_http_status(:ok)
    end

    it "rejects a stranger" do
      sign_in create(:user)

      get edit_custom_theme_path(theme)

      expect(response).to redirect_to(root_url)
      expect(flash[:alert]).to eq("You can't modify that custom theme.")
    end
  end

  describe "PATCH /custom_themes/:id" do
    it "updates the owner's theme" do
      sign_in user

      patch custom_theme_path(theme), params: { custom_theme: { title: "Updated" } }

      expect(theme.reload.title).to eq("Updated")
      expect(response).to redirect_to(custom_theme_path(theme))
    end

    it "re-renders the form when update fails" do
      sign_in user

      patch custom_theme_path(theme), params: { custom_theme: { title: "" } }

      expect(response).to have_http_status(:ok)
      expect(flash[:alert]).to include("Title can't be blank")
    end

    it "rejects a stranger" do
      sign_in create(:user)

      patch custom_theme_path(theme), params: { custom_theme: { title: "Stolen" } }

      expect(response).to redirect_to(root_url)
    end
  end
end
