# Docker & Containerization Deployment Guide

This document details containerized deployment procedures for SkillMatrix LMS using Docker and Docker Compose.

---

## 1. Container Architecture
- **`skillmatrix-frontend`**: Nginx Alpine container serving optimized React static assets on port 80 and reverse proxying `/api` and `/uploads` requests.
- **`skillmatrix-backend`**: Node 18 Alpine container executing Express REST API server on port 5000 with `/health` monitoring.
- **`skillmatrix-mongodb`**: MongoDB 6.0 database container on port 27017 with persistent volume storage.

---

## 2. Running Full-Stack Infrastructure

### A. Start Production Containers
```bash
docker-compose up -d --build
```

### B. Verify Running Container Health
```bash
docker-compose ps
```

### C. Inspect Logs
```bash
# All service logs
docker-compose logs -f

# Backend API logs
docker-compose logs -f backend
```

### D. Stop Infrastructure
```bash
docker-compose down
```

---

## 3. Persistent Volumes
- `mongodb_data`: Stores MongoDB database collections permanently.
- `uploads_data`: Stores course thumbnails and lesson resource attachments permanently.
