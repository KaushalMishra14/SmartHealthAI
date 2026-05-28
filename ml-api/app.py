from flask import Flask, jsonify, request
from flask_cors import CORS
from tensorflow.keras.models import load_model
import pandas as pd
import numpy as np
import json

app = Flask(__name__)
CORS(app)

print("Loading model...")

model = load_model("model/disease_predictor_fixed.h5", compile=False)

disease_labels_df = pd.read_csv("model/disease_labels.csv")
symptom_df = pd.read_csv("model/symptom_list.csv")

disease_labels = disease_labels_df.iloc[:, 0].tolist()
symptom_list = symptom_df.iloc[:, 0].tolist()

with open("model/remedies.json", "r") as f:
    remedies = json.load(f)

print("Model loaded successfully")

def normalize_text(text):
    return text.strip().lower()

def get_remedy_info(disease):
    disease_key = None

    for key in remedies.keys():
        if normalize_text(key) == normalize_text(disease):
            disease_key = key
            break

    if disease_key:
        return remedies[disease_key]

    return {
        "home_remedy": [],
        "ayurvedic": [],
        "doctor_advice": "Consult a qualified doctor for proper diagnosis and treatment.",
        "learn_more": ""
    }

@app.route("/")
def home():
    return jsonify({
        "message": "ML API Ready",
        "total_symptoms": len(symptom_list),
        "total_diseases": len(disease_labels)
    })

@app.route("/symptoms", methods=["GET"])
def get_symptoms():
    return jsonify({
        "symptoms": symptom_list
    })

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    selected_symptoms = data.get("symptoms", [])

    if not selected_symptoms:
        return jsonify({
            "success": False,
            "message": "No symptoms selected"
        }), 400

    input_vector = np.zeros(len(symptom_list))

    for symptom in selected_symptoms:
        if symptom in symptom_list:
            index = symptom_list.index(symptom)
            input_vector[index] = 1

    prediction = model.predict(input_vector.reshape(1, -1))
    predicted_index = int(np.argmax(prediction))
    confidence = float(np.max(prediction))

    disease = disease_labels[predicted_index]
    remedy_info = get_remedy_info(disease)

    return jsonify({
        "success": True,
        "disease": disease,
        "confidence": round(confidence * 100, 2),
        "remedies": remedy_info,
        "selected_symptoms": selected_symptoms
    })

if __name__ == "__main__":
    app.run(port=8000, debug=True)