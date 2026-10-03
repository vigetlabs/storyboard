require "rails_helper"

RSpec.describe "Admin" do
  let(:admin) { create(:user, :admin) }
  let(:user) { create(:user) }
  let(:adventure) { create(:adventure, user: user, title: "Admin Story") }

  it "sends guests home" do
    get admin_root_path

    expect(response).to redirect_to(root_url)
  end

  it "sends non-admins home" do
    sign_in user

    get admin_root_path

    expect(response).to redirect_to(root_url)
  end

  it "lists adventures for an admin" do
    adventure
    sign_in admin

    get admin_adventures_path

    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Admin Story")
  end

  it "shows an adventure by slug" do
    sign_in admin

    get admin_adventure_path(adventure)

    expect(response).to have_http_status(:ok)
    expect(response.body).to include(adventure.title)
  end

  it "lists users using the dashboard display name" do
    user
    sign_in admin

    get admin_user_path(user)

    expect(response).to have_http_status(:ok)
    expect(response.body).to include(user.email)
  end
end
