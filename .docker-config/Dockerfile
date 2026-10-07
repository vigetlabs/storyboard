FROM ruby:4.0.7-bookworm

ENV NODE_VERSION=26.10.0
ENV YARN_VERSION=1.22.19
ENV BUNDLER_VERSION=4.0.22
ENV CHROME_BIN=/usr/bin/chromium

RUN apt-get update \
    && apt-get install -qq -y --no-install-recommends \
       build-essential libpq-dev libyaml-dev postgresql-client xz-utils ca-certificates \
       chromium \
    && rm -rf /var/lib/apt/lists/*

# Pin the same Node/Yarn as .tool-versions.
RUN ARCH="$(dpkg --print-architecture)" \
    && case "$ARCH" in \
         amd64) NODE_ARCH=linux-x64 ;; \
         arm64) NODE_ARCH=linux-arm64 ;; \
         *) echo "Unsupported architecture: $ARCH" >&2; exit 1 ;; \
       esac \
    && curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${NODE_ARCH}.tar.xz" \
       | tar -xJ -C /usr/local --strip-components=1 \
    && npm install -g "yarn@${YARN_VERSION}"

RUN gem install bundler:${BUNDLER_VERSION}

WORKDIR /usr/src/app
