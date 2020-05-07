module AccountHelper

  def login_with(email, password = "secret")
    visit "/"

    click_on("Log In")
    fill_in "email", :with => email
    fill_in "password", :with => password

    click_on('login-button')

    visit "/"
  end

end
