FROM node:alpine

WORKDIR /camerapi

COPY . .

RUN npm install --production

RUN apk update && apk upgrade && apk add sqlite
RUN sqlite3 camerai.db < ./database/camerapi.sql

RUN mkdir -p /camerapi/temp

CMD ["npm", "start"]