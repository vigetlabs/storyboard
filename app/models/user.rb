class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :adventures, dependent: :destroy

  def is_admin?
    email.in? [
      "eli.fatsi@viget.com",
      "albert.wavering@viget.com",
      "nate.hunzaker@viget.com",
      "joe.jackson@viget.com",
      "kelly.kenny@viget.com"
    ]
  end
end
