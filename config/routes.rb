Rails.application.routes.draw do
  mount PointlessFeedback::Engine, :at => '/feedback'
  devise_for :users

  root to: "adventures#index"

  resources :adventures, path: "/" do
    get "details", on: :member, as: :details
    get "source", on: :member

    get "mine", on: :collection, as: :my
  end

  post "/api/:id", to: "api/adventures#update"
  get "/api/:id", to: "api/adventures#show"
end
