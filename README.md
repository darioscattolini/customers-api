# Customers API

## Description

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Tech stack

* [Node.js](https://nodejs.org/) was chosen as the main technology for this
  server-side app, since JavaScript is the programming language I am most
  familiar with.
* [Typescript](https://www.typescriptlang.org/) is used instead of plain
  JavaScript, in order to leverage the advantages of type safety.
* [Nest](https://docs.nestjs.com/) is the chosen Node.js framework. Nest is
  more opinionated than alternatives such as Express and Fastify, and is a bit
  of overkill for a simple project such as this one. However, it was chosen
  because it replicates many patterns of the Angular framework and promotes the
  use of TypeScript and Jest. I come from a front-end background and Angular is
  the framework I am most familiar with, so I considered that this would be the
  best choice for my first server-side app.
* [Jest](https://jestjs.io/) is the testing framework used for unit testing. It
  is the testing framework I am most familiar with and is provided by default by
  Nest.js.
