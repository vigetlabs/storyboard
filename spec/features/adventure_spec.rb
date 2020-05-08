require 'rails_helper'

describe "Adventures" do
  let!(:user)      { create(:user) }
  let!(:adventure) { create(:adventure, user: user) }
  context "when not logged in" do

    it "lets you create a story" do
      visit "/"
      click_on "Create a Story"
      expect(page).to have_content("What's your title?")
    end

    it "does not let you edit a user's story" do
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

  context "when logged in" do

    before do
      login_as(user, :scope => :user)
    end

    it "lets you view your stories" do
      visit "/mine"

      expect(page).to have_content(adventure.description)
    end

    it "lets you edit your story" do
      visit details_adventure_path(adventure)

      expect(page).to have_content("What's your title?")
      expect(page).to have_content("Story URL")
    end

    it "does not allow you to update a story with a blank title" do
      adventure.update_attributes(title: nil)

      expect(adventure.save).to eq(false)
    end

    it "flashes the missing validations on update" do
      visit details_adventure_path(adventure)
      fill_in "title", with: nil
      click_on "Update Story"

      expect(page).not_to have_current_path(edit_adventure_path(adventure))
      expect(page).to have_content("Title can't be blank")
    end
  end
end
