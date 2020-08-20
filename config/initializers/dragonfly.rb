require 'dragonfly'
require 'dragonfly/s3_data_store'

# Configure
Dragonfly.app.configure do
  plugin :imagemagick

  secret "137087948443e3ee6e567656f4eaf9ff1178e81b93dbd0afba6b7ac18009cd2e"

  url_format "/media/:job/:name"



    if Rails.env.production?
      datastore :s3,
        bucket_name:       Rails.application.secrets.s3_bucket_name,
        access_key_id:     Rails.application.secrets.s3_access_key_id,
        secret_access_key: Rails.application.secrets.s3_secret_access_key,
        url_scheme:        'https'
    else
      datastore :file,
      root_path: Rails.root.join('public/system/dragonfly', Rails.env),
      server_root: Rails.root.join('public')
    end

end



# Logger
Dragonfly.logger = Rails.logger

# Mount as middleware
Rails.application.middleware.use Dragonfly::Middleware

# Add model functionality
ActiveSupport.on_load(:active_record) do
  extend Dragonfly::Model
  extend Dragonfly::Model::Validations
end


