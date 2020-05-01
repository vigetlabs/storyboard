class Adventure < ApplicationRecord
  include Sluggable

  THEMES = {
    "Light"  => "light",
    "Viget"  => "viget",
    "Space"  => "space",
    "Desert" => "desert"
  }

  FEATURE_GROUPS = [
    "Fiction",
    "History",
    "Education and Training"
  ]

  slug_from :slug_source

  belongs_to :user, optional: true

  validates :title, :theme, presence: true

  validates :password, length: (3..32), presence: true, if: :has_password

  def to_s
    title
  end

  def authenticate(entered_password)
    password? && password == entered_password
  end

  def to_param
    slug
  end

  def editable_by?(current_user)
    public               ||
    !user                ||
    user == current_user ||
    current_user.try(:is_admin?)
  end

  private

  def slug_source
    title
  end
end
