# Backend & Frontend Architecture Plan

This document outlines the directory structure and architectural design for both the backend and frontend components of **SkillMatrix**. The layout follows industry-standard design patterns to ensure strict separation of concerns, scalability, and clean code.

---

## 1. Backend Architecture (MVC Pattern)

The backend is structured around a decoupled Model-View-Controller (MVC) architecture, where the "View" is replaced by JSON response payloads sent to the React frontend. A dedicated **Service Layer** sits between the Controllers and Models to encapsulate business logic.

### Directory Structure
```
backend/
├── src/
│   ├── config/             # Application environment & configuration files
│   ├── controllers/        # Express controllers (request extraction & response routing)
│   ├── db/                 # Database initialization & mongoose configuration
│   ├── middlewares/        # Express custom middlewares (security, logging, auth)
│   ├── models/             # Mongoose schemas & data models
│   ├── routes/             # API routing tables (HTTP verb to controller mapping)
│   ├── services/           # Service layer containing core business logic & db operations
│   ├── utils/              # Helper utilities, response formatters, custom errors
│   └── validators/         # Input validation schemas (Joi or express-validator)
├── .env.example            # Environment variables placeholder
├── package.json            # Node project configuration
└── server.js               # Application entry point
```

### Folder Responsibilities

#### `src/config/`
Manages system configuration. Centralizes access to environment variables, API keys, JWT expiration settings, and CORS options. Prevents hardcoding of configuration values across the codebase.

#### `src/controllers/`
Orchestrates requests and responses. Controllers extract incoming client data (params, query, body), delegate execution to the appropriate service, and return JSON responses. They do *not* contain business logic or direct database queries.

#### `src/db/`
Handles database connectivity. Houses the MongoDB connection setup using Mongoose, connection pool configurations, and logic for database reconnection, seeding, and graceful shutdown.

#### `src/middlewares/`
Houses custom middleware functions. Includes authentication checks (JWT verification), authorization guards (role checking), logging (morgan/winston setup), rate-limiting middleware, security headers (Helmet), and the global error-handling handler.

#### `src/models/`
Defines the Mongoose database schemas, pre/post-save middleware hooks (such as password hashing), validation constraints, virtual fields, and index structures.

#### `src/routes/`
Declares Express router paths. Groups routes logically by entity (e.g., `/api/v1/users`, `/api/v1/courses`). This layer binds URL endpoints and HTTP methods to validation middleware and controllers.

#### `src/services/`
The business logic core of the application. Services interact with the MongoDB database using Mongoose models. By isolating DB queries and business algorithms inside services, controllers remain lean and testing is highly simplified.

#### `src/utils/`
Contains global helper classes, date formatters, token generators, custom error definitions (like `AppError`, `NotFoundError`, `UnauthorizedError`), and logger initializations.

#### `src/validators/`
Implements runtime data validation schemas (e.g., using Joi). Validates request bodies, parameters, and query strings before controllers execute, ensuring incoming data satisfies constraints.

---

## 2. Frontend Architecture (React)

The frontend is modular, using reusable UI atomic units, page-level routing components, custom hooks, and centralized state contexts to maintain structure as the client application grows.

### Directory Structure
```
frontend/
├── src/
│   ├── assets/             # Static assets (images, logos, global styles)
│   ├── components/         # Shared components used across multiple pages
│   │   ├── common/         # Layout shells (Navbar, Sidebar, Footer, Loaders)
│   │   └── ui/             # Reusable atomic UI elements (Buttons, Inputs, Modals)
│   ├── constants/          # Application constants (endpoints, roles, routes)
│   ├── context/            # React contexts for global state management (Auth)
│   ├── hooks/              # Custom React hooks (useAuth, useFetch)
│   ├── layouts/            # Layout wraps (AuthLayout, AdminLayout, StudentLayout)
│   ├── pages/              # Page-level containers (Dashboard, CourseView, Login)
│   ├── routes/             # Routing configuration, protected route components
│   ├── services/           # API interaction layer (axios wrappers)
│   └── utils/              # Client utility functions (date formatters, token storage)
├── index.html              # Shell HTML template
├── package.json            # React project dependencies
└── vite.config.js          # Build configuration (Vite)
```

### Folder Responsibilities

#### `src/assets/`
Contains design assets, including icons, illustrations, default profile images, global CSS/SCSS themes, and font files.

#### `src/components/common/`
Maintains structural visual elements shared globally, such as the application shell, navigation bars, side drawer menus, footers, and page loading spinners.

#### `src/components/ui/`
Atom-level design system elements (e.g., `Button`, `TextField`, `Modal`, `Alert`, `Badge`, `Skeleton`). These are highly reusable, uncoupled from state, and style-consistent.

#### `src/constants/`
Defines compile-time configurations, such as client path routes (e.g., `DASHBOARD_ROUTE`), API endpoints, role strings (`ADMIN`, `STUDENT`), and error status constants.

#### `src/context/`
Manages global shared state. Holds React contexts for authentication (`AuthContext`) and notifications (`NotificationContext`), providing them down the tree without prop-drilling.

#### `src/hooks/`
Contains custom React hooks to encapsulate page-level state logic (e.g., handling form submissions, fetching paginated data, retrieving media queries, or invoking local storage).

#### `src/layouts/`
Defines wrapper layout skeletons. Resolves how headers, sidebars, and main content panel view templates wrap page-level components depending on role authorization.

#### `src/pages/`
Page containers that are directly mapped to router endpoints. They compose atomic UI components and contexts, initiate data fetches via service modules on load, and manage local view states.

#### `src/routes/`
Defines client router configs (e.g., React Router DOM tree). Implements guards (e.g., `ProtectedRoute`, `AdminRoute`) that inspect user auth/roles before rendering requested routes.

#### `src/services/`
Contains Axios or Fetch clients mapped directly to backend REST endpoints (e.g., `authService.js`, `courseService.js`). Handles HTTP request interception (injecting bearer tokens) and response normalization.

#### `src/utils/`
Contains browser-specific helpers, token parsing functions, local storage controllers, validation helper regexes, and data transform utilities.
