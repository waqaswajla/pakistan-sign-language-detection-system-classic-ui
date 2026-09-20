# -*- coding: utf-8 -*-
"""
MediaPipe-based keypoint capture module.
Replaces OpenPose subprocess with MediaPipe Holistic running in a background thread.
Writes JSON files in OpenPose-compatible format so the rest of the pipeline works unchanged.
"""

import cv2
import mediapipe as mp
import json
import os
import time
import threading

mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

_latest_frame = None          # JPEG bytes of the most recent annotated frame
_frame_lock = threading.Lock()

# OpenPose BODY_18 to MediaPipe pose landmark index mapping.
# Special values None mean the point must be computed as a midpoint.
# Entry format: (mp_index_or_None, mp_index2_or_None)
# If mp_index2 is given, the OpenPose point = midpoint of mp_index and mp_index2.
_POSE_MAP = [
    (0, None),    # 0  Nose
    (11, 12),     # 1  Neck (midpoint of shoulders)
    (12, None),   # 2  RShoulder
    (14, None),   # 3  RElbow
    (16, None),   # 4  RWrist
    (11, None),   # 5  LShoulder
    (13, None),   # 6  LElbow
    (15, None),   # 7  LWrist
    (23, 24),     # 8  MidHip (midpoint of hips)
    (24, None),   # 9  RHip
    (26, None),   # 10 RKnee
    (28, None),   # 11 RAnkle
    (23, None),   # 12 LHip
    (25, None),   # 13 LKnee
    (27, None),   # 14 LAnkle
    (5,  None),   # 15 REye
    (2,  None),   # 16 LEye
    (8,  None),   # 17 REar
    (7,  None),   # 18 LEar
]


def _get_pose_keypoints(pose_landmarks, frame_w, frame_h):
    """
    Convert MediaPipe pose landmarks to OpenPose 19-point flat array
    [x0, y0, c0, x1, y1, c1, ...] in pixel coordinates.
    Returns 57 floats (19 points x 3).
    """
    if pose_landmarks is None:
        return [0.0] * 57

    lm = pose_landmarks.landmark
    result = []

    for idx_a, idx_b in _POSE_MAP:
        if idx_b is None:
            # Direct mapping
            p = lm[idx_a]
            x = p.x * frame_w
            y = p.y * frame_h
            c = p.visibility
        else:
            # Midpoint
            pa = lm[idx_a]
            pb = lm[idx_b]
            x = ((pa.x + pb.x) / 2) * frame_w
            y = ((pa.y + pb.y) / 2) * frame_h
            c = (pa.visibility + pb.visibility) / 2
        result.extend([x, y, c])

    return result


def _get_hand_keypoints(hand_landmarks, frame_w, frame_h):
    """
    Convert MediaPipe hand landmarks to OpenPose flat array
    [x0, y0, c0, x1, y1, c1, ...] in pixel coordinates.
    Returns 63 floats (21 points x 3).
    MediaPipe and OpenPose share the same 21-landmark hand ordering.
    """
    if hand_landmarks is None:
        return [0.0] * 63

    result = []
    for lm in hand_landmarks.landmark:
        result.extend([lm.x * frame_w, lm.y * frame_h, 1.0])
    return result


def _save_keypoints_json(pose_kp, hand_right_kp, hand_left_kp, output_path):
    """Save keypoints as an OpenPose-compatible JSON file."""
    data = {
        "version": 1.3,
        "people": [
            {
                "person_id": [-1],
                "pose_keypoints_2d": pose_kp,
                "face_keypoints_2d": [],
                "hand_left_keypoints_2d": hand_left_kp,
                "hand_right_keypoints_2d": hand_right_kp,
                "pose_keypoints_3d": [],
                "face_keypoints_3d": [],
                "hand_left_keypoints_3d": [],
                "hand_right_keypoints_3d": []
            }
        ]
    }
    with open(output_path, 'w') as f:
        json.dump(data, f)


def _capture_loop(output_dir, stop_event, camera_index=0):
    """
    Background thread: reads webcam frames, runs MediaPipe Holistic,
    and writes one JSON file per frame to output_dir.
    Files are named like OpenPose: 000000000001_keypoints.json, etc.
    """
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print('ERROR: Cannot open camera', camera_index)
        return

    frame_count = 1

    with mp_holistic.Holistic(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as holistic:
        while not stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.01)
                continue

            frame_h, frame_w = frame.shape[:2]
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = holistic.process(rgb)

            pose_kp = _get_pose_keypoints(results.pose_landmarks, frame_w, frame_h)
            hand_right_kp = _get_hand_keypoints(results.right_hand_landmarks, frame_w, frame_h)
            hand_left_kp = _get_hand_keypoints(results.left_hand_landmarks, frame_w, frame_h)

            filename = f'{frame_count:012d}_keypoints.json'
            _save_keypoints_json(pose_kp, hand_right_kp, hand_left_kp,
                                 os.path.join(output_dir, filename))
            frame_count += 1

            # Draw landmarks on frame for MJPEG stream
            annotated = frame.copy()
            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    annotated, results.pose_landmarks,
                    mp_holistic.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style()
                )
            if results.left_hand_landmarks:
                mp_drawing.draw_landmarks(
                    annotated, results.left_hand_landmarks,
                    mp_holistic.HAND_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(121, 22, 76), thickness=2, circle_radius=4),
                    mp_drawing.DrawingSpec(color=(121, 44, 250), thickness=2, circle_radius=2),
                )
            if results.right_hand_landmarks:
                mp_drawing.draw_landmarks(
                    annotated, results.right_hand_landmarks,
                    mp_holistic.HAND_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=4),
                    mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2),
                )

            _, jpeg = cv2.imencode('.jpg', annotated, [cv2.IMWRITE_JPEG_QUALITY, 70])
            global _latest_frame
            with _frame_lock:
                _latest_frame = jpeg.tobytes()

            # ~20 fps cap to avoid flooding disk
            time.sleep(0.05)

    cap.release()
    with _frame_lock:
        _latest_frame = None


# ── Public API ────────────────────────────────────────────────────────────────

_capture_thread = None
_stop_event = None


def start_capture(output_dir='Keypoints', camera_index=0):
    """Start MediaPipe keypoint capture in a background thread."""
    global _capture_thread, _stop_event
    stop_capture()  # ensure any previous thread is stopped
    os.makedirs(output_dir, exist_ok=True)
    _stop_event = threading.Event()
    _capture_thread = threading.Thread(
        target=_capture_loop,
        args=(output_dir, _stop_event, camera_index),
        daemon=True
    )
    _capture_thread.start()
    print('MediaPipe capture started, writing to', output_dir)


def stop_capture():
    """Stop the MediaPipe capture thread."""
    global _capture_thread, _stop_event
    if _stop_event:
        _stop_event.set()
    if _capture_thread:
        _capture_thread.join(timeout=3)
    _capture_thread = None
    _stop_event = None
    print('MediaPipe capture stopped')
