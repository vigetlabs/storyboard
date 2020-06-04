# Storyboard

## Setup

```
gem install bundler -v 1.16.2
bundle
yarn install
rake db:create db:migrate db:seed
./bin/webpack-dev-server
./bin/rails s
```


# Docker
```
docker-compose build
docker-compose up
# May need to open a new tab in your terminal
docker-compose exec app rake db:migrate
docker-compose exec app rake db:seed
