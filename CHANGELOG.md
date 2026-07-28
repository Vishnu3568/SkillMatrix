# Changelog

All notable changes to the **SkillMatrix LMS** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-28 - Official Production Release

### Major Features Implemented
- **Authentication & RBAC**: Dual JWT token architecture (access tokens + HttpOnly refresh cookies), session revocation (`activeSessionHash`), Bcrypt password encryption, Zod body filters, and role-based route guards (`Admin`, `Student`).
- **Course Management**: Full Course CRUD, difficulty levels (`Beginner`, `Intermediate`, `Advanced`), publishing/archiving workflows, thumbnail uploads, and tag indexing.
- **Lesson Management**: Interactive video lesson player (supporting YouTube/Vimeo/Direct MP4 embeds), syllabus list with progress ticks, lesson ordering & reordering, free preview access.
- **Enrollment System**: Student self-enrollment, course access authorization, My Learning active dashboard.
- **Progress Tracking**: Automatic course completion percentage calculation, lesson status updates (`not_started`, `in_progress`, `completed`), progress bars across views.
- **Admin Dashboard & Analytics**: Real-time summary metrics, top enrolled courses, recent enrollments timeline, newly registered students, real-time activity feed.
- **Search, Discovery & UX**: MongoDB text and compound query indexing, multi-criteria filters, active filter chips, paginated grid layouts, popular courses, personalized recommendations, and continue learning hero cards.
- **Media Management & Course Resources**: Storage provider abstraction (`LocalStorageProvider`), `multer` memory buffer validation, PDF/ZIP resource attachments, image preview & replacement.
- **Production Readiness & Operations**: Docker multi-stage containerization, Docker Compose orchestration, Nginx static asset proxying, GitHub Actions CI/CD automation, `GET /health` monitoring endpoint, SIGTERM/SIGINT graceful shutdown handlers, OpenAPI 3.0 specs, zero ESLint warnings, and 74 passing integration tests.

### Security & Hardening
- Helmet security headers with custom Content Security Policy (CSP).
- CORS policy restricting origins to trusted frontend domains.
- Dedicated authentication rate limiters (`authLimiter`).
- Production error handler suppressing stack traces and sensitive database outputs.

### Testing Metrics
- 74 Vitest integration tests passing 100%.
- 0 ESLint warnings or errors across server and client workspaces.
