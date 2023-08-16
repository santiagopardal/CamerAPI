FROM node:alpine

WORKDIR /camerapi

COPY . .

RUN npm install --production

RUN apt-get update && apt-get install sqlite3
RUN sqlite3 camerai.db < ./database/camerapi.sql

RUN mkdir -p /camerapi/temp

CMD ["npm", "start"]