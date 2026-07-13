# TripWeaver Frontend

The frontend of TripWeaver is a sleek, modern, and highly interactive user interface designed to feel like a premium travel assistant app.

## Key Technologies
- **Next.js 15 (App Router)**: The core React framework powering the frontend.
- **Tailwind CSS & Shadcn UI**: Provides the beautiful, responsive, and accessible component library.
- **Clerk**: Handles all user authentication seamlessly.
- **Zustand**: Manages the local frontend state, including active threads, streaming chat histories, and UI context panels.
- **Server-Sent Events (SSE)**: Consumes the streaming tokens from the backend LangGraph agents for a real-time typing effect.

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in this `frontend/` directory with your Clerk API keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 2. Install Dependencies
This project uses `bun` as its package manager.
```bash
bun install
```

### 3. Run the Development Server
Make sure the backend API is running on port 8000 first!
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Structure
- `src/components/chat/`: Contains the chat UI, message bubbles, and typing indicators.
- `src/components/panels/`: Contains the right-hand context panel that displays rich interactive flight and hotel cards when the AI returns them.
- `src/hooks/`: Contains the Zustand store (`use-chat-store.ts`) and the main agent communication logic (`use-agent.ts`).
- `src/services/`: Contains the SSE parsing logic (`stream.ts`) to stream the AI response token-by-token.
