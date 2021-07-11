FROM node:lts as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM node:lts-alpine

WORKDIR /app

COPY --from=build /app/build ./
COPY --from=build /app/.env ./

RUN npm ci --production

RUN npm install pino-pretty

CMD ["npm", "start"]
