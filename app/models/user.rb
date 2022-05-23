class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :adventures, dependent: :destroy
  has_many :custom_themes, dependent: :destroy

  def is_admin?
    email.in? [
      "noah.over@viget.com",
      "kelly.kenny@viget.com"
    ]
  end
end
