import os
import uvicorn

# Generate the Prisma client on startup before importing main
print("Generating Prisma Client...")
os.system("prisma generate")

from main import app

if __name__ == "__main__":
    # Hugging Face Spaces Gradio SDK listens on port 7860
    uvicorn.run(app, host="0.0.0.0", port=7860)
