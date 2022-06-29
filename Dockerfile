FROM node:16-alpine

WORKDIR /devcamper

COPY . .

EXPOSE 5000

RUN npm install

CMD ["npm", "run", "dev"]