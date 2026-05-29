# Postman — Learning User API

## Import

1. Open Postman → **Import**
2. Select both files in this folder:
   - `Learning-User-API.postman_collection.json`
   - `Learning-User-Local.postman_environment.json`
3. Choose environment **Learning User - Local** (top-right)

## Start APIs first

```bash
npm run backend:users      # http://localhost:4000
npm run backend:products   # http://localhost:4001
```

## Quick flow

1. **Users API → Auth → Login** — saves `token` automatically
2. **Products API → Products → List Products** — saves `productId`
3. **Users API → Product Selections → Save My Selected Products**

## Environment variables

| Variable | Default |
|----------|---------|
| `usersApiBase` | `http://localhost:4000/api` |
| `productsApiBase` | `http://localhost:4001/api` |
| `adminEmail` | `admin@acme.test` |
| `adminPassword` | `admin123` |
| `token` | Set by Login request |
| `userId` | Set by List/Create User |
| `productId` | Set by List Products |

## Collection structure

- **Users API (4000)** — Health, Auth, Users CRUD, Product Selections, Admin Toggles
- **Products API (4001)** — Health, Products list & get by ID

All authenticated requests use **Bearer Token** (`{{token}}`) from collection auth.
