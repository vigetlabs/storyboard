require 'rails_helper'

describe "Adventures" do
  let!(:adventure) { FactoryBot.create(:adventure) }
  context "when not logged in" do

    it "lets you create a story" do
      visit "/"
      click_on "Create a Story"
      expect(page).to have_content("What's your title?")
    end

    it "does not let you edit someone a user's story" do
      visit edit_adventure_path(adventure)

      expect(page).to have_current_path("/")
      expect(page).to have_content("You can't modify that Adventure")
    end

    it "lets you access a public story" do
      visit adventure_path(adventure)

      expect(page).to have_current_path(adventure_path(adventure))
      # Should change this to the story's title once I figure out how to have content in factory bot stories
      expect(page).to have_content("Source")
      end
  end


end
