from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    input: str
    messages: Annotated[Sequence[BaseMessage], lambda x, y: x + y]