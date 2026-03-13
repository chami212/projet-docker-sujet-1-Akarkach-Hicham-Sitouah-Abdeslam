# Microservices from Scratch - JS/Next.js

This repo contains a simple e-commerce platform with 3 APIs, an Nginx gateway, and a Next.js frontend.

## Services

- Gateway (Nginx) on port 80
- Users API on port 5001 (internal)
- Products API on port 5002 (internal)
- Orders API on port 5003 (internal)
- Frontend (Next.js) on port 3000
- Postgres DB per service

## Run

1. Ensure Docker is running.
2. Start everything:

```bash
docker compose up --build
```

## Access

- Frontend: http://localhost:3000
- Gateway base: http://localhost

Example:

- http://localhost/api/users
- http://localhost/api/products
- http://localhost/api/orders

## Environment

Edit `.env` to change database names or credentials.

## Docs

- Architecture: `docs/architecture.md`
- API: `docs/api.md`