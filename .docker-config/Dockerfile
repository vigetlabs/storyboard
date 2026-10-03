FROM ruby:3.4.11-bookworm

ENV NODE_VERSION=26.10.0
ENV YARN_VERSION=1.22.19
ENV BUNDLER_VERSION=2.4.13
# Selenium 4.9's manager asks for Chrome 114. Pin a matching pair for
# js: true specs in this image.
ENV CHROME_VERSION=114.0.5735.90
ENV CHROMEDRIVER_VERSION=114.0.5735.90
ENV CHROME_BIN=/usr/bin/google-chrome

RUN apt-get update \
    && apt-get install -qq -y --no-install-recommends \
       build-essential libpq-dev postgresql-client xz-utils ca-certificates unzip \
       fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 \
       libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 \
       libxcomposite1 libxdamage1 libxfixes3 libxkbcommon0 libxrandr2 xdg-utils \
    && curl -fsSL -o /tmp/chrome.deb \
       "https://mirror.cs.uchicago.edu/google-chrome/pool/main/g/google-chrome-stable/google-chrome-stable_${CHROME_VERSION}-1_amd64.deb" \
    && apt-get install -qq -y --no-install-recommends /tmp/chrome.deb \
    && curl -fsSL -o /tmp/chromedriver.zip \
       "https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip" \
    && unzip -q /tmp/chromedriver.zip -d /usr/local/bin \
    && chmod +x /usr/local/bin/chromedriver \
    && rm -f /tmp/chrome.deb /tmp/chromedriver.zip \
    && rm -rf /var/lib/apt/lists/*

# Pin the same Node/Yarn as .tool-versions.
RUN curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
    | tar -xJ -C /usr/local --strip-components=1 \
    && npm install -g "yarn@${YARN_VERSION}"

RUN gem install bundler:${BUNDLER_VERSION}

WORKDIR /usr/src/app
