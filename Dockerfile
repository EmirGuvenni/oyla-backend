FROM node:18.18-slim

WORKDIR /app
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
COPY ./src /app/src
# COPY ./certs /app/certs
COPY ./tsconfig.json /app/tsconfig.json

RUN yarn install
RUN yarn build

CMD yarn start