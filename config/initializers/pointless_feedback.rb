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
    'noah.over@viget.com'
  ]
  config.google_captcha_site_key   = "6Lcx6pQUAAAAANoXFts8_nsPSoNikCW6p80aCIL_"
  config.google_captcha_secret_key = "6Lcx6pQUAAAAALoO68Z-f5vxBehQZLkxZkQvwkGw"

  # Configure the words that will prevent an email from being sent if they are
  # contained in the description
  config.invalid_words = ['nymphomania', 'bisexual']

  # ==> URL Field
  # Configure URL field in form and email
  config.show_url_field = true
  config.url_label      = "Story URL"
end
