# -*- coding: utf-8 -*-
"""
Process a word image dataset and insert normalized keypoints into wordDataset.
Uses the exact same pipeline as the alphabet model (right hand, scale + center).

Dataset structure expected:
    <dataset_root>/
        <word_label>/
            image1.jpg
            image2.jpg
            ...

Run from backend/ directory:
    python images_to_word_db.py <path_to_dataset_root>

Example:
    python images_to_word_db.py D:/my_word_dataset
"""

import os
import sys
import math
import sqlite3
import cv2
import numpy as np
import mediapipe as mp

import PSL.helper.helperFunc as helper
import PSL.helper.scale as scale
import PSL.helper.move as move

DB_PATH = "data/db/main_dataset.db"

mp_hands = mp.solutions.hands


def get_hand_kp(hand_landmarks, w, h):
    result = []
    for lm in hand_landmarks.landmark:
        result.extend([lm.x * w, lm.y * h, 1.0])
    return result


def extract_features(image_path, hands_detector):
    # cv2.imread fails on Windows with non-ASCII (e.g. Arabic) paths
    raw = np.fromfile(image_path, dtype=np.uint8)
    img = cv2.imdecode(raw, cv2.IMREAD_COLOR)
    if img is None:
        return None
    h, w = img.shape[:2]
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    hands_results = hands_detector.process(rgb)

    rhand_kp = [0.0] * 63
    lhand_kp = [0.0] * 63

    if hands_results.multi_hand_landmarks and hands_results.multi_handedness:
        for hand_lm, handedness in zip(hands_results.multi_hand_landmarks,
                                       hands_results.multi_handedness):
            label = handedness.classification[0].label
            kp = get_hand_kp(hand_lm, w, h)
            if label == "Right":
                rhand_kp = kp
            else:
                lhand_kp = kp

    r_conf = sum(rhand_kp[i] for i in range(2, len(rhand_kp), 3))
    l_conf = sum(lhand_kp[i] for i in range(2, len(lhand_kp), 3))

    # In frontal images the person's right hand is on the camera's left side,
    # so MediaPipe labels it "Left". Swap when right slot is empty but left is strong.
    if r_conf <= 10 and l_conf > 10:
        rhand_kp = lhand_kp
        r_conf = l_conf

    if r_conf <= 10:
        return None

    # Same normalization as alphabet_recognition.py
    hand_points = helper.removePoints(rhand_kp)   # strips confidence → 42 floats

    p1 = [hand_points[0], hand_points[1]]
    p2 = [hand_points[18], hand_points[19]]
    distance = math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)
    if distance == 0:
        return None

    scale.scalePoints(hand_points, distance)       # matches alphabet pipeline exactly
    results, _ = move.centerPoints(hand_points)    # wrist anchored to (150, 150)

    return results                                 # 42 floats


def ensure_word_table(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS wordDataset (
            id INTEGER PRIMARY KEY,
            x1 DOUBLE, y1 DOUBLE, x2 DOUBLE, y2 DOUBLE,
            x3 DOUBLE, y3 DOUBLE, x4 DOUBLE, y4 DOUBLE,
            x5 DOUBLE, y5 DOUBLE, x6 DOUBLE, y6 DOUBLE,
            x7 DOUBLE, y7 DOUBLE, x8 DOUBLE, y8 DOUBLE,
            x9 DOUBLE, y9 DOUBLE, x10 DOUBLE, y10 DOUBLE,
            x11 DOUBLE, y11 DOUBLE, x12 DOUBLE, y12 DOUBLE,
            x13 DOUBLE, y13 DOUBLE, x14 DOUBLE, y14 DOUBLE,
            x15 DOUBLE, y15 DOUBLE, x16 DOUBLE, y16 DOUBLE,
            x17 DOUBLE, y17 DOUBLE, x18 DOUBLE, y18 DOUBLE,
            x19 DOUBLE, y19 DOUBLE, x20 DOUBLE, y20 DOUBLE,
            x21 DOUBLE, y21 DOUBLE,
            label VARCHAR(30)
        )
    """)
    conn.commit()


def build_insert_sql():
    cols = [f"x{i}" for i in range(1, 22)] + [f"y{i}" for i in range(1, 22)] + ["label"]
    placeholders = ",".join(["?"] * len(cols))
    return f"INSERT INTO wordDataset ({','.join(cols)}) VALUES ({placeholders})"


def cols_to_row(features, label):
    # features = [x1,y1,x2,y2,...,x21,y21] interleaved → split into x list and y list
    x_vals = features[0::2]
    y_vals = features[1::2]
    return x_vals + y_vals + [label]


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset_root", help="Path to image dataset root folder")
    parser.add_argument("--clear", action="store_true",
                        help="Delete existing wordDataset rows before inserting")
    args = parser.parse_args()

    if not os.path.isdir(args.dataset_root):
        print(f"ERROR: '{args.dataset_root}' is not a valid directory.")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    ensure_word_table(conn)

    if args.clear:
        word_labels = [
            d for d in os.listdir(args.dataset_root)
            if os.path.isdir(os.path.join(args.dataset_root, d))
        ]
        for lbl in word_labels:
            cur.execute("DELETE FROM wordDataset WHERE label=?", (lbl,))
        conn.commit()
        print(f"Cleared {word_labels} from wordDataset.")

    sql = build_insert_sql()
    IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    total_inserted = 0
    total_skipped = 0

    with mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=2,
        min_detection_confidence=0.3
    ) as hands_detector:

        for label in sorted(os.listdir(args.dataset_root)):
            label_dir = os.path.join(args.dataset_root, label)
            if not os.path.isdir(label_dir):
                continue

            inserted = skipped = 0
            for fname in os.listdir(label_dir):
                if os.path.splitext(fname)[1].lower() not in IMAGE_EXTS:
                    continue
                img_path = os.path.join(label_dir, fname)
                feats = extract_features(img_path, hands_detector)
                if feats is None:
                    skipped += 1
                    continue
                row = cols_to_row(feats, label)
                cur.execute(sql, row)
                inserted += 1

            conn.commit()
            print(f"  {label}: {inserted} inserted, {skipped} skipped")
            total_inserted += inserted
            total_skipped += skipped

    conn.close()
    print(f"\nDone. Total inserted: {total_inserted}, skipped: {total_skipped}")
    print("Now run: python -m PSL.word_recognition.train_word_model")


if __name__ == "__main__":
    main()
