require "rails_helper"

RSpec.describe Thumbnail do
  it "requires a unique signature and uid" do
    described_class.create!(signature: "sig", uid: "uid-1")

    expect(described_class.new).not_to be_valid
    expect(described_class.new(signature: "sig", uid: "uid-2")).not_to be_valid
    expect(described_class.new(signature: "other", uid: "uid-1")).not_to be_valid
    expect(described_class.new(signature: "other", uid: "uid-2")).to be_valid
  end
end
