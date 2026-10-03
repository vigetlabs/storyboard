FactoryBot.define do
  factory :custom_theme do
    association :user
    sequence(:title) { |n| "Custom Theme #{n}" }
  end
end
