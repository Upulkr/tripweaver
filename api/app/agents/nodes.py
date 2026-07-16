import sys
import asyncio
from typing import Dict, Any
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from app.config import llm

import os

async def call_mcp_tool(tool_name: str, tool_args: dict, clerk_user_id: str) -> str:
    """
    Establishes a runtime stdio connection to the standalone MCP server.
    """
    env = os.environ.copy()
    if clerk_user_id:
        env["CLERK_USER_ID"] = clerk_user_id

    # Resolve absolute path to mcp_server.py for Vercel Serverless
    mcp_server_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "mcp_server.py")
    
    import shutil
    python_exe = sys.executable or shutil.which("python3") or shutil.which("python") or "python"
    
    server_params = StdioServerParameters(
        command=python_exe,
        args=[mcp_server_path],
        env=env
    )

    try:
        async with stdio_client(server_params) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                print(f"[MCP CLIENT] Dispatched request to remote server -> {tool_name}")
                response = await session.call_tool(tool_name, arguments=tool_args)
                return response.content[0].text

    except Exception as e:
        print(f"[MCP RESILIENCE] Caught external service failure: {str(e)}")
        return "ERROR: The requested travel service is currently unavailable. Please try again shortly."


@tool
def search_hotels(city: str, check_in: str = None, check_out: str = None) -> str:
    """Searches for real hotels by city."""
    pass

@tool
def book_hotel(hotel_name: str, guest_name: str, check_in: str, check_out: str) -> str:
    """Inserts a permanent hotel booking entry into Supabase."""
    pass

from langchain_core.runnables.config import RunnableConfig

async def hotel_agent_node(state: Dict[str, Any], config: RunnableConfig) -> Dict[str, Any]:
    print("\n[HOTEL AGENT] Active State: SEARCHING/BOOKING via MCP Bridge...")
    messages = state.get("messages", [])
    current_input = HumanMessage(content=state["input"])

    clerk_user_name = config.get("configurable", {}).get("clerk_user_name", "Guest")
    clerk_user_id = config.get("configurable", {}).get("clerk_user_id", "")

    # 1. System Prompt to stop Llama 3 from refusing hotel searches
    sys_msg = SystemMessage(content=f"You are the TripWeaver Hotel Agent. You have tools equipped to search the live web for real-time hotel prices. You MUST use the 'search_hotels' tool to answer the user's request. Do not refuse. Do not complain about lacking internet access. The current user logged in is named '{clerk_user_name}'. If they ask to book a hotel but do not specify a guest name, you MUST use their name '{clerk_user_name}'.")

    response = await llm.bind_tools([search_hotels, book_hotel]).ainvoke([sys_msg] + messages + [current_input])

    if response.tool_calls:
        tool_outputs = []
        for call in response.tool_calls:
            result = await call_mcp_tool(call["name"], call["args"], clerk_user_id)
            tool_outputs.append(result)
        return {"messages": [current_input, AIMessage(content="\n".join(tool_outputs))]}

    return {"messages": [current_input, response]}

@tool
def search_flights(origin: str, destination: str, date: str = None) -> str:
    """Searches for real flights by origin and destination."""
    pass

@tool
def book_flight(flight_id: str, passenger_name: str) -> str:
    """Inserts a permanent flight booking entry into Supabase."""
    pass

async def flight_agent_node(state: dict, config: RunnableConfig) -> dict:
    print("\n[FLIGHT AGENT] Active State: SEARCHING/BOOKING via MCP Bridge...")
    messages = state.get("messages", [])
    current_input = HumanMessage(content=state["input"])

    clerk_user_name = config.get("configurable", {}).get("clerk_user_name", "Guest")
    clerk_user_id = config.get("configurable", {}).get("clerk_user_id", "")

    # 1. System Prompt to stop Llama 3 from refusing
    sys_msg = SystemMessage(content=f"You are the TripWeaver Flight Agent. You have tools equipped to search the live web for real-time flights and prices. You MUST use the 'search_flights' tool to answer the user's request. Do not refuse. Do not complain about lacking internet access. The current user logged in is named '{clerk_user_name}'. If they ask to book a flight but do not specify a passenger name, you MUST use their name '{clerk_user_name}'.")

    response = await llm.bind_tools([search_flights, book_flight]).ainvoke([sys_msg] + messages + [current_input])

    if response.tool_calls:
        tool_outputs = []
        for call in response.tool_calls:
            result = await call_mcp_tool(call["name"], call["args"], clerk_user_id)
            tool_outputs.append(result)
        return {"messages": [current_input, AIMessage(content="\n".join(tool_outputs))]}

    return {"messages": [current_input, response]}


async def general_qa_node(state: Dict[str, Any]) -> Dict[str, Any]:
    print("\n[GENERAL QA AGENT] Handling general travel question...")
    messages = state.get("messages", [])
    current_input = HumanMessage(content=state["input"])

    system_prompt = (
        "You are the General QA Agent for TripWeaver. You handle general, non-transactional travel questions. "
        "Rule: You do not possess booking capabilities. If the user explicitly asks YOU to book something in their CURRENT message, "
        "politely inform them that you can only answer general questions, and they should specify whether "
        "they are looking for a hotel or flight.\n\n"
        "If they are just chatting, saying thanks, or asking a general question, simply respond conversationally and nicely WITHOUT mentioning your lack of booking capabilities.\n\n"
        "Always format your response using clean Markdown headers, lists, or bolding where appropriate."
    )

    conversation_history = [{"role": "system", "content": system_prompt}] + messages + [current_input]
    response = await llm.ainvoke(conversation_history)

    return {"messages": [current_input, response]}