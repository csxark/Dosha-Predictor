from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from typing import Optional
import os

app = FastAPI(title="AyurvedaAI API", version="1.0.0")

# CORS: allow all origins. Do NOT combine allow_origins=["*"] with
# allow_credentials=True — the CORS spec forbids that combination and
# browsers silently reject the response.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Catch-all OPTIONS preflight handler — guarantees a 200 with CORS headers
# even if the middleware ordering somehow misses a route.
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str, request: Request):
    return JSONResponse(
        content={"ok": True},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        },
    )

# Load model and feature columns
MODEL_PATH = os.getenv("MODEL_PATH", "dosha_model.pkl")
model = None
feature_columns = None

@app.on_event("startup")
async def load_model():
    global model, feature_columns
    try:
        artifacts = joblib.load(MODEL_PATH)
        model = artifacts["model"]
        feature_columns = artifacts["feature_columns"]
        print(f"Model and feature columns loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"Warning: Could not load model: {e}")
        model = None
        feature_columns = None

# ---------------------------------------------------------------------------
# Encoding maps — must exactly match what was used during training
# ---------------------------------------------------------------------------

ENCODING_MAPS = {
    "bodyFrame": {
        "Thin and Lean": 0,
        "Medium": 1,
        "Well Built": 2,
    },
    "paceOfWork": {
        "Fast": 0,
        "Medium": 1,
        "Slow": 2,
    },
    "bodyEnergy": {
        "Low": 0,
        "Medium": 1,
        "High": 2,
    },
    "hungerPattern": {
        "Skips Meals": 0,
        "Irregular": 1,
        "Regular": 2,
    },
    "hairType": {
        "Dry": 0,
        "Normal": 1,
        "Greasy": 2,
    },
    "sleepPattern": {
        "Light Sleeper": 0,
        "Normal": 1,
        "Sleepy": 2,
    },
    "mentalActivity": {
        "Restless": 0,
        "Stable": 1,
        "Active": 2,
    },
    "voiceQuality": {
        "Deep": 0,
        "Rough": 1,
        "Fast": 2,
    },
    "jointStructure": {
        "Light": 0,
        "Medium": 1,
        "Heavy": 2,
    },
    "skinType": {
        "Dry": 0,
        "Rough": 1,
        "Soft": 2,
        "Oily": 3,
    },
    "bodyOdor": {
        "Mild": 0,
        "Moderate": 1,
        "Strong": 2,
    },
}

DOSHA_LABELS = {0: "Vata", 1: "Pitta", 2: "Kapha"}

FEATURE_ORDER = [
    "bodyFrame",
    "paceOfWork",
    "bodyEnergy",
    "hungerPattern",
    "hairType",
    "sleepPattern",
    "mentalActivity",
    "voiceQuality",
    "jointStructure",
    "skinType",
    "bodyOdor",
]


class AssessmentInput(BaseModel):
    bodyFrame: str
    paceOfWork: str
    bodyEnergy: str
    hungerPattern: str
    hairType: str
    sleepPattern: str
    mentalActivity: str
    voiceQuality: str
    jointStructure: str
    skinType: str
    bodyOdor: str


class PredictionResponse(BaseModel):
    primaryDosha: str
    confidence: float
    secondaryDosha: str
    secondaryConfidence: float
    keyTraits: list[str]


def encode_input(data: AssessmentInput) -> np.ndarray:
    """
    Encode assessment input into model features using one-hot encoding.
    Aligns columns with feature_columns and fills missing columns with 0.
    """
    # Create a dictionary of field_value pairs for one-hot encoding
    row_data = {
        "bodyFrame": data.bodyFrame,
        "paceOfWork": data.paceOfWork,
        "bodyEnergy": data.bodyEnergy,
        "hungerPattern": data.hungerPattern,
        "hairType": data.hairType,
        "sleepPattern": data.sleepPattern,
        "mentalActivity": data.mentalActivity,
        "voiceQuality": data.voiceQuality,
        "jointStructure": data.jointStructure,
        "skinType": data.skinType,
        "bodyOdor": data.bodyOdor,
    }
    
    # Create one-hot encoded features
    encoded_features = {}
    for field, value in row_data.items():
        # Create one-hot encoded keys for this field
        for possible_value in ENCODING_MAPS.get(field, {}).keys():
            key = f"{field}_{possible_value}"
            encoded_features[key] = 1 if value == possible_value else 0
    
    # Align with model's expected feature columns
    if feature_columns:
        # Create array aligned with feature_columns, filling missing columns with 0
        X = np.array([[encoded_features.get(col, 0) for col in feature_columns]])
    else:
        # Fallback to the original encoding if feature_columns not available
        X = np.array([[ENCODING_MAPS.get(field, {}).get(row_data[field], 0) for field in FEATURE_ORDER]])
    
    return X


def rule_based_predict(data: AssessmentInput):
    """Fallback rule-based prediction when model is not available."""
    scores = {"Vata": 0, "Pitta": 0, "Kapha": 0}

    # Vata indicators
    if data.bodyFrame == "Thin and Lean": scores["Vata"] += 2
    if data.paceOfWork == "Fast": scores["Vata"] += 2
    if data.bodyEnergy == "Low": scores["Vata"] += 1
    if data.sleepPattern == "Light Sleeper": scores["Vata"] += 2
    if data.mentalActivity == "Restless": scores["Vata"] += 2
    if data.hairType == "Dry": scores["Vata"] += 1
    if data.skinType == "Dry": scores["Vata"] += 1
    if data.bodyOdor == "Mild": scores["Vata"] += 1

    # Pitta indicators
    if data.bodyFrame == "Medium": scores["Pitta"] += 2
    if data.bodyEnergy == "High": scores["Pitta"] += 2
    if data.hungerPattern == "Regular": scores["Pitta"] += 2
    if data.voiceQuality == "Fast": scores["Pitta"] += 1
    if data.skinType == "Oily": scores["Pitta"] += 1
    if data.bodyOdor == "Strong": scores["Pitta"] += 2
    if data.mentalActivity == "Active": scores["Pitta"] += 1

    # Kapha indicators
    if data.bodyFrame == "Well Built": scores["Kapha"] += 2
    if data.paceOfWork == "Slow": scores["Kapha"] += 2
    if data.sleepPattern == "Sleepy": scores["Kapha"] += 2
    if data.hairType == "Greasy": scores["Kapha"] += 1
    if data.jointStructure == "Heavy": scores["Kapha"] += 2
    if data.skinType == "Soft": scores["Kapha"] += 1
    if data.bodyEnergy == "Medium": scores["Kapha"] += 1

    total = sum(scores.values()) or 1
    probs = {k: v / total for k, v in scores.items()}

    sorted_doshas = sorted(probs.items(), key=lambda x: x[1], reverse=True)
    return sorted_doshas[0][0], sorted_doshas[0][1], sorted_doshas[1][0], sorted_doshas[1][1]


def get_key_traits(data: AssessmentInput, primary_dosha: str) -> list[str]:
    """Return user-friendly trait descriptions."""
    traits = []
    field_labels = {
        "bodyFrame": {"Thin and Lean": "Lean Body Frame", "Medium": "Medium Body Frame", "Well Built": "Well-Built Frame"},
        "paceOfWork": {"Fast": "Fast Pace of Work", "Medium": "Moderate Work Pace", "Slow": "Slow and Steady Pace"},
        "bodyEnergy": {"Low": "Low Body Energy", "Medium": "Moderate Energy", "High": "High Body Energy"},
        "hungerPattern": {"Skips Meals": "Irregular Hunger", "Irregular": "Variable Appetite", "Regular": "Strong Regular Hunger"},
        "hairType": {"Dry": "Dry Hair Type", "Normal": "Normal Hair", "Greasy": "Oily Hair"},
        "sleepPattern": {"Light Sleeper": "Light Sleep Pattern", "Normal": "Normal Sleep", "Sleepy": "Deep Heavy Sleep"},
        "mentalActivity": {"Restless": "Restless Mind", "Stable": "Stable Mental Activity", "Active": "Active Sharp Mind"},
        "voiceQuality": {"Deep": "Deep Voice Quality", "Rough": "Rough Voice", "Fast": "Fast Talking Speed"},
        "jointStructure": {"Light": "Light Joint Structure", "Medium": "Medium Joints", "Heavy": "Heavy Joint Structure"},
        "skinType": {"Dry": "Dry Skin", "Rough": "Rough Skin Texture", "Soft": "Soft Smooth Skin", "Oily": "Oily Skin"},
        "bodyOdor": {"Mild": "Mild Body Odor", "Moderate": "Moderate Body Odor", "Strong": "Strong Body Odor"},
    }

    vata_key = ["paceOfWork", "sleepPattern", "mentalActivity", "bodyFrame", "bodyEnergy"]
    pitta_key = ["bodyEnergy", "hungerPattern", "bodyOdor", "mentalActivity", "voiceQuality"]
    kapha_key = ["jointStructure", "sleepPattern", "paceOfWork", "bodyFrame", "hairType"]

    dosha_fields = {"Vata": vata_key, "Pitta": pitta_key, "Kapha": kapha_key}.get(primary_dosha, vata_key)

    for field in dosha_fields[:4]:
        val = getattr(data, field)
        label = field_labels.get(field, {}).get(val, val)
        traits.append(label)

    return traits


@app.post("/predict", response_model=PredictionResponse)
async def predict_dosha(data: AssessmentInput):
    try:
        if model is not None:
            X = encode_input(data)
            probs = model.predict_proba(X)[0]
            pred_idx = int(np.argmax(probs))
            sorted_idx = np.argsort(probs)[::-1]

            primary_dosha = DOSHA_LABELS.get(pred_idx, "Vata")
            confidence = float(probs[sorted_idx[0]])
            secondary_dosha = DOSHA_LABELS.get(int(sorted_idx[1]), "Pitta")
            secondary_confidence = float(probs[sorted_idx[1]])
        else:
            primary_dosha, confidence, secondary_dosha, secondary_confidence = rule_based_predict(data)

        key_traits = get_key_traits(data, primary_dosha)

        return PredictionResponse(
            primaryDosha=primary_dosha,
            confidence=round(confidence, 3),
            secondaryDosha=secondary_dosha,
            secondaryConfidence=round(secondary_confidence, 3),
            keyTraits=key_traits,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "feature_columns_loaded": feature_columns is not None,
    }


@app.get("/")
async def root():
    return {"message": "AyurvedaAI API", "version": "1.0.0"}
