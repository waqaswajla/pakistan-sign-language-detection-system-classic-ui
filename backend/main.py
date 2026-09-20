# D:\4-2026\backend\main.py
# FROM: fyp\main.py → rewritten as FastAPI app

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import capture, recognition, speech, stream
from core.config import settings

app = FastAPI(title="PSL API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(capture.router,     prefix="/api", tags=["capture"])
app.include_router(recognition.router, prefix="/api", tags=["recognition"])
app.include_router(speech.router,      prefix="/api", tags=["speech"])
app.include_router(stream.router,      prefix="/api", tags=["stream"])


@app.get("/")
def root():
    return {"status": "PSL API running"}
