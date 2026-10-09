# SWOT Khulna Platform

A robust decision-support prototype for the Khulna/southwest Bangladesh hydrology and salinity problem using SWOT observations, gauge data, and physics-informed neural networks.

## Prerequisites
- Docker Engine & Docker Compose
- Make (optional, can use commands directly from Makefile)

## Getting Started

1. Copy the environment variables template:
```bash
cp .env.example .env
```

2. Start the local development stack:
```bash
docker compose up --build
```

3. Open the Next.js app on `http://localhost:3000` (starts outside docker for frontend dev, or you can run `pnpm dev` inside `apps/web`).

## Features
- **Frontend**: Next.js App Router, Tailwind CSS v4, shadcn/ui.
- **Backend**: FastAPI, Celery, PostgreSQL + PostGIS, Redis.
- **ML**: PyTorch Physics-Informed Neural Network (PINN).
