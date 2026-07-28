# CI/CD Automation Guide

This guide details the GitHub Actions Continuous Integration and Deployment pipeline configured for SkillMatrix LMS.

---

## 1. Pipeline Overview

The pipeline (`.github/workflows/ci.yml`) triggers automatically on:
- Every `push` to the `main` branch.
- Every `pull_request` targeting the `main` branch.

---

## 2. Pipeline Execution Steps

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Checkout Source ├────►│ Setup Node.js 18 ├────►│ Install Dep.     ├────►│ ESLint Verification │
└─────────────────┘     └──────────────────┘     └──────────────────┘     └────────┬────────┘
                                                                                   │
                                                                                   ▼
                                                 ┌──────────────────┐     ┌────────┴────────┐
                                                 │ Vitest Test Suite│◄────┤ Build Client    │
                                                 └──────────────────┘     └─────────────────┘
```

1. **Checkout Code**: Retrieves latest git commit.
2. **Setup Node.js 18**: Configures Node.js 18 LTS runtime with npm caching.
3. **Install Dependencies**: Executes `npm ci` for clean reproducible installation.
4. **ESLint Verification**: Executes `npm run lint`. Fails pipeline if any lint errors exist.
5. **Client Production Build**: Executes `npm run build` to verify Vite bundle optimization.
6. **Backend Integration Tests**: Executes `npm test` running 74 Vitest integration tests against in-memory MongoDB.
