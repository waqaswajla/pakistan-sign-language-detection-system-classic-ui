# D:\4-2026\backend\services\mediapipe_service.py
# FROM: fyp\PSL\helper\mediapipe_helper.py + fyp\PSL\capture_alphabets.py

import os
import shutil
from core.config import settings
from PSL.helper import mediapipe_helper

INIT_FILE = "PSL/000000000000_keypoints.json"


def start(camera_index: int = None):
    idx = camera_index if camera_index is not None else settings.CAMERA_INDEX
    # Clear stale keypoints so latest-by-mtime always returns a fresh frame
    if os.path.exists(settings.KEYPOINTS_DIR):
        shutil.rmtree(settings.KEYPOINTS_DIR)
    os.makedirs(settings.KEYPOINTS_DIR)
    mediapipe_helper.start_capture(output_dir=settings.KEYPOINTS_DIR, camera_index=idx)


def stop():
    mediapipe_helper.stop_capture()
