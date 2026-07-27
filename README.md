# SkillMatrix (LMS) - Production Ready Enterprise Platform

SkillMatrix is an enterprise-grade Learning Management System (LMS) built with React, Vite, Node.js, Express, and MongoDB. It features RBAC Authentication, Course Management, Lesson Player, Enrollment, Progress Tracking, Admin Analytics Dashboard, Search & Discovery, Media Uploads, and Production Security Hardening.

---

## Completed Architecture Modules
- ✓ **Authentication & Security**: JWT access tokens, HttpOnly refresh cookies, session hashes, Bcrypt, Helmet CSP, CORS, rate limiting.
- ✓ **Course Management**: Course creation, metadata editing, difficulty levels, status publishing/archiving, thumbnail uploads.
- ✓ **Lesson Management**: Video lesson player, interactive syllabus, lesson ordering/reordering, free guest preview, resource attachments.
- ✓ **Enrollment System**: Student course enrollments, active learning portal, duplicate protection.
- ✓ **Progress Tracking**: Real-time course completion percentage calculation, lesson status tracking (`not_started`, `in_progress`, `completed`).
- ✓ **Admin Dashboard Analytics**: Real-time analytics overview cards, top enrolled courses, latest enrollments, student registrations, activity feed.
- ✓ **Search & Discovery**: Full-text search, multi-criteria filtering (category, level, tags), sorting (`most_enrolled`, `highest_completion`), popular & recommended course recommendation algorithms.
- ✓ **Media Management & Resources**: File uploads (`multer` streaming), storage provider abstraction (local disk default, Cloudinary/S3 adapter), PDF/ZIP resource attachments.
- ✓ **Production Hardening & DX**: Structured Pino logging, OpenAPI 3.0 specs, environment configuration templates, zero-warning ESLint enforcement.

---

## Tech Stack
- **Frontend**: React, Vite, React Router DOM, Tailwind CSS.
- **Backend**: Node.js, Express, Pino (Structured Logging), Mongoose (Database Connectivity), Zod (Validation), Multer (FileUploads).
- **Security**: Helmet, CORS, Express Rate Limit, Mongo Sanitize, Cookie Parser.
- **Testing**: Vitest, Supertest, MongoDB Memory Server.

---

## Folder Structure

```
SkillMatrix/
 ├── client/                # Frontend Application (React + Vite + Tailwind)
 │   ├── src/
 │   │   ├── components/    # Reusable UI components (FileUpload, ImagePreview, FilterBar, Pagination, etc.)
 │   │   ├── constants/     # System constants and routing definitions
 │   │   ├── context/       # Auth, Theme, and Toast context providers
 │   │   ├── hooks/         # Custom React hooks (useToast, useTheme, useAuth)
 │   │   ├── layouts/       # Role layouts (AdminLayout, StudentLayout, SharedLayout)
 │   │   ├── pages/         # Container page components (Catalog, Dashboard, CourseForm, LessonPlayer, MyLearning)
 │   │   ├── routes/        # App routing declarations, lazy loading, and route guards
 │   │   └── services/      # Axios API service bindings
 └── server/                # Backend API (Node.js + Express)
     ├── src/
     │   ├── config/        # Environment variables & schema configuration
     │   ├── constants/     # Domain enums & HTTP constants
     │   ├── controllers/   # REST API controllers
     │   ├── database/      # Mongoose database connection
     │   ├── errors/        # Custom operational error classes
     │   ├── logger/        # Pino structured logging
     │   ├── middlewares/   # Auth, validation, rate limiting, security, error handling
     │   ├── models/        # Mongoose schemas (User, Course, Lesson, Enrollment, Progress)
     │   ├── routes/        # Express REST route routers
     │   ├── services/      # Core business logic services
     │   ├── tests/         # Vitest integration test suite (71 tests passing)
     │   └── validators/    # Zod payload validation schemas
     └── public/uploads/    # Local media uploads storage directory
```

---

## Quick Setup Instructions

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the root workspace and `server/.env`:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```

3. **Run Development Mode**:
   ```bash
   npm run dev
   ```
   - Server runs at: `http://localhost:5000`
   - Client runs at: `http://localhost:5173`

4. **Execute Verification Commands**:
   ```bash
   npm run lint          # Run ESLint checks across workspace (0 errors)
   npm run build         # Build client production bundle
   npm test              # Run server integration test suite (71 passing tests)
   ```

---

## Detailed Documentation
- 📘 [API Specification (OpenAPI 3.0)](docs/openapi.yaml)
- 📐 [Architecture Overview](docs/ARCHITECTURE.md)
- 🚀 [Deployment Guide](docs/DEPLOYMENT.md)
- 📊 [Phase 11 Audit Report](docs/20_phase11_audit.md)
