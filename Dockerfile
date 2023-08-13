FROM node:latest

WORKDIR /app

COPY . .

RUN npm install --production

RUN apt-get update && apt-get install sqlite3
RUN sqlite3 APP-Database/camerai.db < ./database/camerapi.sql

RUN mkdir -p /app/temp

CMD ["npm", "start"]