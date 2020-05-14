source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.5.1'

gem 'awesome_print'
gem 'bcrypt'
gem 'bootsnap', '>= 1.1.0', require: false
gem 'devise'
gem 'pg', '>= 0.18', '< 2.0'
gem 'puma', '~> 3.12'
gem 'rails', '~> 5.2.1'
gem 'uglifier'
gem 'webpacker', '~> 4.0.7'
gem 'sentry-raven'
gem 'pointless_feedback', '~> 4.0.6'
gem 'stat_board', '~> 1.0.1'

gem 'capistrano-db-tasks', {
  :github  => 'efatsi/capistrano-db-tasks',
  :require => false,
  :branch  => '0.2.1'
}

group :development, :test do
  gem 'pry-rails'
  gem 'rspec-rails', '~> 4.0.0'
end

group :development do
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'viget-deployment', '2.0.0', github: 'vigetlabs/viget-deployment', require: false
  gem 'web-console', '>= 3.3.0'
end

group :test do
  gem 'capybara', '>= 2.15'
  gem 'chromedriver-helper'
  gem 'database_cleaner',   '~> 0.9.1'
  gem "factory_bot_rails"
  gem 'selenium-webdriver'
  gem 'simplecov', require: false
end
