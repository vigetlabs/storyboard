class Adventure < ApplicationRecord
  include Sluggable

  THEMES = {
    "Light"  => "light",
    "Viget"  => "viget",
    "Space"  => "space",
    "Desert" => "desert"
  }

  slug_from :slug_source

  belongs_to :user, optional: true

  validates :title, presence: true

  def to_s
    title
  end

  def to_param
    slug
  end

  def public?
    !private?
  end

  def editable_by?(current_user)
    if user
      user == current_user || current_user.email.include?("fatsi")
    else
      true
    end
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
