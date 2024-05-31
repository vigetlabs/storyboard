#!/bin/bash

set -e

# Ensure PID is reset. This can happen if docker isn't cleanly shut down.
rm -rf /usr/src/app/tmp/pids

# Verify node_modules are up to date
# yarn install --silent

# Verify gems are up to date
if ! bundle check > /dev/null; then
  echo "Gems dependencies are out of date. Installing..."
  bundle install
fi

exec "$@"
