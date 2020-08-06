class SurveyMailer < ApplicationMailer
  default from: "Storyboard Team <no-reply@storyboard.viget.com>"

  def initial_feedback(user)
    @user = user

    mail(to: user.email, subject: "Storyboard User Survey")
  end
end
