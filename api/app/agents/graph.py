from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.agents.nodes import hotel_agent_node, flight_agent_node, general_qa_node
from app.entity.state import AgentState
from langchain_core.runnables.config import RunnableConfig

def router_edge(state: Dict[str, Any], config: RunnableConfig) -> str:
    query = state.get("input", "").lower()
    messages = state.get("messages", [])

    if "book" in query:
        # First try memory
        ai_messages = [m.content.lower() for m in reversed(messages) if getattr(m, "type", "") == "ai" or getattr(m, "role", "") == "assistant"]
        
        # If memory is empty, get from DB
        if not ai_messages:
            thread_id = config.get("configurable", {}).get("thread_id")
            if thread_id:
                from prisma import Prisma
                db = Prisma()
                if not db.is_connected():
                    db.connect()
                db_msgs = db.chatmessage.find_many(
                    where={"threadId": thread_id, "role": "assistant"},
                    order={"createdAt": "desc"},
                    take=20
                )
                ai_messages = [m.content.lower() for m in db_msgs]
        
        for msg in ai_messages:
            if "found flights" in msg:
                return "flight_agent"
            if "found hotels" in msg:
                return "hotel_agent"

    # Standard routing
    if any(w in query for w in ["flight", "fly"]): return "flight_agent"
    if any(w in query for w in ["hotel", "stay", "room"]): return "hotel_agent"

    return "general_qa"
# --- Define Graph Architecture ---
workflow = StateGraph(AgentState)

# Add Node Configurations
workflow.add_node("hotel_agent", hotel_agent_node)
workflow.add_node("flight_agent", flight_agent_node)
workflow.add_node("general_qa", general_qa_node)

# Construct Routing Entryway Point
workflow.set_conditional_entry_point(
    router_edge,
    {
        "hotel_agent": "hotel_agent",
        "flight_agent": "flight_agent",
        "general_qa": "general_qa"
    }
)

# Connect all leaves directly to the termination block
workflow.add_edge("hotel_agent", END)
workflow.add_edge("flight_agent", END)
workflow.add_edge("general_qa", END)

# Compile with cross-session persistence memory layers
memory = MemorySaver()
compiled_graph = workflow.compile(checkpointer=memory)