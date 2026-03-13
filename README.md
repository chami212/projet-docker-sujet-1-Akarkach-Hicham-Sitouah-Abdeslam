# Microservices from Scratch - JS/Next.js

Plateforme e-commerce simple avec 3 APIs, un gateway Nginx et un frontend Next.js.

## Services

- Gateway (Nginx) : port 80
- Users API : 5001 (interne)
- Products API : 5002 (interne)
- Orders API : 5003 (interne)
- Frontend (Next.js) : 3000
- 1 base Postgres par service

## Lancement

```bash
docker compose up --build
```

## Accès

- Frontend : http://localhost:3000
- API (via gateway) : http://localhost

Exemples :

- http://localhost/api/users
- http://localhost/api/products
- http://localhost/api/orders

## Env

Modifie `.env` si besoin.

## Docs

- Architecture : `docs/architecture.md`
- API : `docs/api.md`
