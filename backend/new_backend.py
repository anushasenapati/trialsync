from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import firebase_admin
from firebase_admin import credentials, firestore
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# Initialize Firebase Admin
cred = credentials.Certificate("trialmatch-b476b-firebase-adminsdk-fbsvc-63b45c05f3.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- Data Models ---
class Patient:
    def __init__(self, name, age, sex, weight, height,
                 diseases, biomarkers, latitude, longitude,
                 interventions):
        self.name = name
        self.age = age
        self.sex = sex
        self.weight = weight
        self.height = height
        self.diseases = diseases
        self.biomarkers = biomarkers
        self.interventions = interventions
        self.interested_trials = []

    @staticmethod
    def from_dict(data):
        return Patient(
            name=data.get('name',''),
            age=data.get('age',0),
            sex=data.get('sex',''),
            weight=data.get('weight',0),
            height=data.get('height',0),
            diseases=data.get('diseases',[]),
            biomarkers=data.get('biomarkers',[]),
            interventions=data.get('interventions',[])
        )

    def to_dict(self):
        return {
            'name': self.name,
            'age': self.age,
            'sex': self.sex,
            'weight': self.weight,
            'height': self.height,
            'diseases': self.diseases,
            'biomarkers': self.biomarkers,
            'interventions': self.interventions,
            'interested_trials': self.interested_trials
        }

class Trial:
    def __init__(self, id, title, description, aiRecommendation,
                 inclusion, exclusion, researcher):
        self.id = id
        self.title = title
        self.description = description
        self.aiRecommendation = aiRecommendation
        self.inclusion = inclusion
        self.exclusion = exclusion
        self.researcher = researcher
        self.interested_patients = []

    @staticmethod
    def from_dict(id, data):
        return Trial(
            id=id,
            title=data.get('title',''),
            description=data.get('description',''),
            aiRecommendation=data.get('aiRecommendation',''),
            inclusion=data.get('inclusion',[]),
            exclusion=data.get('exclusion',[]),
            researcher=data.get('researcher',{})
        )

    def to_dict(self):
        return {
            'title': self.title,
            'description': self.description,
            'aiRecommendation': self.aiRecommendation,
            'inclusion': self.inclusion,
            'exclusion': self.exclusion,
            'researcher': self.researcher,
            'interested_patients': self.interested_patients
        }

# --- Manager ---
class Manager:
    def __init__(self, db):
        self.db = db
        self.patients = {}
        self.trials = {}

    def load_data(self):
        # Load all patients
        for doc in self.db.collection('patients').stream():
            pat = Patient.from_dict(doc.to_dict())
            self.patients[pat.name] = pat
        # Load all trials
        for doc in self.db.collection('trials').stream():
            trial = Trial.from_dict(doc.id, doc.to_dict())
            self.trials[trial.id] = trial

    def add_patient(self, patient: Patient):
        self.patients[patient.name] = patient
        self.db.collection('patients').document(patient.name).set(patient.to_dict())

    def add_trial(self, trial: Trial):
        self.trials[trial.id] = trial
        self.db.collection('trials').document(trial.id).set(trial.to_dict())

    def get_patient(self, patient_name):
        return self.patients.get(patient_name)

    def get_trial(self, trial_id):
        return self.trials.get(trial_id)

    def express_interest(self, patient_id, trial_id):
        trial = self.get_trial(trial_id)
        if trial and patient_id not in trial.interested_patients:
            trial.interested_patients.append(patient_id)
            self.db.collection('trials').document(trial_id).update({'interested_patients': trial.interested_patients})
            return True
        return False

# --- Flask App ---
app = Flask(__name__)
CORS(app)
model = SentenceTransformer("all-MiniLM-L6-v2")
manager = Manager(db)
manager.load_data()

@app.route('/')
def home():
    return "TrialMatch backend is live!"

@app.route('/register_patient', methods=['POST'])
def register_patient():
    data = request.json
    patient = Patient.from_dict(data)
    manager.add_patient(patient)
    return jsonify({'message': 'Patient registered.'}), 201

@app.route('/create_trial', methods=['POST'])
def create_trial():
    data = request.json
    trial = Trial.from_dict(data['id'], data)
    manager.add_trial(trial)
    return jsonify({'message': 'Trial created.'}), 201

@app.route('/express_interest', methods=['POST'])
def express_interest():
    data = request.json
    success = manager.express_interest(data['patient_id'], data['trial_id'])
    if success:
        return jsonify({'message': 'Interest recorded.'}), 200
    return jsonify({'error': 'Failed.'}), 400

@app.route('/patient/<patient_name>/matches', methods=['GET'])
def get_matches(patient_name):
    patient = manager.get_patient(patient_name)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    # Simple filter: return all trials
    results = [t.to_dict() for t in manager.trials.values()]
    return jsonify(results), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
