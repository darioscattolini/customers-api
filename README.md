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
* [Nest.js](https://docs.nestjs.com/) is the chosen Node.js framework. Nest is
  more opinionated than alternatives such as Express and Fastify, and is a bit
  of overkill for a simple project such as this one. However, it was chosen
  because it replicates many patterns of the Angular framework and promotes the
  use of TypeScript and Jest. I come from a front-end background and Angular is
  the framework I am most familiar with, so I considered that this would be the
  best choice for my first server-side app.
* [Jest](https://jestjs.io/) is the testing framework used for unit testing. It
  is the testing framework I am most familiar with and is provided by default by
  Nest.js.
* [TypeORM](https://typeorm.io/) is an ORM used to enforce the Data Mapper
  pattern for data persistence and to decouple persistence logic from particular
  databases. It was chosen because it supports SQL.js.
* [SQL.js](https://sql.js.org/) is used by TypeORM as database infrastructure.
  It is used because it does not require a database installation: the database
  is stored in memory and is not persisted after server execution ends.
* [class-validator](https://github.com/typestack/class-validator) is used to
  add validation constraints to TypeORM entity and DTO classes. It is
  integrated with Nest.js built-in ValidationPipe, making validation errors
  handling very easy.

## Design choices

* Besides the traditional PUT request method for updating all fields of the
  Customer entity, I have implemented a PATCH method allowing for partial
  updates.

* Although the API requirements are fairly simple, dealing only with the
  Customers entity, I decided to dedicate a specific Nest feature module for all
  customer-related code. If the API scales and new entities need to be handled,
  new feature modules can be added, and it would not require refactoring the
  main App module.

* While data persistence is not a requirement for this project, I decided to
  implement it in order to show how it can be handled by means of an ORM and the
  Data Mapper + Repository patterns. The interaction with the database is
  handled through TypeORM, which can run with different data sources. Since the
  project instructions precluded the requirement of database installation, I
  resorted to SQL.js library as data source, which runs a SQL database in
  memory. If data persistence is eventually to be implemented, SQL.js could be
  replaced by another data source compatible with TypeORM (MySQL, Postgres,
  Oracle, MongoDB...), which would only require minor changes in the
  configuration files.

* I had to decide whether to use DTOs as API models for the presentation layer,
  or to resort to ORM entity classes. The current requirements can be easily met
  just with the Customer entity class: there is no special business or
  persistence logic, so creating DTO classes may look like overkill. However, I
  decided to use DTOs for various reasons. It helps keep the separation of
  concerns between persistence and business layer on the one hand and
  presentation layer on the other, and between different requirements in the
  presentation layer (for creating, updating and retrieving customers). This
  will be helpful for scalability, because an eventual divergence between API
  models and persistence entities will be easier to implement, and it has been
  helpful to allow for the partial update of customer data. Finally, it is a
  pattern suggested by the Nest.js framework.
