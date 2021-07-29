require 'dragonfly'

Dragonfly.app.configure do
  plugin :imagemagick

  secret Rails.application.credentials.dragonfly_secret

  url_format "/media/:job/:name"

  if Rails.env.production?
    datastore :s3,
      bucket_name:       Rails.application.credentials.aws_bucket_name,
      access_key_id:     Rails.application.credentials.aws_access_key_id,
      secret_access_key: Rails.application.credentials.aws_secret_access_key,
      url_scheme:        "https"
  else
    datastore :file,
      root_path: Rails.root.join('public/system/dragonfly', Rails.env),
      server_root: Rails.root.join('public')
  end

  define_url do |app, job, opts|
    thumb = Thumbnail.find_by_signature(job.signature)

    url = if thumb
      app.datastore.url_for(thumb.uid)
    else
      app.server.url_for(job)
    end

    URI::Parser.new.escape(url)
  end

  before_serve do |job, env|
    thumb = Thumbnail.find_by(signature: job.signature)

    if thumb
      throw :halt, [301, { "Location" => job.app.remote_url_for(thumb.uid) }, [""]]
    else
      uid = job.store
      Thumbnail.create!(uid: uid, signature: job.signature)
    end
  end
end

Dragonfly.logger = Rails.logger

Rails.application.middleware.use Dragonfly::Middleware

ActiveSupport.on_load(:active_record) do
  extend Dragonfly::Model
  extend Dragonfly::Model::Validations
end
