require "administrate/base_dashboard"

class AdventureDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    user: Field::BelongsTo,
    id: Field::Number,
    title: Field::String,
    slug: Field::String,
    description: Field::Text,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    public: Field::Boolean,
    content: Field::String.with_options(searchable: false),
    theme: Field::String,
    featured: Field::String,
    password: Field::String,
    has_password: Field::Boolean,
    show_source: Field::Boolean,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    id
    user
    title
    slug
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    user
    id
    title
    slug
    description
    created_at
    updated_at
    public
    theme
    featured
    password
    has_password
    show_source
    content
  ].freeze

  FORM_ATTRIBUTES = %i[
    user
    title
    slug
    description
    public
    theme
    featured
    password
    has_password
    show_source
  ].freeze

  COLLECTION_FILTERS = {}.freeze

end
