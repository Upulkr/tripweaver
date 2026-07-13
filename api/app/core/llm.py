import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load the .env file to get your GOOGLE_API_KEY
load_dotenv()

# Initialize the Gemini model
# We use gemini-1.5-flash for speed and efficiency in multi-agent flows
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)