class SurveyMailerPreview < ActionMailer::Preview
  def initial_feedback
    SurveyMailer.initial_feedback(User.first)
  end
end
