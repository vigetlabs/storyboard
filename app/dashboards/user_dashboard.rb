require "administrate/base_dashboard"

class UserDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    adventures: Field::HasMany,
    id: Field::Number,
    email: Field::String,
    sign_in_count: Field::Number,
    current_sign_in_at: Field::DateTime,
    last_sign_in_at: Field::DateTime,
    current_sign_in_ip: Field::String.with_options(searchable: false),
    last_sign_in_ip: Field::String.with_options(searchable: false),
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    email
    adventures
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    id
    adventures
    email
    sign_in_count
    current_sign_in_at
    last_sign_in_at
    current_sign_in_ip
    last_sign_in_ip
    created_at
    updated_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    email
  ].freeze

  COLLECTION_FILTERS = {}.freeze

  def display_resource(user)
    user.email
  end
end
