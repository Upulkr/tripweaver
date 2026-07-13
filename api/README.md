---
title: TripWeaver Backend
emoji: ✈️
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: 4.40.0
app_file: run.py
pinned: false
---

# TripWeaver API Backend

The backend of TripWeaver is a robust, agentic AI service built with Python, FastAPI, LangGraph, and the Model Context Protocol (MCP).

## Key Technologies
- **FastAPI**: Serves the REST API and Server-Sent Events (SSE) for streaming the AI chat to the frontend.
- **LangGraph**: Manages the multi-agent orchestration. A Router agent classifies the user's intent and routes them to specialized `hotel_agent` or `flight_agent` nodes.
- **Model Context Protocol (MCP)**: Instead of providing the LLM with direct access to local tools, TripWeaver spawns an isolated MCP subprocess (`mcp_server.py`) that executes real-time database queries and live bookings using the official MCP JSON-RPC protocol over standard input/output.
- **Prisma & Supabase**: Handles the persistent storage of chat memory threads, messages, and actual booking confirmations.
- **Groq & Llama 3.3 70B**: Provides the core reasoning and tool-calling engine for the agents at lightning-fast speeds.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in this `api/` directory with the following keys:
```env
# Prisma/Supabase Database connection strings
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# Groq API Key for the LLM
GROQ_API_KEY="gsk_..."
```

### 2. Install Dependencies
Ensure you have Python 3.10+ installed.
```bash
python -m venv venv
.\venv\Scripts\activate   # On Mac/Linux use: source venv/bin/activate
pip install -r requirements.txt
```

### 3. Database Sync
Push the Prisma schema to your Supabase database:
```bash
prisma db push
```
*(Optional)* Seed the database with mock hotel and flight data:
```bash
python seed.py
```

### 4. Run the Server
```bash
uvicorn main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.
