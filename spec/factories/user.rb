FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password" }
    password_confirmation { "password" }

    trait :admin do
      email { "noah.over@viget.com" }
    end
  end
end
