Rails.application.routes.draw do
  devise_for :users

  root to: "stories#index"

  resources :stories, path: "/" do
    get "mine", on: :collection, as: :my
  end
end
