require "rails_helper"

RSpec.describe "Static pages" do
  it "renders formatting help" do
    get formatting_help_path

    expect(response).to have_http_status(:ok)
  end

  it "renders the terms page" do
    get terms_path

    expect(response).to have_http_status(:ok)
  end
end
