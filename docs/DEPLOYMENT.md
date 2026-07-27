# SkillMatrix Production Deployment Guide

This guide outlines prerequisites, security checklists, and environment setup for deploying SkillMatrix to production.

---

## 1. Prerequisites
- **Node.js**: v18.x or v20.x LTS
- **MongoDB**: MongoDB Atlas Cluster or self-hosted MongoDB v6.0+ instance with replica set enabled (for transactions).
- **Process Manager**: PM2 or Docker container engine.
- **Reverse Proxy**: NGINX or Cloudflare for TLS termination, SSL certificates, and GZIP compression.

---

## 2. Production Environment Variables Checklist

Ensure the following environment variables are set in production:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/skillmatrix?retryWrites=true&w=majority
JWT_ACCESS_SECRET=super_secret_cryptographic_access_key_min_64_chars
JWT_REFRESH_SECRET=super_secret_cryptographic_refresh_key_min_64_chars
CLIENT_URL=https://skillmatrix.yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

---

## 3. Build & Deployment Steps

### A. Backend Deployment (Node.js / Express)
1. Install production dependencies:
   ```bash
   npm ci --production --prefix server
   ```
2. Start background service with PM2:
   ```bash
   pm2 start server/server.js --name skillmatrix-api -i max
   ```

### B. Frontend Deployment (React Single Page App)
1. Build production static bundle:
   ```bash
   npm run build --prefix client
   ```
2. Serve output `client/dist` directory using NGINX or static CDN (Vercel / Cloudflare Pages / AWS S3 + CloudFront).

---

## 4. Post-Deployment Verification
- Run health check: `GET https://api.yourdomain.com/health` -> returns `{ success: true, message: "SkillMatrix API is healthy" }`.
- Verify HTTPS redirect and TLS 1.3 headers.
- Test login, course catalog search, file upload, and lesson playback.
