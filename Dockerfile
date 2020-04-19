FROM node:12.16.2-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:12.16.2-alpine
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
RUN npm install --production

COPY --from=build /usr/src/app/dist dist

ENTRYPOINT [ "node", "dist/app.js"]