# D:\4-2026\backend\routers\speech.py
# FROM: fyp\main.py (pygame mixer block)

import os
from datetime import datetime
from fastapi import APIRouter, Query
from pydantic import BaseModel
from models.schemas import StatusResponse
from services import speech_service

router = APIRouter()

_LOG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "error.log")


class MissingWordRequest(BaseModel):
    word: str


@router.post("/speech/{label}", response_model=StatusResponse)
def play_speech(label: str, mode: str = Query("offline")):
    speech_service.play(label, mode)
    return {"status": f"playing {label}"}


@router.post("/speech/preload/{label}", response_model=StatusResponse)
def preload_speech(label: str):
    speech_service.preload(label)
    return {"status": f"preloading {label}"}


@router.post("/log-missing")
def log_missing_word(body: MissingWordRequest):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] missing audio: {body.word}\n")
    return {"status": "logged"}
