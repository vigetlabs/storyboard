# frozen_string_literal: true

require 'viget/deployment/rails'
require 'capistrano-db-tasks'

set :application, 'storyboard'
set :repository,  'git@github.com:vigetlabs/adventure-time.git'
set :branch,      'main'

before 'deploy:assets:precompile', 'deploy:assets:node_modules'

namespace :deploy do
  namespace :assets do
    desc 'Symlink node_modules'
    task :node_modules, roles: :app do
      run %(ln -nsf "#{shared_path}/node_modules" "#{release_path}/node_modules")
    end
  end

  namespace :configuration do
    desc 'Link created configuration to current release'
    task :symlink, except: { no_release: true } do
      run %(ln -nsf "#{shared_path}/config/database.yml" "#{release_path}/config/database.yml")
      run %(ln -nsf "#{shared_path}/config/master.key"  "#{release_path}/config/master.key")
    end
  end
end
