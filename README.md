# Storyboard

## Setup

Copy key from https://viget.1password.com/vaults/all/allitems/546kllhiv5ehtdsn2rhvt4q56y into a file called `config/master.key`

```
asdf install
gem install bundler -v 1.17.3
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
```

**Note**: If you're building these images on Apple Silicon (M1/M2 Mac), you can use the environment variable `DOCKER_DEFAULT_PLATFORM=linux/amd64` to avoid platform-related build issues when running `docker-compose build`.