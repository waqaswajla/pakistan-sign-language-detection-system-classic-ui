# D:\4-2026\backend\models\schemas.py

from pydantic import BaseModel
from typing import Optional

class CaptureRequest(BaseModel):
    duration: Optional[int] = None  # seconds; None = continuous

class MatchRequest(BaseModel):
    mode: int = 1          # 0 = alphabet, 1 = word
    speech: int = 0        # 0 = off, 1 = on
    voice_mode: str = "offline"  # "edge" or "offline"

class PredictionResponse(BaseModel):
    label: str
    mode: int

class StatusResponse(BaseModel):
    status: str

class LabelRequest(BaseModel):
    label: str
    mode: int = 1  # 0 = alphabet, 1 = word
