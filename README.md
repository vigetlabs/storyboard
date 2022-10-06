# Storyboard
An app for creating Choose Your Own Adventure stories

## Local Development

<details>
  <summary>With Docker</summary>

  ```bash
  cp config/database.yml.example-docker config/database.yml

  touch config/master.key
  # This is a gitignored file which acts as the key to the encrypted/commited `config/credentials.yml` file.
  # Copy/paste the password into the new config file:
  # https://viget.1password.com/vaults/all/allitems/546kllhiv5ehtdsn2rhvt4q56y
  ```

  ### Build / Run
  If you're building the docker containers for the first time, or if you know a dependency has been added (eg: ruby gem / node package), run this:
  ```bash
  docker compose build
  ```

  Once the containers have been built, starting the app is just:
  ```bash
  docker compose up

  # And a shortcut for rebuilding containers while spinning them up at the same time:
  docker compose up --build
  ```

  ### Seeding the database
  ```bash
  docker compose run --rm app bundle exec rake db:migrate
  docker compose run --rm app bundle exec rake db:seed
  ```

  ### Running tests
  ```bash
  # Set up the test database
  docker compose run --rm -e RAILS_ENV=test app rake db:create db:migrate

  # Run specs
  docker-compose run --rm app rspec
  ```
</details>

<details>
  <summary>Running Locally</summary>

  ### Tooling and Dependencies
  - If you have `asdf` installed, `.tool-versions` is set up for Ruby, Node, and Yarn versions.
  - PostgreSQL
    - version 11.x
    - can be installed with homebrew


  ### Configuration
  ```bash
  cp config/database.yml.example config/database.yml

  touch config/master.key
  # This is a gitignored file which acts as the key to the encrypted/commited `config/credentials.yml` file.
  # Copy/paste the password into the new config file:
  # https://viget.1password.com/vaults/all/allitems/546kllhiv5ehtdsn2rhvt4q56y
  ```

  ### Application Dependencies
  If you don't have Bundler installed for Ruby:
  ```bash
  gem install bundler -v 1.17.3
  ```

  Install dependencies:
  ```bash
  # Install Ruby gems:
  bundle install

  # Install JS packages:
  yarn install
  ```

  ### Set up database
  ```bash
  rake db:create db:migrate db:seed
  ```

  ### Run the application
  ```bash
  ./bin/rails s
  ```

  If you're updating CSS or JS, start webpacker to enable hot reloading:
  ```bash
  ./bin/webpack-dev-server
  ```

  Then open [http://localhost:3000](http://localhost:3000) with your favorite internet browser.

  ### Run the test suite
  ```bash
  rspec
  ```
</details>

## Deployment

To deploy:

```sh
bundle exec cap production deploy
```

## Contributing
- We're using a "rebase and merge" workflow for a linear commit history.
