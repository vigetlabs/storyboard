require "rails_helper"

RSpec.describe AdventureExport do
  it "exports adventures as CSV with featured and ownership columns" do
    user = create(:user, email: "owner@example.com")
    create(:adventure, user: user, title: "Owned", featured: "Fiction", public: true)
    create(:adventure, user: nil, title: "Unowned", featured: nil, public: false, slug: "unowned")

    csv = described_class.export

    expect(csv).to include("ID,Title,URL,Size,Description,Theme,Featured,Public,User,Created,Updated")
    expect(csv).to include("Owned")
    expect(csv).to include("True")
    expect(csv).to include("owner@example.com")
    expect(csv).to include("Unowned")
    expect(csv).to include("False")
    expect(csv).to include("https://storyboard.viget.com/unowned")
  end
end
