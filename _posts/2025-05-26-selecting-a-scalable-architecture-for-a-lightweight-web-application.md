---
layout: default
title: "Selecting a Scalable Architecture for a Lightweight Web Application"
date: 2025-05-26 09:00:00 +1000
description: "Selecting a Scalable Architecture for a Lightweight Web Application"
categories: [architecture, python]
tags: [python, data visualization, fastapi, astro, cloudflare, railway]
---

# Selecting a Scalable Architecture for a Lightweight Web Application

**TL;DR**
A lightweight yet scalable architecture using **Astro**, **FastAPI**, **Cloudflare Pages**, and **Railway**. Ideal for developers who want low-cost prototyping, clean frontend/backend separation, and a clear path to global scale.

---

This post outlines a simple and scalable architecture for building a lightweight web application that runs smoothly on both desktop and mobile. The solution prioritizes:

* A **free or low-cost prototype**
* **Ease of deployment** using GitHub integration
* **Developer-friendly tools** with fast local testing
* A clear path to **scaling globally**
* Support for **frontend/backend separation**

A range of frontend and backend frameworks and hosting platforms were considered before selecting a stack that includes **Astro**, **FastAPI**, **Cloudflare Pages**, and **Railway**.

---

## Frontend Architecture Considerations

The frontend requirements included:

* Fast performance and mobile responsiveness
* Static site generation (for better speed and simplicity)
* Component flexibility (when dynamic content is required)
* Seamless CI/CD integration with GitHub

### Frontend Options Evaluated

| Option             | Pros                               | Cons                                    |
| ------------------ | ---------------------------------- | --------------------------------------- |
| **Static HTML/JS** | Simple, no build tools needed      | Limited scalability, manual effort      |
| **React (Vite)**   | Rich ecosystem, component-based UI | Heavier runtime, not optimal for static |
| **Astro**          | Static-first, supports components  | Smaller ecosystem, newer technology     |

### Selected Frontend: **Astro**

Astro was selected for its static-first architecture and support for modern UI frameworks (React, Vue, etc.). Astro produces fast-loading static pages and offers a smooth local development experience. It also integrates easily with popular deployment platforms and can grow with the application as requirements evolve.

---

## Backend Architecture Considerations

Backend requirements included:

* A modern, async-ready web framework
* Simple local development and testing
* Easy GitHub-based deployments
* Good documentation and maintainability

### Backend Options Evaluated

| Option                | Pros                                  | Cons                                 |
| --------------------- | ------------------------------------- | ------------------------------------ |
| **Flask**             | Lightweight, well-established         | Synchronous by default               |
| **Express (Node.js)** | JavaScript-based, fast setup          | Less preferred if using Python stack |
| **FastAPI**           | Async support, automatic OpenAPI docs | Newer, still maturing in ecosystem   |

### Selected Backend: **FastAPI**

FastAPI was chosen for its modern Pythonic design, excellent async support, and automatic API documentation via OpenAPI. It allows rapid development and testing, and scales well with increased API complexity.

---

## Hosting Strategy

Both frontend and backend needed hosting solutions that offer:

* A generous free tier
* GitHub integration for continuous deployment
* Easy environment setup for future scaling
* Optional CDN and global distribution support

---

### Frontend Hosting Comparison

| Feature             | Cloudflare Pages | Vercel     | Netlify    | GitHub Pages    |
| ------------------- | ---------------- | ---------- | ---------- | --------------- |
| GitHub Integration  | ✅ Yes            | ✅ Yes      | ✅ Yes      | ⚠️ Manual       |
| Preview Deploys     | ✅ Yes            | ✅ Yes      | ✅ Yes      | 🚫              |
| CDN Performance     | ✅ Excellent      | ✅ Good     | ✅ Good     | 🚫              |
| Static Site Support | ✅ Native         | ✅ Native   | ✅ Native   | ✅               |
| Custom Domains      | ✅ Free TLS       | ✅ Free TLS | ✅ Free TLS | ⚠️ Manual setup |
| Cost (Free Tier)    | ✅ Unlimited      | ✅ Limited  | ✅ Limited  | ✅               |

### Selected Frontend Host: **Cloudflare Pages**

Cloudflare Pages was selected due to its:

* Native Astro support
* Seamless GitHub integration
* Unlimited free tier for bandwidth and deploys
* Global CDN edge delivery for maximum performance

---

### Backend Hosting Comparison

