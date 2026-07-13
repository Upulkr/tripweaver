# 1. Load environment variables FIRST
from dotenv import load_dotenv
load_dotenv()

import asyncio
import json
from fastapi import FastAPI, HTTPException, Query, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sse_starlette.sse import EventSourceResponse

from app.agents.graph import compiled_graph as agent_app
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma

# Initialize the FastAPI web server
app = FastAPI(title="TripWeaver AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_methods=["*"],
    allow_headers=["*"],
)

db = Prisma()

@app.on_event("startup")
def startup():
    db.connect()

@app.on_event("shutdown")
def shutdown():
    db.disconnect()

class ThreadCreateRequest(BaseModel):
    clerk_user_id: str
    title: Optional[str] = "New Chat"

class ThreadRenameRequest(BaseModel):
    title: str

@app.post("/api/threads")
def create_thread(request: ThreadCreateRequest):
    thread = db.thread.create(
        data={
            "clerkUserId": request.clerk_user_id,
            "title": request.title
        }
    )
    return thread

@app.get("/api/threads")
def list_threads(clerk_user_id: str = Query(...)):
    threads = db.thread.find_many(
        where={"clerkUserId": clerk_user_id},
        order={"updatedAt": "desc"}
    )
    return threads

@app.get("/api/threads/{thread_id}/messages")
def get_thread_messages(thread_id: str):
    messages = db.chatmessage.find_many(
        where={"threadId": thread_id},
        order={"createdAt": "asc"}
    )
    return messages

@app.delete("/api/threads/{thread_id}")
def delete_thread(thread_id: str):
    db.thread.delete(where={"id": thread_id})
    return {"status": "success"}

@app.patch("/api/threads/{thread_id}")
def rename_thread(thread_id: str, request: ThreadRenameRequest):
    thread = db.thread.update(
        where={"id": thread_id},
        data={"title": request.title}
    )
    return thread

@app.get("/api/bookings")
def get_bookings(clerk_user_id: str = Query(...)):
    hotels = db.hotelbooking.find_many(
        where={"clerkUserId": clerk_user_id},
        order={"createdAt": "desc"}
    )
    flights = db.flightbooking.find_many(
        where={"clerkUserId": clerk_user_id},
        order={"createdAt": "desc"}
    )
    return {"hotels": hotels, "flights": flights}

@app.post("/api/chat/stream")
async def chat_stream(request: Request):
    data = await request.json()
    message = data.get("message")
    thread_id = data.get("thread_id")
    clerk_user_id = data.get("clerk_user_id")
    clerk_user_name = data.get("clerk_user_name", "Guest")

    if not message or not thread_id or not clerk_user_id:
        raise HTTPException(status_code=400, detail="Missing required fields")

    # Save user message to DB
    db.chatmessage.create(
        data={
            "threadId": thread_id,
            "role": "user",
            "content": message
        }
    )

    # We update the thread to bump the updatedAt timestamp
    thread = db.thread.find_unique(where={"id": thread_id})
    if thread:
        db.thread.update(
            where={"id": thread_id},
            data={"title": thread.title} 
        )

    config = {"configurable": {"thread_id": thread_id, "clerk_user_name": clerk_user_name, "clerk_user_id": clerk_user_id}}

    async def event_generator():
        full_response = ""
        try:
            async for event in agent_app.astream_events({"input": message}, config=config, version="v1"):
                kind = event["event"]
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content and isinstance(content, str):
                        full_response += content
                        yield json.dumps({'token': content})
                        await asyncio.sleep(0)
                        
            # In case the model didn't stream properly (some tools etc), we can fallback to full result
            if not full_response:
                state = await agent_app.aget_state(config)
                if state.values.get("messages"):
                    full_response = state.values["messages"][-1].content
                    
            if full_response:
                db.chatmessage.create(
                    data={
                        "threadId": thread_id,
                        "role": "assistant",
                        "content": full_response
                    }
                )

            # Auto-title if it's "New Chat"
            if thread and thread.title == "New Chat":
                new_title = message[:40] + ("..." if len(message) > 40 else "")
                db.thread.update(
                    where={"id": thread_id},
                    data={"title": new_title}
                )

            yield json.dumps({'done': True, 'full_reply': full_response})

        except asyncio.CancelledError:
            print("Client disconnected.")
            raise
        except Exception as e:
            print(f"Error during stream: {e}")
            yield json.dumps({'error': str(e)})

    return EventSourceResponse(event_generator())