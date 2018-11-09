class Story < ApplicationRecord
  include Sluggable

  slug_from :slug_source

  def to_s
    title
  end

  def to_param
    slug
  end

  def public?
    !private?
  end

  private

  def slug_source
    if public?
      title
    else
      SecureRandom.uuid
    end
  end
end
