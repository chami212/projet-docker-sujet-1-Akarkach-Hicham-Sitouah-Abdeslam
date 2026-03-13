# Architecture

Plateforme e-commerce simple en microservices, orchestrée avec Docker Compose.

## Schéma (Mermaid)

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

## Réseaux

- `ecommerce-network` relie gateway, frontend et APIs.
- `users-db-net`, `products-db-net`, `orders-db-net` isolent chaque base.
