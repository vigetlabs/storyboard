# frozen_string_literal: true

lock "~> 3.20.0"

set :application, "storyboard"
set :repo_url, "git@github.com:vigetlabs/storyboard.git"
set :branch, "main"
set :deploy_to, "/var/www/storyboard/production"
set :keep_releases, 5

set :ssh_options, { forward_agent: true }

set :rbenv_type, :user
set :rbenv_ruby, "4.0.7"

append :linked_files, "config/database.yml", "config/master.key"
append :linked_dirs,
       "log",
       "tmp/pids",
       "tmp/cache",
       "tmp/sockets",
       "public/system",
       "public/uploads",
       "node_modules",
       "storage"

namespace :deploy do
  desc "Install JS dependencies"
  task :yarn_install do
    on roles(:app) do
      within release_path do
        execute :yarn, "install", "--frozen-lockfile"
      end
    end
  end

  desc "Restart application"
  task :restart do
    on roles(:app) do
      execute :touch, release_path.join("tmp/restart.txt")
    end
  end

  after :publishing, :restart
end

before "deploy:assets:precompile", "deploy:yarn_install"
