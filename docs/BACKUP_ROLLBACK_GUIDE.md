# Production Backup & Rollback Strategy Guide

This guide details database backup, media snapshot, and application rollback procedures for SkillMatrix LMS.

---

## 1. Database Backup Strategy

### A. Automated Daily Dump (MongoDB)
Run `mongodump` against the production MongoDB instance:
```bash
mongodump --uri="mongodb://localhost:27017/skillmatrix" --out=/backups/mongo/$(date +%F) --gzip
```

### B. Media Uploads Backup
Sync uploads directory to cloud storage:
```bash
tar -czf /backups/uploads/uploads-$(date +%F).tar.gz server/public/uploads/
```

---

## 2. Database Restore Procedure
```bash
mongorestore --uri="mongodb://localhost:27017/skillmatrix" --drop --gzip /backups/mongo/2026-07-28/skillmatrix
```

---

## 3. Application Rollback Strategy

### A. Rollback Docker Stack to Previous Git Release
1. Checkout previous release tag:
   ```bash
   git checkout v0.9.0
   ```
2. Re-deploy containers:
   ```bash
   docker-compose up -d --build
   ```

### B. Hotfix Procedure
1. Create hotfix branch from `main`.
2. Commit fix, run tests (`npm run lint && npm run build && npm test`), and merge.
3. Push to `main` to trigger automated CI pipeline.
