# TripWeaver Monorepo

TripWeaver is an AI-powered travel booking assistant built with a modern, separated frontend and backend architecture. It allows users to chat with specialized AI agents to discover and book real-time flights and hotels.

## Architecture

This repository is a **Monorepo** containing two completely separate applications:

1. **`frontend/`** - The Next.js React user interface.
2. **`api/`** - The Python FastAPI backend powered by LangGraph and the Model Context Protocol (MCP).

## How to Run

Since the two applications run independently, you will need two separate terminal windows.

### 1. Start the Backend (API)
Open a terminal and navigate to the `api` folder:
```bash
cd api
# Activate your virtual environment if applicable
# .\venv\Scripts\activate
uvicorn main:app --reload
```
The backend will run on `http://127.0.0.1:8000`. Please refer to the `api/README.md` for database and environment variable setup.

### 2. Start the Frontend
Open a second terminal and navigate to the `frontend` folder:
```bash
cd frontend
bun run dev
```
The frontend will run on `http://localhost:3000`. Please refer to the `frontend/README.md` for Clerk authentication and environment variable setup.

## Deployment

- **Frontend:** Deploy the `frontend` directory to Vercel.
- **Backend:** Deploy the `api` directory to Koyeb or Fly.io.
