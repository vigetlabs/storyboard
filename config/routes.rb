Rails.application.routes.draw do
  namespace :admin do
    resources :adventures
    resources :users

    root to: "adventures#index"
  end

  mount StatBoard::Engine, at: 'stats'
  mount PointlessFeedback::Engine, :at => '/feedback'
  devise_for :users

  root to: "adventures#index"

  get "/formatting-help", to: "formatting_help#show"

  get "/terms", to: "terms#show"

  post "/api/:id", to: "api/adventures#update"
  get "/api/:id", to: "api/adventures#show"

  post "/api/photos/:meta_id", to: "api/photos#update"
  delete "/api/photos/:meta_id", to: "api/photos#remove"

  post "/api/audio-tracks/:meta_id", to: "api/audio_tracks#update"
  delete "/api/audio-tracks/:meta_id", to: "api/audio_tracks#remove"

  get "unsubscribe", to: "unsubscribes#new", as: :new_unsubscribe
  resources :unsubscribes, only: [:create]

  # Keep this block at the bottom so the "/:id adventures#show"
  # doesn't catch other routes
  resources :adventures, path: "/" do
    get "details", on: :member, as: :details
    get "source", on: :member
    get "offline", on: :member
    post "authenticate", on: :member
    get "mine", on: :collection, as: :my
    get "csv", on: :collection
  end
end
