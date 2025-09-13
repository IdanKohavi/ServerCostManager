# Cost Manager API

web service built with **Node.js**, **Express**, and **MongoDB (via Mongoose)** for managing and tracking user expenses.


## Features

- Add new cost items
- Get a monthly report grouped by category

## Running the Server

```bash
npm start
```


## Testing

The project includes comprehensive test coverage using Python and Pytest. Tests cover:
- User operations (retrieval, validation)
- Cost management (addition, validation)
- Report generation
- API error handling
- Data validation

To run the tests:
```bash
npm start

```

## API Endpoints

| Method | Route             | Description                             |
|--------|------------------|-----------------------------------------|
| POST   | `/api/add`        | Add a new cost item                     |
| GET    | `/api/report`     | Get costs for user by month & year      |
| GET    | `/api/users/:id`  | Get user details and total costs        |
| GET    | `/api/about`      | Get development team info               |



---

Feel free to explore and contribute once the project is completed!
