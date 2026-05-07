import os
import joblib
import numpy as np

BASE_DIR = os.path.dirname(__file__)

# Load ML artifacts
model = joblib.load(
    os.path.join(BASE_DIR, "models", "model.pkl")
)

scaler = joblib.load(
    os.path.join(BASE_DIR, "models", "scaler.pkl")
)

label_encoder = joblib.load(
    os.path.join(BASE_DIR, "models", "label_encoder.pkl")
)


def predict_defect_risk(metrics: dict):

    cc = metrics.get("cc", 0)

    mi = metrics.get("mi", 0)

    loc = metrics.get("loc", 0)

    halstead_volume = (
        metrics.get("halstead", {})
        .get("volume", 0)
    )

    # Feature order MUST match training
    features = np.array([
        [
            cc,
            halstead_volume,
            mi,
            loc
        ]
    ])

    # Scale features
    scaled = scaler.transform(features)

    # Predict
    prediction = model.predict(scaled)[0]

    # Decode label
    label = label_encoder.inverse_transform(
        [prediction]
    )[0]

    # Confidence
    confidence = round(
        max(model.predict_proba(scaled)[0]) * 100,
        2
    )

    return {
        "risk_level": label,
        "confidence": confidence
    }