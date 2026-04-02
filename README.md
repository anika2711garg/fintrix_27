# Fintrix Backend

This repository is now backend-only.

The backend is a production-ready Finance Data Processing and Access Control API built with Node.js, Express, and MongoDB.

## Where to Start

- Backend documentation: backend/README.md
- API base route: /api
- Health check: /api/health
- Swagger docs: /api-docs

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Deploy (Render/Railway)

- Build command: npm --prefix backend install
- Start command: npm --prefix backend run start
- Required env vars: MONGODB_URI, JWT_SECRET, JWT_EXPIRE, JWT_REFRESH_EXPIRE_DAYS, CORS_ORIGIN, NODE_ENV, PORT

The app uses:

```js
const PORT = process.env.PORT || 5000;
```

and only starts listening after a successful MongoDB connection.
