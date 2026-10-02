# Rails 7 forbids autoloading app models during initialization.
Rails.application.config.after_initialize do
  StatBoard.models = [User, Adventure]
end

Rails.application.config.assets.precompile += %w(stat_board/bootstrap.css)
