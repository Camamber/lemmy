FROM node:lts as build

WORKDIR /mystem

RUN wget http://download.cdn.yandex.net/mystem/mystem-3.1-linux-64bit.tar.gz && tar -xzf mystem-3.1-linux-64bit.tar.gz


WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM ubuntu:latest

RUN apt-get upgrade && apt-get update  && apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install nodejs -y

WORKDIR /app

COPY --from=build /app/build ./
COPY --from=build /app/.env ./
COPY --from=build /mystem ./vendor/linux/x64/

RUN npm ci --production

RUN npm install pino-pretty

CMD ["npm", "start"]
