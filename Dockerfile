FROM node:latest

WORKDIR /app

COPY . .

RUN npm install --production

RUN mkdir -p /app/temp

CMD ["npm", "start"]