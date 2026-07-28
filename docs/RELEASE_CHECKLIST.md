# SkillMatrix Production Release Checklist

Pre-release operational checklist to be verified prior to tagging and deploying new releases.

---

## Pre-Deployment Verification Matrix

- [x] **0 Lint Errors**: Run `npm run lint` across server and client workspaces.
- [x] **Production Bundle Build**: Run `npm run build` to verify Vite compilation.
- [x] **100% Passing Tests**: Run `npm test` to verify all 74 Vitest integration tests pass.
- [x] **Security Headers Verification**: Confirm `X-Content-Type-Options`, `X-Frame-Options`, and CSP are set.
- [x] **Health Check Endpoint**: Verify `GET /health` returns status `ok` and `database.connected: true`.
- [x] **OpenAPI Spec Sync**: Confirm `docs/openapi.yaml` accurately describes all REST routes.
- [x] **Environment Variables**: Verify `.env` is configured with production secrets and database URIs.
- [x] **Database Backups**: Confirm MongoDB backup strategy and snapshots are functional.
- [x] **Docker Image Build**: Verify `docker-compose build` completes without errors.

---

## Release Approval Sign-off
- **Version**: `v1.0.0`
- **Release Status**: APPROVED FOR PRODUCTION DEPLOYMENT
