require "rails_helper"

RSpec.describe Sluggable do
  it "reads the configured slug source method" do
    dummy_class = Class.new do
      include Sluggable

      def name
        "Hello World"
      end
    end
    dummy_class.slug_source_method_name = :name

    expect(dummy_class.new.send(:slug_source)).to eq("Hello World")
  end
end
