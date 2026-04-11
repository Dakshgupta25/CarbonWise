from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib, pickle, numpy as np, os, math, traceback

app = Flask(__name__)
CORS(app)

BASE = os.path.join(os.path.dirname(__file__), '..', 'models')

# Load Random Forest
rf_model = joblib.load(os.path.join(BASE, 'carbon_model.pkl'))

RF_FEATURES = [
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

# Load Linear Regression bundle (model + scaler + features)
with open(os.path.join(BASE, 'carbon_lr_model.pkl'), 'rb') as f:
    lr_bundle = pickle.load(f)

lr_model    = lr_bundle['model']
lr_scaler   = lr_bundle['scaler']
LR_FEATURES = lr_bundle['features']

print(f"RF  features: {len(RF_FEATURES)}")
print(f"LR  features: {len(LR_FEATURES)}")


def sf(val, default=0.0):
    """Safe float — treats empty string, None, and missing as default."""
    try:
        v = float(val)
        return v if not (v != v) else default   # guard NaN too
    except (TypeError, ValueError):
        return float(default)


def parse_payload(data):
    return {
        'vehicle_monthly_distance_km': sf(data.get('vehicle_monthly_distance_km')),
        'new_clothes_monthly':         sf(data.get('new_clothes_monthly')),
        'waste_bag_weekly_count':      sf(data.get('waste_bag_weekly_count')),
        'internet_daily_hour':         sf(data.get('internet_daily_hour')),
        'tv_pc_daily_hour':            sf(data.get('tv_pc_daily_hour')),
        'sex':                  str(data.get('sex',   'female')).lower(),
        'body_type':            str(data.get('body_type', 'normal')).lower(),
        'vehicle_type':         str(data.get('vehicle_type', 'petrol')).lower(),
        'transport':            str(data.get('transport', 'public')).lower(),
        'air_travel_frequency': str(data.get('air_travel_frequency', 'never')).lower(),
        'waste_bag_size':       str(data.get('waste_bag_size', 'medium')).lower(),
        'heating_energy_source':str(data.get('heating_energy_source', 'natural gas')).lower(),
        'energy_efficiency':    str(data.get('energy_efficiency', 'Sometimes')),
        'recycling':            data.get('recycling', []),
        'cooking_with':         data.get('cooking_with', []),
    }


def build_rf_vector(p):
    f = {col: 0 for col in RF_FEATURES}
    f['Vehicle_Monthly_Distance_Km']  = p['vehicle_monthly_distance_km']
    f['How_Many_New_Clothes_Monthly'] = p['new_clothes_monthly']
    f['Waste_Bag_Weekly_Count']       = p['waste_bag_weekly_count']

    if p['sex'] == 'male':          f['Sex_male'] = 1
    if p['body_type'] == 'obese':   f['Body_Type_obese'] = 1
    if p['vehicle_type'] == 'electric': f['Vehicle_Type_electric'] = 1
    elif p['vehicle_type'] == 'hybrid': f['Vehicle_Type_hybrid'] = 1

    air = p['air_travel_frequency']
    if air == 'very frequently': f['Frequency_of_Traveling_by_Air_very frequently'] = 1
    elif air == 'never':         f['Frequency_of_Traveling_by_Air_never'] = 1
    elif air == 'rarely':        f['Frequency_of_Traveling_by_Air_rarely'] = 1

    return [f[col] for col in RF_FEATURES]


def build_lr_vector(p):
    f = {col: 0.0 for col in LR_FEATURES}

    # log1p on skewed numeric columns (matches notebook preprocessing)
    for col, raw in [
        ('Vehicle_Monthly_Distance_Km',  p['vehicle_monthly_distance_km']),
        ('How_Many_New_Clothes_Monthly', p['new_clothes_monthly']),
        ('Waste_Bag_Weekly_Count',       p['waste_bag_weekly_count']),
        ('How_Long_Internet_Daily_Hour', p['internet_daily_hour']),
        ('How_Long_TV_PC_Daily_Hour',    p['tv_pc_daily_hour']),
    ]:
        if col in f:
            f[col] = math.log1p(raw)

    if p['sex'] == 'male' and 'Sex_male' in f:
        f['Sex_male'] = 1.0

    for val in ('obese', 'overweight', 'underweight'):
        key = f'Body_Type_{val}'
        if key in f and p['body_type'] == val:
            f[key] = 1.0

    for val in ('electric', 'hybrid', 'lpg', 'petrol', 'No Vehicle'):
        key = f'Vehicle_Type_{val}'
        if key in f and p['vehicle_type'] == val:
            f[key] = 1.0

    for val in ('private', 'public', 'walk/bicycle'):
        key = f'Transport_{val}'
        if key in f and p['transport'] == val:
            f[key] = 1.0

    for val in ('frequently', 'never', 'rarely', 'very frequently'):
        key = f'Frequency_of_Traveling_by_Air_{val}'
        if key in f and p['air_travel_frequency'] == val:
            f[key] = 1.0

    for val in ('extra large', 'large', 'medium', 'small'):
        key = f'Waste_Bag_Size_{val}'
        if key in f and p['waste_bag_size'] == val:
            f[key] = 1.0

    for val in ('coal', 'electricity', 'natural gas', 'wood'):
        key = f'Heating_Energy_Source_{val}'
        if key in f and p['heating_energy_source'] == val:
            f[key] = 1.0

    for val in ('No', 'Sometimes', 'Yes'):
        key = f'Energy_efficiency_{val}'
        if key in f and p['energy_efficiency'] == val:
            f[key] = 1.0

    for item in p['recycling']:
        key = f'Recycling_{item.capitalize()}'
        if key in f:
            f[key] = 1.0

    known_cooking = {'airfryer', 'grill', 'microwave', 'oven', 'stove'}
    for method in p['cooking_with']:
        cat = method.lower() if method.lower() in known_cooking else 'Other'
        key = f'Cooking_With_{cat}'
        if key in f:
            f[key] = 1.0

    vector = np.array([f[col] for col in LR_FEATURES]).reshape(1, -1)
    return lr_scaler.transform(vector)


def estimate_breakdown(prediction, p):
    km      = p['vehicle_monthly_distance_km']
    air     = p['air_travel_frequency']
    clothes = p['new_clothes_monthly']
    waste   = p['waste_bag_weekly_count']
    vt      = p['vehicle_type']

    transport_raw = (km / 2000) * 0.40
    if vt == 'electric': transport_raw *= 0.25
    elif vt == 'hybrid': transport_raw *= 0.55

    air_raw      = {'very frequently': 0.22, 'frequently': 0.15, 'rarely': 0.06, 'never': 0.01}.get(air, 0.05)
    shopping_raw = min(0.15, (clothes / 10) * 0.08 + 0.02)
    waste_raw    = min(0.08, (waste / 5) * 0.04 + 0.01)
    energy_raw   = 0.12

    total = transport_raw + air_raw + shopping_raw + waste_raw + energy_raw
    if total == 0:
        total = 1
    return {
        'transport':  round((transport_raw / total) * prediction, 2),
        'air_travel': round((air_raw       / total) * prediction, 2),
        'shopping':   round((shopping_raw  / total) * prediction, 2),
        'waste':      round((waste_raw     / total) * prediction, 2),
        'energy':     round((energy_raw    / total) * prediction, 2),
    }


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        model_type = str(data.get('model_type', 'rf')).lower()
        p = parse_payload(data)

        if model_type == 'lr':
            X          = build_lr_vector(p)
            prediction = float(lr_model.predict(X)[0])
            model_name = 'Linear Regression'
            model_info = {'type': 'lr', 'features': len(LR_FEATURES), 'scaled': True}
        else:
            X          = np.array(build_rf_vector(p)).reshape(1, -1)
            prediction = float(rf_model.predict(X)[0])
            model_name = 'Random Forest'
            model_info = {'type': 'rf', 'features': len(RF_FEATURES), 'scaled': False}

        prediction = max(0.0, prediction)

        return jsonify({
            'prediction': round(prediction, 2),
            'unit':       'kg CO2/year',
            'breakdown':  estimate_breakdown(prediction, p),
            'model':      model_name,
            'model_info': model_info,
            'status':     'success',
        })

    except Exception as e:
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status':      'ok',
        'rf_loaded':   rf_model is not None,
        'lr_loaded':   lr_model is not None,
        'lr_features': len(LR_FEATURES),
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
