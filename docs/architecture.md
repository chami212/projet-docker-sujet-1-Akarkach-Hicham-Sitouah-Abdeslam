# Architecture

This project is a simple e-commerce platform using a microservices architecture with Docker Compose.

## Diagram (Mermaid)

```mermaid
graph TD
  Client[Client / Browser / Curl] -->|HTTP :80| Gateway[Nginx API Gateway]
  Client -->|HTTP :3000| Frontend[Next.js Frontend]

  Gateway --> Users[Users API :5001]
  Gateway --> Products[Products API :5002]
  Gateway --> Orders[Orders API :5003]

  Users --> UsersDB[(Postgres Users)]
  Products --> ProductsDB[(Postgres Products)]
  Orders --> OrdersDB[(Postgres Orders)]

  subgraph ecommerce-network
    Gateway
    Users
    Products
    Orders
    Frontend
  end

  subgraph users-db-net
    UsersDB
  end

  subgraph products-db-net
    ProductsDB
  end

  subgraph orders-db-net
    OrdersDB
  end
```

## Networks

- `ecommerce-network` connects gateway, frontend, and APIs.
- `users-db-net`, `products-db-net`, `orders-db-net` are internal networks, isolating each database.