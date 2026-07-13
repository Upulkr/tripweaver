import os
from langchain_groq import ChatGroq

# Your base LLM instance
import os
from langchain_groq import ChatGroq

# Update the model_name to the currently supported version
llm = ChatGroq(
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.3-70b-versatile"
)

# Explicitly duplicate or reference it so the import doesn't crash
llm_with_tools = llm