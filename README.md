# Customers API

## Description

Customer relationship management API exposing a Customer resource, developed
with Node framework Nest.js.

## Installation and Execution

### Installation

In order to install the API this repository must be cloned, and then
dependencies must be installed:

```bash
git clone https://github.com/darioscattolini/customers-api.git
cd customers-api
npm install
```

### Execution

The API can be run in three modes:

* **Development**: automatically recompiles app as changes are made in code
  while developing. A debugger can be attached to port 9229.
* **Production**: runs bundle compiled for production.
* **Tests**: e2e tests can also be run.

These are the most relevant commands:

```bash
# run in development mode (watch mode and port for debugging)
npm run start:debug

# build production bundle in dist folder
npm run build

# run production bundle
npm run start:prod

# run e2e tests
npm test:e2e
```

### Docker

Docker images for development, production and testing modes can also be built
and run. These are the commands:

```bash
# build and run image for development mode
docker-compose up dev

# build and run image for production bundle
docker-compose up prod

# build and run image for e2e tests
docker-compose up e2e-test
```

## API Description

This documentation can also be found at the API root path.

### Requests

This API exposes only one resource, *Customer*. It can be accessed via standard
HTTP requests to the `/customers` endpoint. Operations on individual resources
require that the endpoint be followed by the resource id: `/{id}`. The following
HTTP verbs are available for each action:

| **Method** | **Description**     |
| ---------- | ------------------- |
| GET        | Retrieves resources |
| POST       | Creates resources   |
| PUT        | Replaces resources  |
| PATCH      | Updates resources   |
| DELETE     | Deletes resources   |

### Responses

Responses are sent in JSON format. They include a status code describing the
result of the operation. Successful operations (with the exception of DELETE)
return the retrieved or modified resource. Otherwise, an error object is
returned.

The following response status codes are used:

| **Status code**           | **Description**                                             |
| ------------------------- | ----------------------------------------------------------- |
| 200 OK                    | Request successful, resource in response body               |
| 201 Created               | Resource created, resource in response body                 |
| 204 No content            | Request successful, no content in response body             |
| 400 Bad request           | Request fails due to malformed request (validation error)   |
| 404 Not found             | Request fails because no resource is found with targeted id |
| 500 Internal server error | Request fails because of a server error                     |

The following interfaces describe the `Customer` and `Error` objects that can be
included in a response.

### `Customer` interface

| **Key**     | **Value type** | **Value description**                   |
| ----------- | -------------- | --------------------------------------- |
| `id`        | `number`       | Customer id                             |
| `name`      | `string`       | Customer name                           |
| `surname`   | `string`       | Customer surname                        |
| `email`     | `string`       | Customer email                          |
| `birthdate` | `string`       | Customer birthdate in YYYY-MM-DD format |

```json
{
  "id": 114,
  "name": "John",
  "surname": "Smith",
  "email": "johnsmith@example.com",
  "birthdate": "1992-04-11"
}
```

### `Error` interface

| **Key**      | **Value type**         | **Value description**           |
| ------------ | ---------------------- | ------------------------------- |
| `statusCode` | `number`               | Error status code               |
| `error`      | `string`               | Short description of error type |
| `message`    | `string` or `string[]` | Detailed description of error   |

