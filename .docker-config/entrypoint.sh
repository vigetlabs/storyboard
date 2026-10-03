#!/bin/bash

set -e

# Ensure PID is reset. This can happen if docker isn't cleanly shut down.
rm -rf /usr/src/app/tmp/pids

# Verify node_modules are up to date
yarn install --silent

# The gems volume persists across image rebuilds. Native extensions compiled
# for an older Ruby (2.7 leftovers after the 3.4 bump) stay on disk and
# activate ahead of the Gemfile. Reinstall when the interpreter changes.
BUNDLE_HOME="${BUNDLE_PATH:-/usr/local/bundle}"
RUBY_VERSION_STAMP="${BUNDLE_HOME}/.storyboard-ruby-version"
CURRENT_RUBY="$(ruby -e 'print RUBY_VERSION')"

if [ ! -f "$RUBY_VERSION_STAMP" ] || [ "$(cat "$RUBY_VERSION_STAMP")" != "$CURRENT_RUBY" ]; then
  echo "Ruby is ${CURRENT_RUBY}; installing gems and removing leftovers..."
  bundle install
  bundle clean --force
  echo "$CURRENT_RUBY" > "$RUBY_VERSION_STAMP"
elif ! bundle check > /dev/null; then
  echo "Gems dependencies are out of date. Installing..."
  bundle install
  bundle clean --force
fi

# `rspec` / `rails` / `rake` without `bundle exec` activate Ruby default gems
# (json 3.x on 3.4) before Bundler.setup and conflict with the Gemfile.
case "$1" in
  rspec|rails|rake)
    set -- bundle exec "$@"
    ;;
esac

exec "$@"
