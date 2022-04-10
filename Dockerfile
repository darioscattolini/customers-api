FROM node:12.19.0-alpine3.9 AS development

WORKDIR /api

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install --only=development

COPY . .

RUN npm run build

FROM node:12.19.0-alpine3.9 AS e2e_test

WORKDIR /api

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run test:e2e

FROM node:12.19.0-alpine3.9 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /api

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /api/dist ./dist

CMD ["node", "dist/main"]
