# SkillMatrix (LMS) - Project Foundation

SkillMatrix is a production-grade Learning Management System (LMS) built with React, Express, Node.js, and MongoDB.

---

## Tech Stack
- **Frontend**: React, Vite, React Router DOM, Vanilla CSS.
- **Backend**: Node.js, Express, Pino (Structured Logging), Mongoose (Database Connectivity), Zod (Data Validation).
- **Security**: Helmet, CORS, Express Rate Limit, Mongo Sanitize, Cookie Parser.
- **Testing**: Vitest, Supertest, MongoDB Memory Server, Playwright.

---

## Folder Structure

```
SkillMatrix/
 ├── client/                # Frontend Application (React + Vite)
 │   ├── src/
 │   │   ├── assets/        # Static assets
 │   │   ├── components/    # Reusable UI components
 │   │   ├── constants/     # Routing paths and system UI constants
 │   │   ├── context/       # Global state providers
 │   │   ├── hooks/         # Custom hooks
 │   │   ├── layouts/       # Main navigation layout
 │   │   ├── pages/         # Container page components (Home, NotFound)
 │   │   ├── routes/        # Route declarations and route guards
 │   │   ├── services/      # Axios/fetch clients
 │   │   └── utils/         # Front helpers
 │   └── index.html
 └── server/                # Backend API (Node.js + Express)
     ├── src/
     │   ├── config/        # Environment configurations
     │   ├── constants/     # Reusable domain constants (roles, statuses)
     │   ├── database/      # Mongoose connections and retry strategies
     │   ├── errors/        # Custom error classes (validation, authorization)
     │   ├── logger/        # Pino structured logger configuration
     │   ├── middlewares/   # Express security / logging / error handlers
     │   ├── responses/     # Standardized JSON response formatting
     │   └── utilities/     # Pure utility algorithms (slugs, dates, URLs)
     └── server.js          # Server bootstrap entry point
```

---

## Environment Variables

Create a `/server/.env` file based on `/server/.env.example`:

| Variable Name | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | Local network port for Express server. | `5000` |
| `NODE_ENV` | Running node mode environment. | `development` |
| `MONGODB_URI` | Connection URI for the MongoDB database. | `mongodb://127.0.0.1:27017/skillmatrix` |
| `JWT_ACCESS_SECRET` | Secret key for signing Access Tokens. | `your_access_secret` |
| `JWT_REFRESH_SECRET`| Secret key for signing Refresh Tokens. | `your_refresh_secret` |
| `CLIENT_URL` | Trusted CORS origins allowed to access backend. | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary account cloud identifier name. | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API access key. | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret authorization key. | `your_api_secret` |
| `RATE_LIMIT_WINDOW` | Milliseconds window for IP request counting. | `900000` (15 minutes) |
| `RATE_LIMIT_MAX` | Max requests allowed per IP within the window. | `100` |

---

## Setup Instructions

1. **Workspace Installation**:
   Install all dependencies from the root directory:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Duplicate `/server/.env.example` to `/server/.env` and edit values.

3. **Start Development Servers**:
   - Start backend: `npm run dev:server` (running on http://localhost:5000)
   - Start frontend: `npm run dev:client` (running on http://localhost:5173)

---

## Development Commands

- `npm run dev`: Boots both server and client development workers.
- `npm run lint`: Validates files across both projects using ESLint rules.
- `npm run format`: Formats code throughout the codebase using Prettier rules.
- `npm run build`: Packages both applications for production distribution.

---

## Future Roadmap
- **Phase 2**: Authentication & Registration Portal (JWT + cookie token management).
- **Phase 3**: Course catalog discovery, file uploads, and content schemas.
- **Phase 4**: Enrollment logs and course administration controls.
- **Phase 5**: Video lesson viewer and player progress logging.
- **Phase 6**: Analytical tracking charts and reporting panels.
