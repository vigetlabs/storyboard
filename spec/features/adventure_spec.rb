require 'rails_helper'

describe "Adventures" do
  let!(:user)               { create(:user) }
  let!(:adventure)          { create(:adventure, user: user) }
  let!(:adventure_password) { create(:adventure, user: user, slug: "test-story-password") }

  context "when logging in/creating an account" do
    it "does not allow you to log in with incorrect credentials" do
      visit user_session_path

      fill_in "Email", with: user.email
      fill_in "Password", with: "not password"
      click_on "Log in"

      expect(page).to have_content("Invalid Email or password.")
    end

    it "allows you to log in with the correct credentials" do
      visit user_session_path
      fill_in "Email", with: user.email
      fill_in "Password", with: user.password
      click_on "Log in"

      expect(page).to have_content("Signed in successfully")
      expect(page).to have_current_path(my_adventures_path)
    end

    it "rejects a new account with mismatched passwords" do
      visit new_user_registration_path
      fill_in "user_email", with: "email@example.com"
      fill_in "user_password", with: "abc123"
      fill_in "user_password_confirmation", with: "not the same"
      click_on "Sign up"

      expect(page).to have_content("Password confirmation doesn't match Password")
    end

    it "allows you to create an account" do
      visit new_user_registration_path
      fill_in "user_email", with: "email@example.com"
      fill_in "user_password", with: "abc123"
      fill_in "user_password_confirmation", with: "abc123"
      click_on "Sign up"

      expect(page).to have_content("You have signed up successfully")
    end
  end

  context "when updating an account's details" do
    before do
      login_as(user, :scope => :user)
    end

    it "does not let you change your password if you don't know your current password" do
      visit edit_user_registration_path
      fill_in "user_password", with: "newpass"
      fill_in "user_password_confirmation", with: "newpass"
      fill_in "user_current_password", with: "notthepassword"
      click_on "Update"

      expect(page).to have_content("Current password is invalid")
    end

    it "does not let you change your password if password confirmation doesn't match" do
      visit edit_user_registration_path
      fill_in "user_password", with: "newpass"
      fill_in "user_password_confirmation", with: "newpasswrong"
      fill_in "user_current_password", with: "password"
      click_on "Update"

      expect(page).to have_content("Password confirmation doesn't match Password")
    end

    it "allows you to change your password if everything is correct" do
      visit edit_user_registration_path
      fill_in "user_password", with: "newpass"
      fill_in "user_password_confirmation", with: "newpass"
      fill_in "user_current_password", with: "password"
      click_on "Update"

      expect(page).to have_content("Your account has been updated successfully.")
      expect(page).to have_current_path("/")
    end

  end

  context "when not logged in" do
    before do
      adventure_password.update_attributes(has_password: true, password: "password")
    end

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

    it "lets you access a public story", js: true do
      visit adventure_path(adventure)

      expect(page).to have_current_path(adventure_path(adventure))
      expect(page).to have_content("Test Story")
      expect(page).to have_content("begin")
    end

    it "requires a password on a private story", js: true do
      visit adventure_path(adventure_password)

      expect(page).to have_content("Enter password to access this story")
    end

    it "does not allow you to view a story with the incorrect password", js: true do
      visit adventure_path(adventure_password)
      fill_in "password", with: "not the password"
      click_on "Access Story"

      expect(page).to have_content("Enter password to access this story")
      expect(page).to have_content("Incorrect Password")
    end

    it "allows you to view a password protected story with the correct password", js: true do
      visit adventure_path(adventure_password)
      fill_in "password", with: "password"
      click_on "Access Story"

      expect(page).to have_content("Test Story")
      expect(page).to have_content("begin")
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

    it "allows a creator to view a password protected story without entering password", js: true do
      visit adventure_path(adventure_password)

      expect(page).to have_content("Test Story")
      expect(page).to have_content("begin")
      expect(page).to have_content("EDIT")
    end
  end
end
