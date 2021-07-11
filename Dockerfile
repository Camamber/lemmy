ARG FRONTEND_NODE_VERSION
FROM node:lts as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["ls", "-al"]

# FROM node:lts-alpine

# WORKDIR /app

# COPY --from=build /app/build ./

# RUN npm ci --production

# CMD ["npm", "start"]
