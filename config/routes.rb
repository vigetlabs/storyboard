Rails.application.routes.draw do
  mount StatBoard::Engine, at: 'stats'
  mount PointlessFeedback::Engine, :at => '/feedback'
  devise_for :users

  root to: "adventures#index"

  get "/terms", to: "terms#show"

  post "/api/:id", to: "api/adventures#update"
  get "/api/:id", to: "api/adventures#show"

  # Keep this block at the bottom so the "/:id adventures#show"
  # doesn't catch other routes
  resources :adventures, path: "/" do
    get "details", on: :member, as: :details
    get "source", on: :member
    get "offline", on: :member
    get "mine", on: :collection, as: :my
    get "csv", on: :collection
  end
end
