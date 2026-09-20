# -*- coding: utf-8 -*-
"""
Extract the first image from each dataset label folder and copy it to the
frontend public images directory as a numbered PNG file.

Run from backend/ directory:
    python extract_dataset_images.py

Each label folder maps to its 1-based index in the sorted label list,
matching the order used by the trained LabelEncoder (sklearn sorts alphabetically).
"""

import os
import sys
import io
import cv2
import numpy as np

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DATASET_ROOT = r"D:\fypdataset_good"
OUTPUT_DIR   = r"D:\4-2026\frontend\public\images\alphabet"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Sorted same way sklearn LabelEncoder sorts — by Unicode code point
labels = sorted(
    d for d in os.listdir(DATASET_ROOT)
    if os.path.isdir(os.path.join(DATASET_ROOT, d))
)

print(f"Found {len(labels)} labels: {labels}\n")

for idx, label in enumerate(labels, 1):
    label_dir = os.path.join(DATASET_ROOT, label)
    found = False

    for fname in sorted(os.listdir(label_dir)):
        ext = os.path.splitext(fname)[1].lower()
        if ext not in IMAGE_EXTS:
            continue

        src = os.path.join(label_dir, fname)
        dst = os.path.join(OUTPUT_DIR, f"{idx}.png")

        raw = np.fromfile(src, dtype=np.uint8)
        img = cv2.imdecode(raw, cv2.IMREAD_COLOR)
        if img is None:
            continue

        cv2.imwrite(dst, img)
        print(f"  [{idx:2d}] {label}  ←  {fname}")
        found = True
        break

    if not found:
        print(f"  [{idx:2d}] {label}  ← WARNING: no image found")

print(f"\nDone. {len(labels)} images written to {OUTPUT_DIR}")
print("Sorted label order (matches LabelEncoder):")
for i, l in enumerate(labels, 1):
    print(f"  {i:2d}. {l}")
