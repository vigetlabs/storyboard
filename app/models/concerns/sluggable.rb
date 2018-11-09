module Sluggable
  extend ActiveSupport::Concern

  included do
    cattr_accessor :slug_source_method_name
  end

  module ClassMethods
    def slug_from(slug_source_method_name, validation_options = {})
      self.slug_source_method_name = slug_source_method_name

      validates_uniqueness_of :slug, validation_options
      validates_format_of :slug, :with => /\A[a-z0-9-]+\z/, :allow_blank => true
      validates_presence_of :slug

      before_validation :assign_generated_slug, :if => :generate_slug?
    end
  end

  def dup
    super.tap {|r| r.slug = nil }
  end

  private

  def slug_source
    send(self.class.slug_source_method_name)
  end

  def assign_generated_slug
    self.slug = next_available_slug if generate_slug?
  end

  def next_available_slug
    possible_slug = slug_from_source

    index = 2
    while self.class.find_by_slug(possible_slug)
      possible_slug = slug_from_source + "-#{index}"
      index+= 1
    end
    possible_slug
  end

  def slug_from_source
    slug_source.parameterize
  end

  def generate_slug?
    slug_source.present? && !slug?
  end

end
