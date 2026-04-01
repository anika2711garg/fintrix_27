# Fintrix: Professional Finance Data Backend

A high-performance, secure, and scalable finance data processing backend built with Node.js, Express, and MongoDB. This project demonstrates clean architecture, role-based access control (RBAC), and professional-grade API design.

## 🚀 Features

*   **Secure Authentication**: JWT-based auth with robust password hashing (bcrypt).
*   **Role-Based Access Control (RBAC)**:
    *   `Admin`: Full CRUD access and user management.
    *   `Analyst`: Read access + dashboard insights.
    *   `Viewer`: Read-only access to records.
*   **Financial Records Management**: CRUD with advanced filtering (date, type, category) and regex-based search.
*   **Dashboard Aggregation**: High-performance MongoDB pipelines for totals, monthly trends, and category-wise breakdowns.
*   **Data Integrity**: **Soft Delete** implementation for all transactional and user data.
*   **Production-Ready**: Rate limiting, security headers (Helmet), input validation (Zod), and global error handling.
*   **Interactive Documentation**: Live Swagger UI for API exploration.

## 🛠️ Tech Stack

*   **Core**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose)
*   **Validation**: Zod
*   **Auth**: JSON Web Tokens (JWT)
*   **Documentation**: Swagger JSDoc & UI
*   **Testing**: Jest & Supertest

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation
1.  Clone the repository and enter the `Fintrix` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables in `.env`:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=24h
    NODE_ENV=development
    ```

### Running the App
```bash
# Start development (with nodemon)
npm run dev

# Run tests
npm test
```

## 📄 API Documentation
Once the server is running, visit:
`http://localhost:5000/api-docs`

## 🏗️ Architecture Design
-   **Routes**: Definition of endpoints and middleware assignments.
-   **Controllers**: Handling requests and defining the orchestration.
-   **Services**: Core business logic and database interactions.
-   **Models**: Data schemas with Mongoose and query middleware.
-   **Middleware**: Custom logic for Auth, RBAC, and Validation.

## ⚙️ Design Decisions & Trade-offs
-   **Soft Delete**: Implemented to prevent accidental data loss and facilitate audit logs, at the cost of slightly more complex query logic.
-   **Service Layer**: Decouples business logic from controllers, making the codebase easier to test and maintain.
-   **Zod Validation**: Used over Mongoose validation for incoming requests to fail fast and provide cleaner error messages to the client.
