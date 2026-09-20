# D:\4-2026\backend\routers\recognition.py
# FROM: fyp\main.py (match() function)

from fastapi import APIRouter
from models.schemas import MatchRequest, PredictionResponse
from services import recognition_service, speech_service

router = APIRouter()

_last_label = ""


@router.post("/match", response_model=PredictionResponse)
def match(body: MatchRequest):
    global _last_label

    label = recognition_service.predict(body.mode)

    if label not in ("no match", "no confidence") and label != _last_label:
        _last_label = label
        if body.speech == 1:
            speech_service.play(label, body.voice_mode)

    return {"label": label, "mode": body.mode}
