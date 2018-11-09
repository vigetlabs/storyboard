Rails.application.routes.draw do
  root to: "stories#index"

  resources :stories
end
