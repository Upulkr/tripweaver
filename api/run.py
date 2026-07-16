import os
import uvicorn
import huggingface_hub

# Monkey-patch HfFolder to bypass Gradio 4.x incompatibility with newer huggingface-hub
class DummyHfFolder:
    @staticmethod
    def get_token():
        return None
huggingface_hub.HfFolder = DummyHfFolder

import gradio as gr

print("Generating Prisma Client...")
os.system("prisma generate")

from main import app

try:
    import spaces
    @spaces.GPU
    def dummy_gpu():
        pass
except ImportError:
    pass

demo = gr.Blocks()
with demo:
    gr.Markdown("# TripWeaver API is running")
    btn = gr.Button("Hidden", visible=False)
    btn.click(fn=dummy_gpu, inputs=[], outputs=[])

app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
