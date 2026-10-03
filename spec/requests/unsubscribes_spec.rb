require "rails_helper"

RSpec.describe "Unsubscribes" do
  describe "GET /unsubscribe" do
    it "renders the form" do
      get new_unsubscribe_path

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("Unsubscribe")
    end
  end

  describe "POST /unsubscribes" do
    it "opts an existing user out of email" do
      user = create(:user, can_be_emailed: true)

      post unsubscribes_path, params: { unsubscribe: { email: user.email } }

      expect(user.reload.can_be_emailed).to be false
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("We've removed #{user.email}")
    end

    it "still shows success when the email is unknown" do
      post unsubscribes_path, params: { unsubscribe: { email: "missing@example.com" } }

      expect(response).to have_http_status(:ok)
    end

    it "re-renders the form when the email is blank" do
      post unsubscribes_path, params: { unsubscribe: { email: "" } }

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("email")
    end
  end
end
