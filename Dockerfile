FROM alpine:latest

RUN apk update \
        && apk add --update nodejs yarn zip unzip curl python3 openntpd bash git \
        && pip3 install pip pipenv awscli --upgrade \
        && yarn global add serverless

COPY . /code
WORKDIR /code

RUN yarn global add node-gyp

RUN yarn install
