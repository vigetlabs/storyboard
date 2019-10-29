StatBoard.models = [User, Adventure] # configure models

Rails.application.config.assets.precompile += %w(stat_board/bootstrap.css)
