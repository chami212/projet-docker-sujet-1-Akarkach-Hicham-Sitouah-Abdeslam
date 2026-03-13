# API Documentation

Base URL (via gateway): `http://localhost` on port 80.

All API routes are under `/api` on the gateway.

## Users

- GET `/api/users`
- GET `/api/users/{id}`
- POST `/api/users`
- PUT `/api/users/{id}`
- DELETE `/api/users/{id}`
- POST `/api/users/login`
- GET `/api/users/health`

Payload example (create user):

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret"
}
```

## Products

- GET `/api/products`
- GET `/api/products/{id}`
- POST `/api/products`
- PUT `/api/products/{id}`
- DELETE `/api/products/{id}`
- GET `/api/products/health`

Payload example (create product):

```json
{
  "name": "Keyboard",
  "price": 99.90,
  "stock": 10
}
```

## Orders

- GET `/api/orders`
- GET `/api/orders/{id}`
- GET `/api/orders/user/{user_id}`
- POST `/api/orders`
- GET `/api/orders/health`

Payload example (create order):

```json
{
  "user_id": 1,
  "product_id": 2,
  "quantity": 3
}
```

## Notes

- Orders service calls Products service to validate product, check stock, compute total, and decrement stock.
- Only the gateway is exposed externally; APIs are internal.