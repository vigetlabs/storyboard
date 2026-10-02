source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.7.8'

gem 'awesome_print'
gem 'bcrypt'
gem 'bootsnap', '>= 1.1.0', require: false
gem 'devise', '~> 4.9'
gem 'pg', '>= 0.18', '< 2.0'
gem 'puma', '~> 4.3'
gem 'rack', '~> 2.2'
gem 'rails', '~> 7.1.0'
gem 'sprockets-rails'
gem 'uglifier'
gem 'vite_rails'
gem 'sentry-ruby'
gem 'sentry-rails'
gem 'pointless_feedback', '~> 4.1.5'
gem 'stat_board', '~> 1.1.0'
gem 'administrate', '~> 0.13.0'
gem "dragonfly"
gem "dragonfly-s3_data_store"

group :development, :test do
  gem 'pry-rails'
  gem 'rspec-rails', '~> 6.1'
end

group :development do
  gem 'listen', '>= 3.0.5'
  gem 'web-console', '>= 4.2.0'

  # Capistrano 2 via viget-deployment. Isolated from runtime/test so it
  # cannot break boot. Replace before the Ruby 3 upgrade (keyword-arg
  # breakage); `bundle exec cap production deploy` still works on 2.7.
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
