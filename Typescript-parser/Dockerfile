FROM node:slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
VOLUME [ "/logs" ] 
RUN npm run build 
CMD [ "node", "index.js" ]