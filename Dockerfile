FROM node:alpine

WORKDIR /camerapi

COPY . .

RUN npm install --production

EXPOSE 8080

CMD ["npm", "start"]