from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # allows React frontend to call this API

# Load model once at startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'carbon_model.pkl')
model = joblib.load(MODEL_PATH)

# These must match EXACTLY the columns your model was trained on (after pd.get_dummies)
# Order matters — keep this the same as your training feature order
FEATURE_COLUMNS = [
    'Vehicle_Monthly_Distance_Km',
    'How_Many_New_Clothes_Monthly',
    'Waste_Bag_Weekly_Count',
    'How_Long_Internet_Daily_Hour',
    'How_Long_TV_PC_Daily_Hour',
    'Body_Type_obese',
    'Body_Type_overweight',
    'Body_Type_underweight',
    'Sex_male',
    'Diet_omnivore',
    'Diet_pescatarian',
    'Diet_vegan',
    'Diet_vegetarian',
    'Heating_Energy_Source_coal',
    'Heating_Energy_Source_electricity',
    'Heating_Energy_Source_natural gas',
    'Heating_Energy_Source_wood',
    'Transport_private',
    'Transport_public',
    'Transport_walk/bicycle',
    'Vehicle_Type_electric',
    'Vehicle_Type_hybrid',
    'Vehicle_Type_lpg',
    'Vehicle_Type_petrol',
    'Social_Activity_never',
    'Social_Activity_often',
    'Frequency_of_Traveling_by_Air_frequently',
    'Frequency_of_Traveling_by_Air_never',
    'Frequency_of_Traveling_by_Air_rarely',
    'Frequency_of_Traveling_by_Air_very frequently',
    'Waste_Bag_Size_extra large',
    'Waste_Bag_Size_large',
    'Waste_Bag_Size_medium',
    'Waste_Bag_Size_small',
    'Energy_efficiency_No',
    'Energy_efficiency_Sometimes',
    'Recycling_Glass',
    'Recycling_Metal',
    'Recycling_Paper',
    'Recycling_Plastic',
    'Cooking_With_airfryer',
    'Cooking_With_grill',
    'Cooking_With_microwave',
    'Cooking_With_oven',
    'Cooking_With_stove',
]


def build_feature_vector(data):
    """
    Convert the JSON payload from the frontend into the feature vector
    the model expects. All missing columns default to 0.
    """
    features = {col: 0 for col in FEATURE_COLUMNS}

    # Numeric fields
    features['Vehicle_Monthly_Distance_Km'] = float(data.get('vehicle_monthly_distance_km', 0))
    features['How_Many_New_Clothes_Monthly'] = float(data.get('new_clothes_monthly', 0))
    features['Waste_Bag_Weekly_Count'] = float(data.get('waste_bag_weekly_count', 0))
    features['How_Long_Internet_Daily_Hour'] = float(data.get('internet_daily_hour', 0))
    features['How_Long_TV_PC_Daily_Hour'] = float(data.get('tv_pc_daily_hour', 0))

    # Body type (one-hot)
    body_type = data.get('body_type', 'normal')  # normal is the baseline (all zeros)
    if body_type in ('obese', 'overweight', 'underweight'):
        features[f'Body_Type_{body_type}'] = 1

    # Sex
    if data.get('sex', '').lower() == 'male':
        features['Sex_male'] = 1

    # Diet (one-hot, baseline = omnivore handled by dropping one category)
    diet = data.get('diet', 'omnivore').lower()
    if diet in ('omnivore', 'pescatarian', 'vegan', 'vegetarian'):
        features[f'Diet_{diet}'] = 1

    # Heating energy source
    heating = data.get('heating_energy_source', 'natural gas').lower()
    if heating in ('coal', 'electricity', 'natural gas', 'wood'):
        features[f'Heating_Energy_Source_{heating}'] = 1

    # Transport
    transport = data.get('transport', 'public').lower()
    if transport in ('private', 'public', 'walk/bicycle'):
        features[f'Transport_{transport}'] = 1

    # Vehicle type
    vehicle = data.get('vehicle_type', 'petrol').lower()
    if vehicle in ('electric', 'hybrid', 'lpg', 'petrol'):
        features[f'Vehicle_Type_{vehicle}'] = 1

    # Social activity
    social = data.get('social_activity', 'sometimes').lower()
    if social in ('never', 'often'):
        features[f'Social_Activity_{social}'] = 1

    # Air travel frequency
    air = data.get('air_travel_frequency', 'never').lower()
    if air in ('frequently', 'never', 'rarely', 'very frequently'):
        features[f'Frequency_of_Traveling_by_Air_{air}'] = 1

    # Waste bag size
    waste_size = data.get('waste_bag_size', 'medium').lower()
    if waste_size in ('extra large', 'large', 'medium', 'small'):
        features[f'Waste_Bag_Size_{waste_size}'] = 1

    # Energy efficiency
    energy_eff = data.get('energy_efficiency', 'Sometimes')
    if energy_eff in ('No', 'Sometimes'):
        features[f'Energy_efficiency_{energy_eff}'] = 1

    # Recycling (multi-select — each is its own binary column)
    recycling = data.get('recycling', [])
    for item in recycling:
        key = f'Recycling_{item.capitalize()}'
        if key in features:
            features[key] = 1

    # Cooking methods (multi-select)
    cooking = data.get('cooking_with', [])
    for method in cooking:
        key = f'Cooking_With_{method.lower()}'
        if key in features:
            features[key] = 1

    return [features[col] for col in FEATURE_COLUMNS]


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        feature_vector = build_feature_vector(data)
        X = np.array(feature_vector).reshape(1, -1)
        prediction = model.predict(X)[0]

        # Estimate breakdown percentages (based on feature importance from your notebook)
        vehicle_km = float(data.get('vehicle_monthly_distance_km', 0))
        air = data.get('air_travel_frequency', 'never').lower()
        new_clothes = float(data.get('new_clothes_monthly', 0))
        waste = float(data.get('waste_bag_weekly_count', 0))

        air_weight = {'very frequently': 0.22, 'frequently': 0.15, 'rarely': 0.06, 'never': 0.02}.get(air, 0.02)
        transport_pct = min(0.45, (vehicle_km / 2000) * 0.40 + 0.05)
        air_pct = air_weight
        shopping_pct = min(0.15, (new_clothes / 10) * 0.08 + 0.02)
        waste_pct = min(0.10, (waste / 5) * 0.05 + 0.01)
        energy_pct = max(0.05, 1 - transport_pct - air_pct - shopping_pct - waste_pct)

        total = transport_pct + air_pct + shopping_pct + waste_pct + energy_pct
        breakdown = {
            'transport': round((transport_pct / total) * float(prediction), 2),
            'air_travel': round((air_pct / total) * float(prediction), 2),
            'shopping': round((shopping_pct / total) * float(prediction), 2),
            'waste': round((waste_pct / total) * float(prediction), 2),
            'energy': round((energy_pct / total) * float(prediction), 2),
        }

        return jsonify({
            'prediction': round(float(prediction), 2),
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
