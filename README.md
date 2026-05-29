# User Management Practice App (UI + API Testing)

Lightweight full-stack **User Management** application for practicing **UI testing** and **API testing** using tools like **Playwright externally** (Playwright is intentionally **not** included in this repo).

Created by **Vaibhav Singh** — LinkedIn: `https://www.linkedin.com/in/vaibhav-singh-debugger/`

## Folder structure

```plaintext
frontend/   # React + Vite + TailwindCSS + Axios
backend/    # Users API (auth + users + saved product selections) - port 4000
backend-products/ # Products API (products only) - port 4001
postman/    # Postman collection + local environment
README.md
```

## Quick start (no Docker)

From the repo root:

```bash
npm install
npm run backend:users
```

In a second terminal:

```bash
npm run backend:products
npm run frontend
```

- Frontend: `http://localhost:5173`
- Users API: `http://localhost:4000`
- Products API: `http://localhost:4001`

### Windows / install errors

If `npm install` fails at **postinstall**, pull the latest code (uses `scripts/install-all.js` instead of `&&` chains).

**Manual install** (works on all OS):

```bash
cd backend && npm install && cd ..
cd backend-products && npm install && cd ..
cd frontend && npm install && cd ..
```

Or from repo root:

```bash
npm run install:packages
```

Skip postinstall if needed:

```bash
set SKIP_POSTINSTALL=1
npm install
npm run install:packages
```

(PowerShell: `$env:SKIP_POSTINSTALL=1`)

**Node.js:** use **v20.19+** or **v22+** (required by Vite). Check with `node -v`.

## Sample login credentials

- **Email**: `admin@acme.test`
- **Password**: `admin123`

You can change these in `backend/.env`.

## Environment variables

### Backend (`backend/.env`)

Copy from `backend/.env.example` if needed.

- **PORT**: backend port (default `4000`)
- **CLIENT_ORIGIN**: frontend origin for CORS (default `http://localhost:5173`)
- **JWT_SECRET**: secret for signing JWTs
- **JWT_EXPIRES_IN**: token expiry (example: `10m`)
- **ADMIN_EMAIL / ADMIN_PASSWORD**: hardcoded admin credentials

Testing-friendly toggles (runtime behavior):

- **SIMULATE_NETWORK_DELAY_ENABLED**: `true|false`
- **SIMULATE_NETWORK_DELAY_MS_MIN / MAX**: delay range
- **RANDOM_FAILURES_ENABLED**: `true|false`
- **RANDOM_FAILURE_RATE**: 0..1
- **SESSION_TIMEOUT_ENABLED**: `true|false`
- **SESSION_TIMEOUT_MAX_REQUESTS**: forces `401` after N authenticated requests (per token)

### Frontend (`frontend/.env`)

Copy from `frontend/.env.example` if needed.

- **VITE_API_BASE_URL**: backend API base (default `http://localhost:4000/api`)

## API endpoints (REST)

Users API base URL: `http://localhost:4000/api`  
Products API base URL: `http://localhost:4001/api`

### Auth

- **POST** `/auth/login`
- **POST** `/auth/logout`

### Users

- **GET** `/users` (supports search, filters, pagination, sorting)
  - Query params:
    - `page`, `pageSize`
    - `q` (search)
    - `role`, `status` (filters)
    - `sortBy` (`createdAt|firstName|lastName|email|role|status`)
    - `sortDir` (`asc|desc`)
- **GET** `/users/:id`
- **POST** `/users`
- **PUT** `/users/:id`
- **DELETE** `/users/:id`
- **POST** `/users/bulk-delete`

### Product selections (saved in Users API)

- **GET** `/me/selected-products`
- **PUT** `/me/selected-products`

### Products (Products API)

- **GET** `/products` (supports search, filters, pagination, sorting)
- **GET** `/products/:id`

### Admin toggles (testing-friendly)

Protected by auth:

- **GET** `/admin/toggles`
- **PUT** `/admin/toggles`

Example toggle request:

```bash
curl -X PUT http://localhost:4000/api/admin/toggles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"randomFailuresEnabled": true, "randomFailureRate": 0.2}'
```

## Testing-friendly behaviors included

- **Dynamic IDs**: users have UUID ids
- **Debounced search**: 400ms debounce
- **Loading states**: spinner + skeleton rows
- **Empty state** and **error state** screens
- **Toast notifications**: success / error / warning
- **Disabled buttons during API calls**
- **Random API failures** (toggle)
- **Network delay simulation** (toggle)
- **Session timeout simulation** (toggle + JWT expiry)
- **Retry API logic** in the frontend Axios layer for retryable failures (like 503)

## Postman

Import from the `postman/` folder:

- `Learning-User-API.postman_collection.json`
- `Learning-User-Local.postman_environment.json`

See `postman/README.md` for import steps and variable reference.

## NPM commands

From the repo root:

- `npm install`: install root dependencies (and you can run `npm run install:all` to install all)
- `npm run backend` / `npm run backend:users`: start Users API (port 4000)
- `npm run backend:products`: start Products API (port 4001)
- `npm run frontend`: start frontend (Vite dev server)

## Author

Created by **Vaibhav Singh**  
LinkedIn: `https://www.linkedin.com/in/vaibhav-singh-debugger/`

