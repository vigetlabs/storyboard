Rails.application.routes.draw do
  devise_for :users

  root to: "adventures#index"

  resources :adventures, path: "/" do
    get "mine", on: :collection, as: :my
  end

  post "/api/:id", to: "api/adventures#update"
end
