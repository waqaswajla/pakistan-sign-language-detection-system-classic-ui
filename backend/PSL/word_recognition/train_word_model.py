# -*- coding: utf-8 -*-
"""
Train word recognition model from rightHandDataset.
Same pipeline as alphabet model: right hand only, 42 features, scale+center.

Run from backend/ directory after images_to_db.py --dataset <words> --clear:
    python -m PSL.word_recognition.train_word_model
"""

import sys
import sqlite3
import pickle
import numpy as np

from sklearn import preprocessing
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.utils import to_categorical


def train_words():
    connection = sqlite3.connect("data\\db\\main_dataset.db")
    crsr = connection.cursor()

    cols = ",".join([f"x{i},y{i}" for i in range(1, 22)])
    crsr.execute(f"SELECT {cols}, label FROM wordDataset")
    rows = crsr.fetchall()

    if not rows:
        print("No data found in wordDataset. Run images_to_word_db.py first.")
        sys.exit(1)

    features = [list(r[:-1]) for r in rows]
    labels   = [r[-1] for r in rows]

    le = preprocessing.LabelEncoder()
    label_encoded = le.fit_transform(labels)
    num_classes = len(set(labels))
    print(f"Classes ({num_classes}): {list(le.classes_)}")
    print(f"Total samples: {len(features)}")

    label_cat = to_categorical(label_encoded, num_classes=num_classes)

    X_train, X_test, y_train, y_test = train_test_split(
        features, label_cat, test_size=0.2, random_state=42, stratify=label_encoded
    )

    scaler = StandardScaler().fit(X_train)
    X_train = scaler.transform(X_train)
    X_test  = scaler.transform(X_test)

    pickle.dump(scaler, open("data\\models\\word_scaler.pkl", "wb"))
    pickle.dump(le,     open("data\\models\\word_label_encoder.pkl", "wb"))

    model = Sequential([
        Dense(256, activation='relu', input_shape=(42,)),
        Dropout(0.3),
        Dense(128, activation='relu'),
        Dropout(0.3),
        Dense(64,  activation='relu'),
        Dense(num_classes, activation='softmax'),
    ])
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

    model.fit(X_train, y_train, validation_data=(X_test, y_test),
              epochs=50, batch_size=32, verbose=1)

    score = model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest accuracy: {score[1]*100:.2f}%")

    model.save("data\\models\\word_model.h5")
    print("Saved: data\\models\\word_model.h5")


if __name__ == "__main__":
    train_words()
