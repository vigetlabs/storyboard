require 'rails_helper'

describe "Adventures" do

  context "when not logged in" do

    it "lets you create a story" do
      visit "/"

      click_on "Create a Story"
      expect(page).to have_content("What's your title?")
    end
  end


end
