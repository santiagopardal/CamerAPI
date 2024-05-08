FROM node:alpine

WORKDIR /camerapi

COPY . .

RUN npm install --production

CMD ["npm", "start"]