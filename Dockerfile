FROM node:latest

WORKDIR /app

COPY . .

RUN npm install --production

RUN apt-get update && apt-get install sqlite3
RUN sqlite3 camerai.db < ./database/migration.sql

RUN mkdir -p /app/temp

CMD ["npm", "start"]