class Story < ApplicationRecord
  include Sluggable

  slug_from :title

  def to_s
    title
  end

  def to_param
    slug
  end
end
