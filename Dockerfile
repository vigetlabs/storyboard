FROM ruby:2.5.1


RUN apt-get update -qq && apt-get install -y nodejs postgresql-client

WORKDIR /usr/src/app

# ... more custom stuff here ...

# Pre-install gems
COPY Gemfile* ./
RUN gem install bundler
RUN bundle install --jobs=3 --retry=3
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -qq -y build-essential libpq-dev nodejs yarn

RUN yarn install
COPY . .
# RUN rake db:create db:migrate db:seed --trace

ENTRYPOINT ./entrypoint.sh

