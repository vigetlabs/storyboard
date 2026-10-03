require "rails_helper"

RSpec.describe CustomTheme do
  it "stringifies and parameterizes from title and slug" do
    theme = build(:custom_theme, title: "Sunset", slug: "sunset")

    expect(theme.to_s).to eq("Sunset")
    expect(theme.to_param).to eq("sunset")
  end

  it "requires a title" do
    expect(build(:custom_theme, title: nil)).not_to be_valid
  end

  it "generates a unique slug from the title" do
    user = create(:user)
    create(:custom_theme, user: user, title: "Same Name")
    second = create(:custom_theme, user: user, title: "Same Name")

    expect(second.slug).to eq("same-name-2")
  end
end
