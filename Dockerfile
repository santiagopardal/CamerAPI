FROM node:latest

WORKDIR /app
COPY . .
RUN npm install --production

RUN mkdir /app/temp

CMD ["npm", "start"]