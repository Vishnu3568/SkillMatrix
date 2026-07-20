# Executive Summary & Project Overview

## 1. Project Introduction
**SkillMatrix** is a production-grade Learning Management System (LMS) designed using the modern MERN stack (React, Express.js, MongoDB, Node.js). Engineered to scale as a robust Software-as-a-Service (SaaS) application, it enables educational institutions and organizations to deliver, manage, and track structured learning programs.

This design document establishes the architectural foundation (Phase 0) for SkillMatrix. In accordance with professional engineering standards, this phase focuses entirely on documentation, API design, database schemas, and architectural patterns, establishing a clean design before any code implementation.

---

## 2. Core Architectural Principles
To ensure long-term viability, SkillMatrix is built upon these strict non-functional architectural tenets:

- **Scalability**: Stateless service layers and separation of concerns allow independent scaling of the API servers and database nodes.
- **Maintainability**: Clear separation of routing, controllers, services, database models, and validation logic ensures low-friction updates.
- **Modularity**: Code is structured around domains (Auth, Courses, Lessons, Enrollments, Progress) to ensure single responsibility and zero duplicate responsibilities.
- **Production Readiness**: Incorporates centralized error handling, comprehensive logging, strict validations, and robust security practices from day one.
- **Security**: Focuses on password hashing, JWT lifecycle protection, sanitization against injections, CORS, Helmet headers, and role-based access controls.
- **RESTful**: Strict adherence to standard HTTP methods, semantic URI structures, standard response formats, and appropriate HTTP status codes.
- **Role-Based**: Granular verification of permissions (Admin vs. Student) enforced at both database and routing levels.
- **Clean Code**: Adherence to consistent naming conventions, formatting, dry code principles, and unified response formats.

---

## 3. User Roles & Capabilities
The application distinguishes between two primary user roles, each containing a defined scope of actions:

### Admin Role
The Admin is the content creator and operational manager of the platform. Capabilities include:
- **Authentication**: Secure Login.
- **Dashboard**: Access aggregate reports on student numbers, enrollments, course performance, and overall progress.
- **Course Management**: Full CRUD lifecycle (Create, Update, Delete, Publish/Unpublish, and Manage Status).
- **Lesson Management**: Create, edit, and delete lessons within a course, including uploading video URLs.
- **Student Tracking**: View course enrollments, track individual student progress, and monitor completions.

### Student Role
The Student is the consumer of the educational content. Capabilities include:
- **Authentication**: Self-registration and secure Login.
- **Discovery**: Browse published courses, search courses by keywords, and view details.
- **Enrollment**: Enroll in available courses.
- **Learning Experience**: Watch lessons sequentially, mark lessons as completed, track course progress, resume learning from where they left off, and view completed courses.
