# Build AdonisJS
FROM node:14-alpine as builder
# Workaround for now, since bodyparser install relies on Git
RUN apk add --no-cache git
# Set directory for all files
WORKDIR /home/node
# Copy over package.json files
COPY package*.json ./
# Install all packages
RUN npm install
# Copy over source code
COPY . .
# Build AdonisJS for production
RUN npm run build --production


# Install packages on different step,
# since bodyparser install requires git
# but runtime does not need it
FROM node:14-alpine as installer
# Workaround
RUN apk add --no-cache git
# Set directory for all files
WORKDIR /home/node
# Download vendor libs
RUN wget http://download.cdn.yandex.net/mystem/mystem-3.1-linux-64bit.tar.gz
RUN mkdir mystem && tar -xzf mystem-3.1-linux-64bit.tar.gz -C ./mystem
# Copy over package.json files
COPY package*.json ./
# Install only prod packages
RUN npm ci --only=production


# Build final runtime container
FROM node:14-alpine
# Use non-root user
USER node
# Make directory for app to live in
# It's important to set user first or owner will be root
RUN mkdir -p /home/node/app/
# Set working directory
WORKDIR /home/node/app
# Copy over required files from previous steps
# Copy over built files
COPY --from=builder /home/node/build ./
COPY --from=builder /home/node/.env ./
# Copy over node_modules
COPY --from=installer /home/node/node_modules ./node_modules
# Copy over vendor libs
COPY --from=installer /home/node/mystem ./vendor/linux/x64/
# Copy over package.json files
COPY package*.json ./
# Expose port 3333 to outside world
RUN ls
EXPOSE 3333
# Start server up
CMD [ "npm", "start" ]