Example:

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Could not find a customer with id: 1"
}
```

### Available operations

#### `GET /customers`

* Retrieves a **list of all customers** stored in API database.
* Response status code should be **200**.
* Response body is of type **`Customer[]`**.
* It should always be successful (returns empty array if there are no
  customers).

#### `POST /customers`

* **Creates a customer** using provided data and returns created entity.
* Request must include **body with JSON object of type `Customer`**:
  * **`id` field is not requiered** as it is assigned by database
  * **All other `Customer` fields are required**
  * `email` must contain a string in **valid email format** and it must be
    **unique** (not be used by another customer)
  * `birthdate` must contain a string in **YYYY-MM-DD format** (e.g.,
    `"1994-05-21"`)
* If request is successful, response status code is **201** and body contains
  the created `Customer` resource (including assigned `id`).
* If request fails, response status code should be **400** due to malformed
  request body (missing field, wrong value type, wrong email or birthdate
  format, email already used in another resource). The `Error` object included
  as response body should contain a message with indications on the source of
  the error.

#### `GET /customers/{id}`

* **Retrieves the customer targeted by specified `id`**.
* If request is successful, response status code is **200** and body contains
  the retrieved `Customer` resource.
* If request fails, response status code shoud be **404** because there is no
  customer with the specified `id`. The `Error` object included as response body
  should indicate this.

#### `PUT /customers/{id}`

* **Replaces all fields' values** in customer targeted by specified `id`.
* Request must include **body with JSON object of type `Customer`** with the
  same requirements as a POST request:
  * **`id` field is not requiered** as it is included in URL
  * **All other `Customer` fields are required**
  * `email` must contain a string in **valid email format** and it must be
    **unique** (not be used by another customer)
  * `birthdate` must contain a string in **YYYY-MM-DD format** (e.g.,
    `"1994-05-21"`)
* If request is successful, response status code is **200** and body contains
  the `Customer` resource with updated data.
* If request fails, there can be two type of errors:
  * Response status code can be **404** because there is no customer with the
    specified `id`. The `Error` object included as response body should indicate
    this.
  * Response status code can be **400** due to malformed request body (missing
    field, wrong value type, wrong email or birthdate format, email already used
    in another resource). The `Error` object included as response body should
    contain a message with indications on the source of the error.

#### `PATCH /customers/{id}`

* **Updates the provided fields' values** in customer targeted by specified
  `id`.
* Request must include body with JSON object of type `Customer`, but **no
  particular field is required**:
  * **`id` field is not requiered** as it is included in URL
  * **Any `Customer` field that is not to be updated** can be omitted from the
    request body. Even an empty object is accepted (no field will be updated)
  * `email` must contain a string in **valid email format** and it must be
    **unique** (not be used by another customer)
  * `birthdate` must contain a string in **YYYY-MM-DD format** (e.g.,
    `"1994-05-21"`)
* If request is successful, response status code is **200** and body contains
  the `Customer` resource with updated data.
* If request fails, there can be two type of errors:
  * Response status code can be **404** because there is no customer with the
    specified `id`. The `Error` object included as response body should indicate
    this.
  * Response status code can be **400** due to malformed request body (wrong
    value type, wrong email or birthdate format, email already used in another
    resource). The `Error` object included as response body should contain a
    message with indications on the source of the error.

#### `DELETE /customers/{id}`

* **Deletes the customer targeted by specified `id`**.
* If request is successful, response status code is **204** and response
  contains no body.
* If request fails, response status code shoud be **404** because there is no
  customer with the specified `id`. The `Error` object included as response body
  should indicate this.

## Tech stack used

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
* [Jest](https://jestjs.io/) is the testing framework used for unit and
  integration tests. It is provided by default by Nest.js, extended with
  [SuperTest](https://github.com/visionmedia/supertest) library for HTTP
  assertions used in e2e testing. I have also extended it with
  [jest-extended](https://github.com/jest-community/jest-extended) for
  additional matchers.
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
* [Day.js](https://day.js.org/) date and time library is used in a custom date
  validator.

## Some comments on design choices

This API was developed as a solution to a coding project for a hiring process.
In this section I explain some decisions I have made in relation to the
project's assignment.

### Feature modules

The API requirements are fairly simple, dealing only with the Customer entity.
However, I decided to dedicate a specific Nest feature module for all
customer-related code. If the API grows and new entities need to be handled,
new feature modules can be added, and it would not require refactoring the main
App module.

### Utilities

A utilities folder was included with utilities related to error handling (custom
exceptions, validators and error interceptors). They are not included in the
Customers feature module because they could handle errors arising from different
entities in case they are included in the API.

### Data persistence

Data persistence was not a requirement for this project, but I decided to
implement an intermediate ORM layer in order to show how it can be handled by
means of the Data Mapper + Repository patterns.

The interaction with the database is handled through TypeORM, which can run with
different data sources. Since the project instructions precluded the requirement
of database installation, I resorted to SQL.js library as data source, which
runs a SQL database in memory. Therefore, data are persisted while the API app
runs, but are lost after its execution stops.

If data persistence is eventually to be implemented, SQL.js can be replaced by
another data source compatible with TypeORM (MySQL, Postgres, Oracle,
MongoDB...), which would only require minor changes in the configuration files.

### DTOs vs ORM entity classes

I had to decide whether to use DTOs as API models for the presentation layer,
because I could have resorted just to ORM entity classes. The current
requirements can be easily met just with the Customer entity class: there is no
special business or persistence logic, so creating DTO classes may look like
overkill.

However, I decided to use DTOs for various reasons. It helps keep the separation
of concerns between persistence and business layer on the one hand and
presentation layer on the other, and between different requirements in the
presentation layer (for creating, updating and retrieving customers). This will
be helpful if the API grows, because an eventual divergence between API models
and persistence entities will be easier to implement. Besides, it is a pattern
suggested by the Nest.js framework.

### e2e tests

I decided to implement the test requirements in the assignment as integration
tests. Unit tests would perform practically these same tests on controller and
service classes, but they would require to mock dependencies (validators, the
customer service as controller dependency, and the customer repository as
service dependency). Since the database is not an external dependency,
integration tests for each CRUD operation are easy to set up and provide a great
API specification.

Tests cover happy paths and different errors (resources not found and most
validation errors), checking some headers, status codes and body interface and
content.

Files for unit tests included by Nest.js are just boilerplates and were not
tested.
