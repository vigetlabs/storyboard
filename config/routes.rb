Rails.application.routes.draw do
  mount PointlessFeedback::Engine, :at => '/feedback'
  devise_for :users

  root to: "adventures#index"

  get "/terms", to: "terms#show"

  post "/api/:id", to: "api/adventures#update"
  get "/api/:id", to: "api/adventures#show"

  resources :adventures, path: "/" do
    get "details", on: :member, as: :details
    get "source", on: :member

    get "mine", on: :collection, as: :my
    get "csv", on: :collection
  end
end
