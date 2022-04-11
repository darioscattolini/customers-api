# Customers API

Customer relationship management API exposing a `Customer` resource. Developed by
[Darío Scattolini](https://github.com/darioscattolini/).

## Requests

This API exposes only one resource, *Customer*. It can be accessed via standard
HTTP requests to the `/customers` endpoint (port 3000 unless changed by
environment variables). Operations on individual resources require that the
endpoint be followed by the resource id: `/{id}`. The following HTTP verbs are
available for each action:

| **Method** | **Description**     |
| ---------- | ------------------- |
| GET        | Retrieves resources |
| POST       | Creates resources   |
| PUT        | Replaces resources  |
| PATCH      | Updates resources   |
| DELETE     | Deletes resources   |

## Responses

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

## `Customer` interface

| **Key**     | **Value type** | **Value description**                   |
| ----------- | -------------- | --------------------------------------- |
| `id`        | `number`       | Customer id                             |
| `name`      | `string`       | Customer name                           |
| `surname`   | `string`       | Customer surname                        |
| `email`     | `string`       | Customer email                          |
| `birthdate` | `string`       | Customer birthdate in YYYY-MM-DD format |

Example:

```json
{
  "id": 114,
  "name": "John",
  "surname": "Smith",
  "email": "johnsmith@example.com",
  "birthdate": "1992-04-11"
}
```

## `Error` interface

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

## Available operations

### `GET /customers`

* Retrieves a **list of all customers** stored in API database.
* Response status code should be **200**.
* Response body is of type **`Customer[]`**.
* It should always be successful (returns empty array if there are no
  customers).

### `POST /customers`

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

### `GET /customers/{id}`

* **Retrieves the customer targeted by specified `id`**.
* If request is successful, response status code is **200** and body contains
  the retrieved `Customer` resource.
* If request fails, response status code shoud be **404** because there is no
  customer with the specified `id`. The `Error` object included as response body
  should indicate this.

### `PUT /customers/{id}`

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

### `PATCH /customers/{id}`

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

### `DELETE /customers/{id}`

* **Deletes the customer targeted by specified `id`**.
* If request is successful, response status code is **204** and response
  contains no body.
* If request fails, response status code shoud be **404** because there is no
  customer with the specified `id`. The `Error` object included as response body
  should indicate this.
