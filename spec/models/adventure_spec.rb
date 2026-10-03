require "rails_helper"

RSpec.describe Adventure do
  let(:user) { create(:user) }

  describe "#to_s and #to_param" do
    it "uses the title and slug" do
      adventure = build(:adventure, title: "Hello", slug: "hello")

      expect(adventure.to_s).to eq("Hello")
      expect(adventure.to_param).to eq("hello")
    end
  end

  describe "#authenticate" do
    it "accepts a matching password" do
      adventure = build(:adventure, has_password: true, password: "secret")

      expect(adventure.authenticate("secret", "Password")).to be true
      expect(adventure.authenticate("nope", "Password")).to be false
    end

    it "accepts an age at or above the limit" do
      adventure = build(:adventure, has_age_limit: true, age_limit: 18)

      expect(adventure.authenticate("18", "Age")).to be true
      expect(adventure.authenticate("17", "Age")).to be false
    end

    it "returns nil for an unknown type" do
      expect(build(:adventure).authenticate("x", "Other")).to be_nil
    end
  end

  describe "#editable_by?" do
    it "allows anyone to edit a public story" do
      adventure = create(:adventure, user: user, public: true)

      expect(adventure.editable_by?(create(:user))).to be true
    end

    it "allows anyone to edit a story with no owner" do
      adventure = create(:adventure, user: nil, public: false, slug: "unowned")

      expect(adventure.editable_by?(create(:user))).to be true
    end

    it "allows the owner" do
      adventure = create(:adventure, user: user, public: false)

      expect(adventure.editable_by?(user)).to be true
    end

    it "allows an admin to edit someone else's private story" do
      adventure = create(:adventure, user: user, public: false)
      admin = create(:user, :admin)

      expect(adventure.editable_by?(admin)).to be true
    end

    it "rejects a stranger on a private owned story" do
      adventure = create(:adventure, user: user, public: false)

      expect(adventure.editable_by?(create(:user))).to be false
    end
  end

  describe "validations" do
    it "requires a custom theme when the theme is custom" do
      adventure = build(:adventure, theme: "custom", custom_theme: nil)

      expect(adventure).not_to be_valid
      expect(adventure.errors[:custom_theme]).to include("required when theme is set to 'Custom'")
    end

    it "accepts a custom theme when the theme is custom" do
      theme = create(:custom_theme, user: user)
      adventure = build(:adventure, user: user, theme: "custom", custom_theme: theme)

      expect(adventure).to be_valid
    end

    it "requires a password when password-protected" do
      adventure = build(:adventure, has_password: true, password: "")

      expect(adventure).not_to be_valid
    end

    it "requires an integer age limit when age-gated" do
      adventure = build(:adventure, has_age_limit: true, age_limit: nil)

      expect(adventure).not_to be_valid
    end
  end

  describe "slug generation" do
    it "assigns a unique parameterized slug from the title" do
      create(:adventure, title: "Shared Title", slug: nil)
      second = create(:adventure, title: "Shared Title", slug: nil)

      expect(second.slug).to eq("shared-title-2")
    end
  end
end
