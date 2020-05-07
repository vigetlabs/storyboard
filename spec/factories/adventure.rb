FactoryBot.define do
  factory :adventure do
    association :user, :factory => :user
    description { "Test Story" }
    title { "Test Story" }
    slug { "test-story"}
    theme { "light" }
  end
end
