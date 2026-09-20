import time
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from PSL.helper import mediapipe_helper

router = APIRouter()


def _mjpeg_generator():
    while True:
        frame = mediapipe_helper._latest_frame
        if frame:
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            )
        else:
            time.sleep(0.05)


@router.get("/stream")
def video_stream():
    return StreamingResponse(
        _mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )

