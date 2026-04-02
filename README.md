# Fintrix (Frontend + Backend)

Fintrix is a full-stack finance management application with a secure backend (Node.js/Express/MongoDB) and a modern frontend (React/Vite).

## Deployed Link
- Live:


## Implemented Frontend Features

### 1. Modern UI and UX
- Elegant dashboard-style interface with polished spacing, typography, and card hierarchy.
- Consistent light-mode design across login and app screens.
- Reusable UI patterns for forms, cards, tables, and controls.

### 2. Authentication Flow (Client Side)
- Login and register screen with validation feedback.
- Protected routes and public route redirection behavior.
- JWT token-based session handling through app auth context.

### 3. Core Screens
- Login/Register page.
- Dashboard with KPIs, insights, and charts.
- Records page with filters, search, pagination, and CRUD modal flows.
- Users page (admin) with role/status management.

### 4. Data Visualization and Interactions
- Monthly trends and category breakdown charts.
- Smooth animation flow for page transitions and list/card reveals.
- Responsive layout for desktop and mobile.

### 5. Frontend Architecture
- React component-driven structure.
- Context-based auth state management.
- API abstraction layer for backend communication.


## Implemented Backend Features

### 1. Authentication and Authorization
- JWT authentication for protected APIs.
- Password hashing with bcrypt.
- Role-based access control (RBAC):
    - `Admin`: user management + full record access.
    - `Analyst`: create/read records + dashboard insights.
    - `Viewer`: read-only finance access.
- Inactive users are blocked from authenticated access.

### 2. Records API
- Create, read, update, soft-delete financial records.
- Filtering support:
    - `type`, `category`, `startDate`, `endDate`.
- Pagination support:
    - `page`, `limit` using `skip` and `limit`.
- Search support:
    - Case-insensitive regex search across `category` and `description`.

### 3. User Management API (Admin)
- List users with:
    - pagination (`page`, `limit`)
    - filtering (`role`, `status`)
    - keyword search (`search`) over name/email
- Update user role/status.
- Soft-delete user accounts.

### 4. Soft Delete Strategy
- Implemented for both records and users via `isDeleted`.
- Query middleware automatically excludes soft-deleted documents from reads.

### 5. Security and Stability
- Helmet for secure HTTP headers.
- CORS enabled.
- Rate limiting with two layers:
    - stricter limiter on `/api/auth`
    - general limiter on `/api`
- Centralized global error handler.
- Zod-based request validation for body/query/params.

### 6. Dashboard and Insights
- Summary endpoint for:
    - total income
    - total expenses
    - net balance
    - recent transactions
- Insights endpoint for:
    - category breakdown
    - monthly trends
    - generated financial insight text

### 7. API Documentation
- Swagger UI integrated and available at:
    - `http://localhost:5000/api-docs`
- Route-level Swagger annotations included for auth, records, and dashboard APIs.
- Postman collection included:
    - `docs/Fintrix.postman_collection.json`

### 8. Testing
- Jest + Supertest setup.
- Unit tests included for:
    - record service pagination/search/soft-delete behavior
    - auth validation schemas
    - unauthorized records route access

## Tech Stack
- Frontend:
    - React + Vite
    - Tailwind CSS
    - Framer Motion
    - Recharts
    - Axios
- Backend:
    - Node.js
    - Express.js
    - MongoDB + Mongoose
    - JWT (`jsonwebtoken`)
    - Zod validation
    - Swagger (`swagger-ui-express`, `swagger-jsdoc`)
    - Jest + Supertest

## Project Structure

### Frontend
- `src/pages/`: main application pages (Login, Dashboard, Records, Users)
- `src/components/`: reusable UI components and layout
- `src/context/`: auth context and state handling
- `src/services/`: API integration layer

### Backend
- `routes/`: route definitions + middleware wiring
- `controllers/`: request orchestration
- `services/`: business logic and DB operations
- `models/`: Mongoose schemas + query middleware
- `middleware/`: auth, RBAC, validation
- `validations/`: Zod schemas
- `tests/`: unit and API behavior tests

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Install
```bash
npm install
```

### Environment Variables (`.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
NODE_ENV=development

# Frontend deployment (Vercel)
# Example: https://your-backend-domain.com
VITE_API_BASE_URL=your_backend_base_url

# Backend CORS allowlist (comma separated)
# Example: https://your-frontend.vercel.app,https://your-custom-domain.com
CORS_ORIGIN=your_frontend_origin
```

### Run
```bash
# Run frontend + backend in development (from package scripts)
npm run dev

# Tests
npm test

# Frontend production build
npm run build
```

## Notes
- Frontend and backend are integrated through the `/api` proxy setup in Vite for local development.
- In production (Vercel), set `VITE_API_BASE_URL` in Vercel environment variables so signup/login calls reach your live backend.
- Soft delete is used instead of hard delete for audit safety.
- Service layer keeps controllers slim and testable.
- Validation is performed before controller execution for predictable API errors.

## One-Go Vercel Deployment (Frontend + Backend)

This repository is configured for a single Vercel project deployment:
- React frontend is served from static build output (`dist`).
- Express backend runs as a Vercel serverless function via `api/index.js`.
- API routes (`/api/*`) and docs (`/api-docs`) are routed to the backend function.

### Steps
1. Import this repository into Vercel as one project.
2. Add environment variables in Vercel Project Settings:
    - `MONGODB_URI`
    - `JWT_SECRET`
    - `JWT_EXPIRE`
    - `NODE_ENV=production`
    - `CORS_ORIGIN=https://your-project.vercel.app`
    - `VITE_API_BASE_URL=https://your-project.vercel.app`
3. Deploy.

After deploy:
- Frontend: `https://your-project.vercel.app`
- Backend API: `https://your-project.vercel.app/api/...`
- Swagger: `https://your-project.vercel.app/api-docs`
