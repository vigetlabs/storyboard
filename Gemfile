source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '4.0.7'

gem 'awesome_print'
gem 'bcrypt'
gem 'cgi'
gem 'csv'
gem 'bootsnap', '>= 1.1.0', require: false
gem 'devise', '~> 5.0'
gem 'json', '~> 2.13'
gem 'pg', '>= 0.18', '< 2.0'
gem 'puma', '~> 6.6'
gem 'rails', '~> 8.1.4'
gem 'sprockets-rails'
gem 'uglifier'
gem 'vite_rails'
gem 'sentry-ruby'
gem 'sentry-rails'
gem 'pointless_feedback', '~> 4.1.5'
gem 'stat_board', '~> 1.1.0'
gem 'administrate', '~> 1.0.0'
gem "dragonfly"
gem "dragonfly-s3_data_store"

group :development, :test do
  gem 'pry-rails'
  gem 'rspec-rails', '~> 7.1'
end

group :development do
  gem 'listen', '>= 3.0.5'
  gem 'web-console', '>= 4.2.0'

  # Capistrano 2 via viget-deployment. Isolated from runtime/test so it
  # cannot break boot. Keyword-arg breakage on Ruby 3; replace before
  # using `cap production deploy` from this Ruby.
  gem 'viget-deployment', '2.0.0', github: 'vigetlabs/viget-deployment', require: false
  gem 'capistrano-db-tasks', {
    github: 'efatsi/capistrano-db-tasks',
    require: false,
    branch: '0.2.1'
  }
end

group :test do
  gem 'capybara', '>= 2.15'
  gem "factory_bot_rails"
  gem 'factory_bot', '6.4.4'
  gem 'selenium-webdriver'
  gem 'simplecov', require: false
end
