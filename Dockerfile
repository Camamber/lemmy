FROM node:lts as build

WORKDIR /mystem

RUN wget http://download.cdn.yandex.net/mystem/mystem-3.1-linux-64bit.tar.gz && tar -xzf rebol.tar.gz


WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM node:lts-alpine

WORKDIR /app

COPY --from=build /app/build ./
COPY --from=build /app/.env ./
COPY --from=build /mystem ./vendor/linux/x64/

RUN npm ci --production

RUN npm install pino-pretty

CMD ["npm", "start"]
