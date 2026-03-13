# Documentation API

Base (via gateway) : `http://localhost` (port 80).
Toutes les routes passent par `/api`.

## Users

- GET `/api/users`
- GET `/api/users/{id}`
- POST `/api/users`
- PUT `/api/users/{id}`
- DELETE `/api/users/{id}`
- POST `/api/users/login`
- GET `/api/users/health`

Exemple (create user) :

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

Exemple (create product) :

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

Exemple (create order) :

```json
{
  "user_id": 1,
  "product_id": 2,
  "quantity": 3
}
```

## Notes

- Orders appelle Products pour verifier le produit, le stock, calculer le total et decrementer le stock.
- Seul le gateway est expose; les APIs restent internes.