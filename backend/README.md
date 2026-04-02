# Fintrix Backend

Production-ready Finance Data Processing and Access Control backend built with Node.js, Express, and MongoDB.

## Features

- JWT access tokens + refresh token rotation
- Role-based access control (`viewer`, `analyst`, `admin`)
- User lifecycle management (create, assign role, activate/deactivate, soft delete)
- Financial record CRUD with filters, regex search, pagination, sorting
- Soft delete + trash + restore for records
- Dashboard analytics using MongoDB aggregations
- Advanced analytics (ratio, top categories, weekly vs monthly, average value)
- Optional AI-generated financial insight (Groq) with safe fallback summary
- Audit logging for critical actions
- Rate limiting, validation, centralized error handling
- Swagger API documentation
- Deployable on Render/Railway

## Folder Structure

```text
backend/
  api/
    index.js
  config/
    db.js
  controllers/
    authController.js
    dashboardController.js
    recordController.js
  middleware/
    auth.js
    rbac.js
    validate.js
  models/
    AuditLog.js
    FinancialRecord.js
    RefreshToken.js
    User.js
  routes/
    authRoutes.js
    dashboardRoutes.js
    recordRoutes.js
  services/
    aiService.js
    auditService.js
    authService.js
    dashboardService.js
    recordService.js
    userService.js
  utils/
    AppError.js
    catchAsync.js
    swagger.js
  validations/
    authValidation.js
    recordValidation.js
  tests/
    authValidation.test.js
    record.test.js
    recordService.test.js
  app.js
  server.js
  package.json
```

## Environment Variables

Create a root `.env` (one level above `backend/`) with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE_DAYS=7
NODE_ENV=development
PUBLIC_API_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5173
GROQ_API_KEY=optional_groq_api_key
```

## Run Locally

```bash
npm install
npm --prefix backend run dev
```

Run tests:

```bash
npm test
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/logout-all`
- `GET /api/auth/me`
- `POST /api/auth/users` (admin)
- `GET /api/auth/users` (admin)
- `PUT /api/auth/users/:id` (admin)
- `DELETE /api/auth/users/:id` (admin)

### Records

- `GET /api/records`
- `GET /api/records/export?format=csv|json`
- `GET /api/records/:id`
- `POST /api/records` (admin)
- `PUT /api/records/:id` (admin)
- `DELETE /api/records/:id` (admin, soft delete)
- `GET /api/records/trash` (admin)
- `PATCH /api/records/:id/restore` (admin)

### Dashboard

- `GET /api/dashboard/summary` (analyst/admin)
- `GET /api/dashboard/insights` (analyst/admin)

### Health & Docs

- `GET /api/health`
- `GET /api-docs`

## Deployment Notes (Render/Railway)

- Entry point: `backend/server.js`
- Start command: `npm --prefix backend run start`
- Build command: `npm install`
- The server port is dynamic:

```js
const PORT = process.env.PORT || 5000;
```

- Server starts only after MongoDB connection is established.
- Set all environment variables in Render/Railway dashboard.

## Design Decisions

- Soft delete ensures recoverability and safer operations.
- Refresh tokens are stored hashed for security.
- Token versioning supports global logout.
- Aggregations are done in MongoDB for performance and scalability.
- Audit logs are isolated so failures do not block business operations.
