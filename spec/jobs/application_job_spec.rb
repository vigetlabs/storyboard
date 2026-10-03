require "rails_helper"

RSpec.describe ApplicationJob do
  it "is an ActiveJob" do
    expect(described_class).to be < ActiveJob::Base
  end
end
