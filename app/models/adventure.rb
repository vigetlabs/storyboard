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

  def editable_by?(current_user)
    public || !user || user == current_user
  end

  private

  def slug_source
    title
  end
end
