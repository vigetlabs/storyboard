require "rails_helper"

RSpec.describe User do
  describe "#is_admin?" do
    it "is true for the configured Viget admin addresses" do
      expect(described_class.new(email: "noah.over@viget.com").is_admin?).to be true
      expect(described_class.new(email: "kelly.kenny@viget.com").is_admin?).to be true
    end

    it "is false for everyone else" do
      expect(described_class.new(email: "other@example.com").is_admin?).to be false
    end
  end
end
