PointlessFeedback.setup do |config|
  # ==> Feedback Configuration
  # Configure the topics for the user to choose from on the feedback form
  config.message_topics = ['Error on page', 'Feature request', 'Praise', 'Other']

  # ==> Email Configuration
  # Configure feedback email properties (disabled by default)
  # Variables needed for emailing feedback
  config.email_feedback            = true
  config.from_email                = 'feedback@pointlesscorp.com'
  config.to_emails                 = [
    'eli.fatsi@viget.com',
    'albert.wavering@viget.com',
    'joe.jackson@viget.com',
    'nate.hunzaker@viget.com'
  ]
  config.google_captcha_site_key   = "6LfCTXoUAAAAACO82VMQ8yfMsF4nEsNEzCaz0kbT"
  config.google_captcha_secret_key = "6LfCTXoUAAAAAIssC_3HPJKA1TEzGb0jJtUFn8Fu"
end
