require "rails_helper"

RSpec.describe Photo do
  it "persists a record that can hold a Dragonfly image" do
    photo = described_class.create!(meta_id: "photo-1")

    expect(photo).to be_persisted
    expect(photo.image).to be_nil
  end
end
