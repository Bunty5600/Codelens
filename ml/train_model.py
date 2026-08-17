import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

df = pd.read_csv("dataset/dataset.csv")

X = df[
    [
        "cyclomatic_complexity",
        "halstead_volume",
        "maintainability_index",
        "loc",
    ]
]

y = df["defect_risk"]

label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = RandomForestClassifier(
    n_estimators=150,
    max_depth=12,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train_scaled, y_train)

train_pred = model.predict(X_train_scaled)
test_pred = model.predict(X_test_scaled)

print("Train Accuracy:", accuracy_score(y_train, train_pred))
print("Test Accuracy:", accuracy_score(y_test, test_pred))
print()
print(classification_report(y_test, test_pred))
print()
print(confusion_matrix(y_test, test_pred))

# Add here
scores = cross_val_score(model, X_train_scaled, y_train, cv=5)

print()
print("Cross Validation Scores:", scores)
print("Average Cross Validation Accuracy:", scores.mean())

joblib.dump(model, "models/model.pkl")
joblib.dump(scaler, "models/scaler.pkl")
joblib.dump(label_encoder, "models/label_encoder.pkl")

print("Model saved successfully!")