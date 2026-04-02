from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'carbon_model.pkl')
model = joblib.load(MODEL_PATH)

# EXACT 10 features — same names, same order as model.feature_names_in_
FEATURE_COLUMNS = [
    'Vehicle_Monthly_Distance_Km',
    'Frequency_of_Traveling_by_Air_very frequently',
    'Vehicle_Type_electric',
    'How_Many_New_Clothes_Monthly',
    'Waste_Bag_Weekly_Count',
    'Sex_male',
    'Frequency_of_Traveling_by_Air_never',
    'Body_Type_obese',
    'Vehicle_Type_hybrid',
    'Frequency_of_Traveling_by_Air_rarely',
]


def build_feature_vector(data):
    features = {col: 0 for col in FEATURE_COLUMNS}

    # Numeric
    features['Vehicle_Monthly_Distance_Km']  = float(data.get('vehicle_monthly_distance_km', 0))
    features['How_Many_New_Clothes_Monthly'] = float(data.get('new_clothes_monthly', 0))
    features['Waste_Bag_Weekly_Count']       = float(data.get('waste_bag_weekly_count', 0))

    # Sex
    if str(data.get('sex', '')).lower() == 'male':
        features['Sex_male'] = 1

    # Body type
    if str(data.get('body_type', '')).lower() == 'obese':
        features['Body_Type_obese'] = 1

    # Vehicle type (petrol/lpg/diesel = baseline, all stay 0)
    vehicle = str(data.get('vehicle_type', '')).lower()
    if vehicle == 'electric':
        features['Vehicle_Type_electric'] = 1
    elif vehicle == 'hybrid':
        features['Vehicle_Type_hybrid'] = 1

    # Air travel — 3 one-hot columns ('frequently' is the baseline, all stay 0)
    air = str(data.get('air_travel_frequency', '')).lower()
    if air == 'very frequently':
        features['Frequency_of_Traveling_by_Air_very frequently'] = 1
    elif air == 'never':
        features['Frequency_of_Traveling_by_Air_never'] = 1
    elif air == 'rarely':
        features['Frequency_of_Traveling_by_Air_rarely'] = 1

    return [features[col] for col in FEATURE_COLUMNS]


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        feature_vector = build_feature_vector(data)
        X = np.array(feature_vector).reshape(1, -1)
        prediction = float(model.predict(X)[0])

        # Build breakdown using feature importances as weights
        km      = float(data.get('vehicle_monthly_distance_km', 0))
        air     = str(data.get('air_travel_frequency', 'never')).lower()
        clothes = float(data.get('new_clothes_monthly', 0))
        waste   = float(data.get('waste_bag_weekly_count', 0))
        vehicle = str(data.get('vehicle_type', 'petrol')).lower()

        transport_raw = (km / 2000) * 0.40
        if vehicle == 'electric':
            transport_raw *= 0.25   # EVs are much cleaner
        elif vehicle == 'hybrid':
            transport_raw *= 0.55

        air_raw      = {'very frequently': 0.22, 'frequently': 0.15, 'rarely': 0.06, 'never': 0.01}.get(air, 0.05)
        shopping_raw = min(0.15, (clothes / 10) * 0.08 + 0.02)
        waste_raw    = min(0.08, (waste / 5) * 0.04 + 0.01)
        energy_raw   = 0.12

        total_raw = transport_raw + air_raw + shopping_raw + waste_raw + energy_raw
        breakdown = {
            'transport':  round((transport_raw / total_raw) * prediction, 2),
            'air_travel': round((air_raw       / total_raw) * prediction, 2),
            'shopping':   round((shopping_raw  / total_raw) * prediction, 2),
            'waste':      round((waste_raw     / total_raw) * prediction, 2),
            'energy':     round((energy_raw    / total_raw) * prediction, 2),
        }

        return jsonify({
            'prediction': round(prediction, 2),
            'unit': 'kg CO2/year',
            'breakdown': breakdown,
            'status': 'success'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
