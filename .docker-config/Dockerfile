FROM ruby:2.7.2

RUN wget https://dl.yarnpkg.com/debian/pubkey.gpg 
RUN curl https://deb.nodesource.com/setup_14.x | bash
RUN cat pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && \
    apt-get install -qq -y build-essential libpq-dev \
    postgresql-client nodejs yarn \
    wget xvfb unzip && \
    rm -rf /var/lib/apt/lists/*

# remove pubkey 
RUN rm pubkey.gpg

ENV BUNDLER_VERSION='2.4.13'
RUN gem install bundler:2.4.13

# RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | \
#     apt-key add - && \
#     echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> \
#     /etc/apt/sources.list.d/google.list && \
#     apt-get update -y && \
#     apt-get install -y google-chrome-stable && \
#     rm -rf /var/lib/apt/lists/*

# ENV CHROMEDRIVER_VERSION 2.19
# ENV CHROMEDRIVER_DIR /chromedriver

# RUN mkdir $CHROMEDRIVER_DIR && \
#   wget -q --continue -P $CHROMEDRIVER_DIR "http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip" && \
#   unzip $CHROMEDRIVER_DIR/chromedriver* -d $CHROMEDRIVER_DIR

# ENV PATH $CHROMEDRIVER_DIR:$PATH

WORKDIR /usr/src/app
