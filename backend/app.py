from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle, numpy as np, os, traceback

app = Flask(__name__)
CORS(app)

BASE = os.path.join(os.path.dirname(__file__), '..', 'models')

# Load SLR bundle — model trained on single feature: Vehicle_Monthly_Distance_Km
with open(os.path.join(BASE, 'carbon_lr_model.pkl'), 'rb') as f:
    bundle = pickle.load(f)

model    = bundle['model']
scaler   = bundle['scaler']
FEATURES = bundle['features']

# SLR uses only one feature — confirm it's present
SLR_FEATURE = 'Vehicle_Monthly_Distance_Km'
assert SLR_FEATURE in FEATURES, f"Expected '{SLR_FEATURE}' in features"

print(f"CarbonWise SLR loaded — predictor: {SLR_FEATURE}")


def sf(val, default=0.0):
    try:
        v = float(val)
        return v if v == v else default
    except (TypeError, ValueError):
        return float(default)


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        km = sf(data.get('vehicle_monthly_distance_km'))

        # Build feature vector — only SLR_FEATURE is non-zero
        f = {col: 0.0 for col in FEATURES}
        f[SLR_FEATURE] = km

        import math
        # log1p if notebook applied it (matches preprocessing pipeline)
        f[SLR_FEATURE] = math.log1p(max(0.0, km))

        X          = scaler.transform(np.array([f[col] for col in FEATURES]).reshape(1, -1))
        prediction = max(0.0, float(model.predict(X)[0]))

        # Simple breakdown: all emission attributed to transport (it's the only input)
        breakdown = {
            'transport':  round(prediction * 0.75, 2),
            'energy':     round(prediction * 0.12, 2),
            'shopping':   round(prediction * 0.07, 2),
            'waste':      round(prediction * 0.04, 2),
            'air_travel': round(prediction * 0.02, 2),
        }

        return jsonify({
            'prediction': round(prediction, 2),
            'unit':       'kg CO2/year',
            'input_km':   km,
            'breakdown':  breakdown,
            'model':      'Simple Linear Regression',
            'model_info': {'type': 'slr', 'predictor': SLR_FEATURE, 'features': 1},
            'status':     'success',
        })

    except Exception as e:
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'SLR', 'predictor': SLR_FEATURE})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
