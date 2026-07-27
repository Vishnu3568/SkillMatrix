# SkillMatrix LMS Architecture Guide

This document outlines the high-level system architecture, design patterns, security principles, and data flow of the SkillMatrix LMS platform.

---

## 1. System Overview

SkillMatrix is structured as a decoupled full-stack Web application:
- **Client**: React 18 single-page application built with Vite and Tailwind CSS. Communicates with the backend REST API via Axios.
- **Server**: Node.js & Express application adhering to layered service-oriented architecture (Routes -> Middlewares -> Validators -> Controllers -> Services -> Data Access / Models).
- **Database**: MongoDB document database managed via Mongoose ODM.

---

## 2. Key Architectural Patterns

### A. Layered Architecture
- **Controllers**: Thin request handlers responsible ONLY for parsing inputs, calling service methods, and sending HTTP responses.
- **Services**: Encapsulate all business logic, database transactions, authorization checks, and calculation algorithms.
- **Validators**: Zod validation schemas executed as Express middleware before controller invocation.

### B. Storage Provider Abstraction (Adapter Pattern)
- `LocalStorageProvider` handles local file storage in `server/public/uploads`.
- Implements `saveFile()`, `deleteFile()`, and `getFileUrl()` interface, allowing seamless replacement with Cloudinary or Amazon S3 in cloud deployments without touching route code.

### C. Security Hardening & RBAC
- **Authentication**: Dual-token JWT architecture (short-lived Access Tokens in Authorization header, rotated Refresh Tokens in HttpOnly cookies).
- **Session Revocation**: `activeSessionHash` tracking on User model enables immediate global logout and token invalidation upon security breach.
- **RBAC**: Middleware guards (`authorize(ROLES.ADMIN)`, `authorize(ROLES.STUDENT)`) enforce strict access boundaries.

---

## 3. Data Schema Relationships

```
┌──────────┐        1:N        ┌──────────┐        1:N        ┌──────────┐
│   User   ├──────────────────►│  Course  ├──────────────────►│  Lesson  │
└────┬─────┘                   └────┬─────┘                   └──────────┘
     │                              │
     │ 1:N                          │ 1:N
     ▼                              ▼
┌──────────┐                   ┌──────────┐
│Enrollment│                   │ Progress │
└──────────┘                   └──────────┘
```

- **Course**: Contains metadata, tags, difficulty level, category, and status (`draft`, `published`, `archived`).
- **Lesson**: Belongs to Course. Contains ordering, video URL, duration, free preview flag, and downloadable resource attachments.
- **Enrollment**: Links Student to Course (`studentId`, `courseId`).
- **Progress**: Tracks student completion status for individual lessons and calculates overall course completion percentage.

---

## 4. Performance & Query Strategy
- Read-heavy queries employ `.lean()` for high-throughput JSON serialization.
- Aggregation pipelines (`$lookup`, `$facet`, `$project`) power discovery endpoints (`/popular`, `/recommended`, `/recent-learning`) without N+1 query overhead.
- Compound indexes optimize filtering by `{ status: 1, isDeleted: 1, category: 1, level: 1 }`.
