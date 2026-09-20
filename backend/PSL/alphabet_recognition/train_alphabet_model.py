# -*- coding: utf-8 -*-
"""
Created on Thu Jul  4 18:55:38 2019

"""

import sqlite3
import numpy as np
import pickle

from sklearn import preprocessing
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.utils import to_categorical


from sklearn.metrics import confusion_matrix, classification_report
from matplotlib import pyplot as plt
from tensorflow.keras.callbacks import Callback


class EpochBar(Callback):
    def on_train_begin(self, logs=None):
        self.epochs = self.params['epochs']
        print(f"\nTraining for {self.epochs} epochs:\n")

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        filled = int((epoch + 1) / self.epochs * 20)
        bar = '█' * filled + '░' * (20 - filled)
        pct = (epoch + 1) / self.epochs * 100
        loss = logs.get('loss', 0)
        acc  = logs.get('accuracy', 0)
        val_loss = logs.get('val_loss', 0)
        val_acc  = logs.get('val_accuracy', 0)
        print(f"Epoch {epoch+1:3d}/{self.epochs} [{bar}] {pct:5.1f}%"
              f"  loss: {loss:.4f}  acc: {acc:.4f}"
              f"  val_loss: {val_loss:.4f}  val_acc: {val_acc:.4f}")


def train_alphabets():    
    """
    extracting data from db
    """
    connection = sqlite3.connect("data\\db\\main_dataset.db") 
    crsr = connection.cursor()
    
    # extracting x and y points
    sql = 'SELECT x1,y1'
    for x in range(2,22):
        sql = sql + ',x'+str(x)+',y'+str(x)
    sql = sql + ' FROM alphabetDataset WHERE 1'
    crsr.execute(sql)
    feature_res = crsr.fetchall()
    feature_res = np.asarray(feature_res)
    features=[]
    for x in feature_res:
        features.append(x)
    
    # extracting labels
    crsr.execute('SELECT label FROM alphabetDataset WHERE 1')
    label_res = crsr.fetchall()
    labels=[]
    for x in label_res:
        labels.append(x)
        
    #creating labelEncoder
    le = preprocessing.LabelEncoder()
    # Converting string labels into numbers.
    label_encoded=le.fit_transform(labels)

    num_classes = len(set(le.classes_))
    label_encoded = to_categorical(label_encoded, num_classes=num_classes)

    X_train, X_test, y_train, y_test = train_test_split(features, label_encoded, test_size=0.2)

    scaler = StandardScaler().fit(X_train)
    X_train = scaler.transform(X_train)
    X_test = scaler.transform(X_test)
    pickle.dump(scaler, open("data\\models\\alphabet_scaler.pkl", "wb"))
    pickle.dump(le, open("data\\models\\alphabet_label_encoder.pkl", "wb"))
    
    # Initialize the constructor
    model = Sequential()
    
    # Add an input layer 
    model.add(Dense(120, activation='relu', input_shape=(42,)))
    model.add(Dropout(0.3))
    model.add(Dense(64, activation='relu'))
    model.add(Dropout(0.3))
    model.add(Dense(num_classes, activation='softmax'))

    model.compile(loss='categorical_crossentropy',
                  optimizer='adam',
                  metrics=['accuracy'])
                       
    history = model.fit(X_train, y_train, validation_split=0.20,
                        epochs=25, batch_size=1, verbose=0,
                        callbacks=[EpochBar()])

    model.save("data\\models\\alphabet_model.h5")
    
    y_pred = model.predict(X_test)
    score = model.evaluate(X_test, y_test,verbose=1)
    #
    print("\n%s: %.2f%%" % (model.metrics_names[1], score[1]*100))
    
    # list all data in history
    print(history.history.keys())
    # summarize history for accuracy
    plt.plot(history.history['accuracy'])
    plt.plot(history.history['val_accuracy'])
    plt.title('Accuracy vs Epoch')
    plt.ylabel('accuracy')
    plt.xlabel('epoch')
    plt.legend(['train', 'test'], loc='upper left')
    plt.show()
    # summarize history for loss
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('model loss')
    plt.ylabel('loss')
    plt.xlabel('epoch')
    plt.legend(['train', 'test'], loc='upper left')
    #plt.figure(figsize = (30,30))
    plt.show()
    
    
    print(model.summary())
    cm = confusion_matrix(y_test.argmax(axis=1), y_pred.argmax(axis=1))
    
    import itertools
    plt.rcParams.update({'font.size': 10})

    def plot_confusion_matrix(cm, classes, normalize=False,
                              title='Confusion matrix', cmap=plt.cm.Blues):
        if normalize:
            cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]

        plt.imshow(cm, interpolation='nearest', cmap=cmap)
        plt.title(title, fontsize=14)
        plt.colorbar()
        tick_marks = np.arange(len(classes))
        plt.xticks(tick_marks, classes, rotation=90, fontsize=9)
        plt.yticks(tick_marks, classes, fontsize=9)

        fmt = '.2f' if normalize else 'd'
        thresh = cm.max() / 2.
        for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
            val = format(cm[i, j], fmt)
            if normalize and cm[i, j] < 0.01:
                continue  # skip near-zero cells to reduce clutter
            plt.text(j, i, val, horizontalalignment="center", fontsize=7,
                     color="white" if cm[i, j] > thresh else "black")

        plt.tight_layout()
        plt.ylabel('True label', fontsize=12)
        plt.xlabel('Predicted label', fontsize=12)

    l = np.array(labels)
    l = np.unique(l)
    class_names = l

    plt.figure(figsize=(40, 40))
    plot_confusion_matrix(cm, classes=class_names, normalize=True,
                          title='Normalized confusion matrix')
    plt.savefig("data\\models\\confusion_matrix.png", dpi=150, bbox_inches='tight')
    plt.show()
    print("Confusion matrix saved to data\\models\\confusion_matrix.png")


if __name__ == "__main__":
    train_alphabets()










