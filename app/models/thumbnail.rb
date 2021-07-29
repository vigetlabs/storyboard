class Thumbnail < ApplicationRecord
  validates :signature,
            :uid,
            presence: true,
            uniqueness: true
end
