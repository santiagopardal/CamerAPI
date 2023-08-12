FROM node:latest

WORKDIR /app
COPY . .
RUN npm install --production

RUN apt-get update && apt-get install sqlite3
RUN sqlite3 camerai.db < ./database/camerapi.sql

RUN mkdir /app/temp

CMD ["npm", "start"]