| Option               | Pros                                    | Cons                             |
| -------------------- | --------------------------------------- | -------------------------------- |
| **Railway**          | Free tier, GitHub deploys, simple setup | No multi-region support          |
| **Render**           | Supports background jobs, decent docs   | Cold starts can be slow          |
| **Fly.io**           | Global deployment possible              | Requires more configuration      |
| **Vercel Functions** | Serverless, good for JS stacks          | Less support for Python projects |

### Selected Backend Host: **Railway**

Railway was chosen due to its straightforward deployment process, free tier (500 hours per month), and GitHub integration. It allows hosting of Python-based APIs with a simple push-to-deploy flow and includes an intuitive web dashboard.

---

## Frontend–Backend Communication

In production, the frontend (Astro) communicates with the backend (FastAPI) via **relative paths or API subdomains**. For example:

* Development: `localhost:4321` fetches from `localhost:8000`
* Production: `frontend.example.com` fetches from `api.example.com`

**CORS configuration** is handled in FastAPI using the `fastapi.middleware.cors.CORSMiddleware`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://frontend.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This setup ensures secure and flexible communication across environments.

---

## Local Development and Deployment Workflow

A standard development workflow was established to allow local testing, branch-based deployments, and clear staging and production pipelines.

### Local Testing

```bash
# Frontend (Astro)
npm run dev  # Runs on localhost:4321

# Backend (FastAPI)
uvicorn main:app --reload  # Runs on localhost:8000
```

Developers can test both parts of the stack locally using relative URLs or `.env` configuration to point the frontend to the local backend.

---

### GitHub Deployment Integration

#### Frontend (Cloudflare Pages)

* Commits to the main branch trigger production deployment
* Pull requests create preview deployments with unique URLs
* Environment variables are set via Cloudflare dashboard

#### Backend (Railway)

* Commits to the main branch trigger API redeployment
* Secrets such as API keys are set in the Railway project environment
* Logs and usage can be monitored from the Railway console

---

## Database and Persistence Layer

While the current stack is stateless, future enhancements may require a database.

**Options for integrating persistence:**

* **Railway PostgreSQL**: Offers a free managed database with easy setup.
* **Supabase**: An open-source Firebase alternative with hosted Postgres, authentication, and APIs.

Both can be connected to FastAPI using `asyncpg` or SQLAlchemy with async support.

Example connection snippet:

```python
import asyncpg
import asyncio

async def connect():
    conn = await asyncpg.connect(DATABASE_URL)
    return conn
```

---

## Scalability and Future Considerations

The current setup supports:

* Fast global frontend delivery via Cloudflare CDN
* Simple backend deployment with moderate usage capacity
* Preview environments for frontend on PRs

**Future improvements may include:**

* Moving the backend to a global host like Fly.io or Cloudflare Workers
* Implementing blue/green deployments using preview environments
* Adding caching layers or CDN support for API responses
* Introducing database or persistent storage (e.g., PostgreSQL on Railway or Supabase)

---

## Cost Overview

| Service              | Free Tier                         | Paid Upgrade Options                  |
| -------------------- | --------------------------------- | ------------------------------------- |
| **Cloudflare Pages** | Unlimited bandwidth & deploys     | Pro plan starts at \$20/month         |
| **Railway**          | 500 hours/month, 1GB RAM instance | \$5 per additional 1,000 hours        |
| **Astro**            | Free, open-source                 | No upgrade needed                     |
| **Domain**           | Optional                          | \~\$10/year via Namecheap, Cloudflare |

This architecture supports rapid iteration and worldwide performance without incurring costs during prototyping. Paid upgrades are available if traffic increases or if staging/prod separation is required.

---

## Visual Overview

### Architecture Diagram

```
[Client] → [Cloudflare Pages (Astro)] → [API Call] → [Railway (FastAPI)]
                                           ↑
                                     [PostgreSQL or Supabase (Optional)]
```

### CI/CD Deployment Flow

```
[GitHub PR] → [Cloudflare Preview URL]
           → [Merge to Main] → [Prod Deploy]
           → [Railway redeploys backend]
```

---

## Conclusion

After comparing several modern frontend frameworks, backend options, and hosting providers, the selected architecture includes:

* **Astro** for a fast, static-first frontend
* **FastAPI** for a modern async backend
* **Cloudflare Pages** for free global hosting with GitHub CI/CD
* **Railway** for easy API deployment and free backend runtime

This stack offers a **cost-effective**, **scalable**, and **developer-friendly** solution ideal for building and growing a modern web application.

