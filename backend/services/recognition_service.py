# D:\4-2026\backend\services\recognition_service.py
# FROM: fyp\PSL\alphabet_recognition\alphabet_recognition.py
#       fyp\PSL\word_recognition\word_recognition.py
#       fyp\add_alphabet_from_images.py
#       fyp\build_psl_dataset.py
#       fyp\learn_psl.py

import os
import json
from typing import Optional
from core.config import settings
import PSL.alphabet_recognition.alphabet_recognition as alphabet
import PSL.word_recognition.word_recognition as word
import PSL.helper.helperFunc as helper


def get_latest_keypoint_file() -> Optional[str]:
    if not os.path.exists(settings.KEYPOINTS_DIR):
        return None
    entries = [
        e for e in os.scandir(settings.KEYPOINTS_DIR)
        if e.is_file() and e.name.endswith(".json")
    ]
    if not entries:
        return None
    return max(entries, key=lambda e: e.stat().st_mtime).name  # latest by write time


def predict(mode: int) -> str:
    filename = get_latest_keypoint_file()
    if not filename:
        print("[predict] no keypoint file found")
        return "no match"

    filepath = os.path.join(settings.KEYPOINTS_DIR, filename)

    try:
        # Debug: read keypoint and log confidence
        js = json.loads(open(filepath).read())
        for items in js['people']:
            hr = items["hand_right_keypoints_2d"]
            hl = items["hand_left_keypoints_2d"]
        r_conf = sum(hr[i] for i in range(2, len(hr), 3))
        l_conf = sum(hl[i] for i in range(2, len(hl), 3))
        print(f"[predict] mode={mode} file={filename} R_conf={r_conf:.1f} L_conf={l_conf:.1f}")

        if mode == 0:
            result = alphabet.match_ann(filepath)
        else:
            result = word.match_ann(filepath)
        print(f"[predict] result={result}")
        return result
    except Exception as e:
        import traceback
        print(f"[predict] EXCEPTION: {e}")
        traceback.print_exc()
        return "no match"
