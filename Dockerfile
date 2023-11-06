FROM node:alpine

WORKDIR /camerapi

COPY . .

RUN npm install --production

RUN mkdir -p /camerapi/temp

CMD ["npm", "start"]