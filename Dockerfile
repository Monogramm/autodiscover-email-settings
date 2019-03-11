FROM node:8-alpine

LABEL maintainer="Mathieu BRUNOT <mathieu.brunot at monogramm dot io>"

EXPOSE 8000
WORKDIR /app
COPY package.json yarn.lock index.js settings.js /app/
RUN yarn --prod && yarn cache clean
COPY views /app/views

CMD ["node", "/app/index"]
