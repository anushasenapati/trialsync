from flask import Flask, request, jsonify
import openai
import os
from flask_cors import CORS
import math
import firebase_admin
from firebase_admin import credentials, firestore
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer


# Your classes here or import from separate files if you modularize
# (Make sure you add from_dict() and to_dict() for Patient and Researcher)

# --- Your existing Patient class ---

class Patient:
    def __init__(self, name, age, sex, weight, height, diseases,
                 latitude, longitude, observ_score, interv_score, interventions="all", biomarkers="unknown"):
        self._name = name
        self._age = age
        self._sex = sex
        self._weight = weight
        self._height = height
        self._diseases = diseases
        self._biomarkers = biomarkers
        self._latitude = latitude
        self._longitude = longitude
        self._observ_score = observ_score
        self._interv_score = interv_score
        self._interventions = interventions
        self._interested_trials = []

    # Getters & Setters here...

    def get_name(self):
        return self._name

    def get_age(self):
        if self._age < 18:
            return "CHILD"
        elif self._age <= 65:
            return "ADULT"
        else:
            return "OLDER_ADULT"

    def get_sex(self):
        return self._sex

    def get_weight(self):
        return self._weight

    def get_height(self):
        return self._height

    def get_diseases(self):
        return self._diseases

    def get_biomarkers(self):
        return self._biomarkers

    def get_latitude(self):
        return self._latitude

    def get_longitude(self):
        return self._longitude

    def get_observ_score(self):
        return self._observ_score

    def get_interv_score(self):
        return self._interv_score

    def get_interventions(self):
        return self._interventions

    def get_interested_trials(self):
        return self._interested_trials

    def set_name(self, name):
        self._name = name

    def set_age(self, age):
        self._age = age

    def set_sex(self, sex):
        self._sex = sex

    def set_weight(self, weight):
        self._weight = weight

    def set_height(self, height):
        self._height = height

    def set_diseases(self, diseases):
        self._diseases = diseases

    def set_biomarkers(self, biomarkers):
        self._biomarkers = biomarkers

    def set_latitude(self, latitude):
        self._latitude = latitude

    def set_longitude(self, longitude):
        self._longitude = longitude

    def set_observ_score(self, score):
        self._observ_score = score

    def set_interv_score(self, score):
        self._interv_score = score

    def set_interventions(self, interventions):
        self._interventions = interventions

    def express_interest(self, trial_id):
        if trial_id not in self._interested_trials:
            self._interested_trials.append(trial_id)
            print(f"{self._name} has expressed interest in trial {trial_id}.")
        else:
            print(f"{self._name} has already expressed interest in trial {trial_id}.")

    # Serialize to dict for JSON or Firestore
    def to_dict(self):
        return {
            "name": self._name,
            "age": self._age,
            "sex": self._sex,
            "weight": self._weight,
            "height": self._height,
            "diseases": self._diseases,
            "biomarkers": self._biomarkers,
            "latitude": self._latitude,
            "longitude": self._longitude,
            "observ_score": self._observ_score,
            "interv_score": self._interv_score,
            "interventions": self._interventions,
            "interested_trials": self._interested_trials,
        }

    @staticmethod
    def from_dict(data):
        return Patient(
            name=data["name"],
            age=data["age"],
            sex=data["sex"],
            weight=data["weight"],
            height=data["height"],
            diseases=data.get("diseases", []),
            biomarkers=data.get("biomarkers", []),
            latitude=data["latitude"],
            longitude=data["longitude"],
            observ_score=data.get("observ_score", 0),
            interv_score=data.get("interv_score", 0),
            interventions=data.get("interventions", "all"),
        )


# --- Your existing Researcher class ---

class Researcher:
    def __init__(self, NCT_ID, Study_title, Study_Status, Conditions, Interventions,
                 sex, age, study_type, latitude, longitude, exclusions, biomarkers,
                 min_BMI, max_BMI):
        self._NCT_ID = NCT_ID
        self._Study_title = Study_title
        self._Study_Status = Study_Status
        self._Conditions = list(Conditions)
        self._Interventions = list(Interventions)
        self._sex = sex
        self._age = age
        self._study_type = study_type
        self._latitude = float(latitude)
        self._longitude = float(longitude)
        self._exclusions = list(exclusions)
        self._biomarkers = list(biomarkers)
        self._min_BMI = float(min_BMI)
        self._max_BMI = float(max_BMI)
        self._interested_patients = []

    # Getters & Setters here...

    def get_NCT_ID(self):
        return self._NCT_ID

    def get_Study_title(self):
        return self._Study_title

    def get_Study_Status(self):
        return self._Study_Status

    def get_Conditions(self):
        return self._Conditions

    def get_Interventions(self):
        return self._Interventions

    def get_sex(self):
        return self._sex

    def get_age(self):
        return self._age

    def get_study_type(self):
        return self._study_type

    def get_latitude(self):
        return self._latitude

    def get_longitude(self):
        return self._longitude

    def get_exclusions(self):
        return self._exclusions

    def get_biomarkers(self):
        return self._biomarkers

    def get_min_BMI(self):
        return self._min_BMI

    def get_max_BMI(self):
        return self._max_BMI

    def get_interested_patients(self):
        return self._interested_patients

    def set_NCT_ID(self, NCT_ID):
        self._NCT_ID = NCT_ID

    def set_Study_title(self, title):
        self._Study_title = title

    def set_Study_Status(self, status):
        self._Study_Status = status

    def set_Conditions(self, conditions):
        self._Conditions = conditions

    def set_Interventions(self, interventions):
        self._Interventions = interventions

    def set_sex(self, sex):
        self._sex = sex

    def set_age(self, age):
        self._age = age

    def set_study_type(self, study_type):
        self._study_type = study_type

    def set_latitude(self, latitude):
        self._latitude = latitude

    def set_longitude(self, longitude):
        self._longitude = longitude

    def set_exclusions(self, exclusions):
        self._exclusions = exclusions

    def set_biomarkers(self, biomarkers):
        self._biomarkers = biomarkers

    def set_min_BMI(self, bmi):
        self._min_BMI = bmi

    def set_max_BMI(self, bmi):
        self._max_BMI = bmi

    def add_interested_patient(self, patient_id):
        if patient_id not in self._interested_patients:
            self._interested_patients.append(patient_id)
            print(f"Patient {patient_id} has been added to trial {self._NCT_ID}.")
        else:
            print(f"Patient {patient_id} is already interested in trial {self._NCT_ID}.")

    def to_dict(self):
        return {
            "NCT_ID": self._NCT_ID,
            "Study_title": self._Study_title,
            "Study_Status": self._Study_Status,
            "Conditions": self._Conditions,
            "Interventions": self._Interventions,
            "sex": self._sex,
            "age": self._age,
            "study_type": self._study_type,
            "latitude": self._latitude,
            "longitude": self._longitude,
            "exclusions": self._exclusions,
            "biomarkers": self._biomarkers,
            "min_BMI": self._min_BMI,
            "max_BMI": self._max_BMI,
            "interested_patients": self._interested_patients,
        }

    @staticmethod
    def from_dict(data):
        return Researcher(
            NCT_ID=data["NCT_ID"],
            Study_title=data["Study_title"],
            Study_Status=data["Study_Status"],
            Conditions=data.get("Conditions", []),
            Interventions=data.get("Interventions", []),
            sex=data["sex"],
            age=data["age"],
            study_type=data["study_type"],
            latitude=data["latitude"],
            longitude=data["longitude"],
            exclusions=data.get("exclusions", []),
            biomarkers=data.get("biomarkers", []),
            min_BMI=data.get("min_BMI", 0),
            max_BMI=data.get("max_BMI", 100),
        )

# --- Manager class ---

class Manager:
    def __init__(self, db):
        self.db = db
        self.patients = {}
        self.researchers = {}

    def load_data(self):
        # Load patients as Patient objects
        patients_ref = self.db.collection('patients')
        for doc in patients_ref.stream():
            self.patients[doc.id] = Patient.from_dict(doc.to_dict())

        # Load researchers as Researcher objects
        researchers_ref = self.db.collection('researchers')
        for doc in researchers_ref.stream():
            self.researchers[doc.id] = Researcher.from_dict(doc.to_dict())

    def add_patient(self, patient):
        self.patients[patient.get_name()] = patient
        self.db.collection('patients').document(patient.get_name()).set(patient.to_dict())

    def add_researcher(self, researcher):
        self.researchers[researcher.get_NCT_ID()] = researcher
        self.db.collection('researchers').document(researcher.get_NCT_ID()).set(researcher.to_dict())

    def get_patient(self, patient_name):
        return self.patients.get(patient_name)

    def get_researcher(self, researcher_id):
        return self.researchers.get(researcher_id)

    def filter_matching_trials_by_age_sex_bmi(self, patient):
        matches = []
        for researcher_id, trial in self.researchers.items():
            # Fix: trial.get_age() is string, patient.get_age() is string; so do exact match or allow list
            age_match = (patient.get_age() == trial.get_age())
            sex_match = (trial.get_sex() == 'ALL') or (trial.get_sex() == patient.get_sex())
            bmi = patient.get_weight() / ((patient.get_height() / 100) ** 2)
            bmi_match = trial.get_min_BMI() <= bmi <= trial.get_max_BMI()

            exclusion_match = all(d not in trial.get_exclusions() for d in patient.get_diseases())

            # Biomarkers matching: assuming trial.get_biomarkers() returns list of tuples (name, min, max)
            trial_biomarkers = {b[0]: (b[1], b[2]) for b in trial.get_biomarkers()}
            biomarker_match = all(
                b[0] not in trial_biomarkers or trial_biomarkers[b[0]][0] <= b[1] <= trial_biomarkers[b[0]][1]
                for b in patient.get_biomarkers()
            )

            if age_match and sex_match and bmi_match and exclusion_match and biomarker_match:
                matches.append({
                    "researcher_id": researcher_id,
                    "Study_title": trial.get_Study_title(),
                    "Study_Status": trial.get_Study_Status(),
                })
        return matches

    def filter_trials_by_condition(self, patient_condition, similarity_threshold=0.6):
        # Using sentence transformer model for embeddings
        patient_embedding = model.encode([patient_condition])

        filtered = []
        for researcher_id, trial in self.researchers.items():
            trial_condition = ' '.join(trial.get_Conditions()) if isinstance(trial.get_Conditions(), list) else trial.get_Conditions()
            trial_embedding = model.encode([trial_condition])
            sim_score = cosine_similarity(patient_embedding, trial_embedding)[0][0]
            if sim_score >= similarity_threshold:
                filtered.append({
                    "researcher_id": researcher_id,
                    "Study_title": trial.get_Study_title(),
                    "similarity": sim_score
                })
        filtered.sort(key=lambda x: x['similarity'], reverse=True)
        return filtered

    def express_interest(self, patient_id, researcher_id):
        trial_ref = self.db.collection('researchers').document(researcher_id)
        trial_doc = trial_ref.get()
        if trial_doc.exists:
            data = trial_doc.to_dict()
            interested = data.get('interested_patients', [])
            if patient_id not in interested:
                interested.append(patient_id)
                trial_ref.update({'interested_patients': interested})
                return True
        return False

# --- Initialize Firebase Admin and Flask App ---

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


app = Flask(__name__)
CORS(app)  # Allow cross-origin for frontend requests

model = SentenceTransformer("all-MiniLM-L6-v2")

manager = Manager(db)
manager.load_data()


# Chatbot if time allows
# # Set an OpenAI key
# openai.api_key = os.getenv("OPENAI_API_KEY")  # Or set openai.api_key = "your-key"

# @app.route("/chat", methods=["POST"])
# def chat():
#     data = request.json
#     user_input = data.get("message", "")

#     if not user_input:
#         return jsonify({"error": "No message provided"}), 400

#     try:
#         response = openai.ChatCompletion.create(
#             model="gpt-4",
#             messages=[
#                 {"role": "system", "content": (
#                     "You are a helpful and friendly assistant for patients navigating clinical trials. "
#                     "Explain things in simple language. Guide patients based on their questions about trials, "
#                     "medical terms, or study options."
#                 )},
#                 {"role": "user", "content": user_input}
#             ]
#         )

#         reply = response['choices'][0]['message']['content']
#         return jsonify({"reply": reply})

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# --- Flask routes ---

@app.route("/register_patient", methods=["POST"])
def register_patient():
    data = request.json
    try:
        patient = Patient.from_dict(data)
        manager.add_patient(patient)
        return jsonify({"message": "Patient registered successfully."}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/register_researcher", methods=["POST"])
def register_researcher():
    data = request.json
    try:
        researcher = Researcher.from_dict(data)
        manager.add_researcher(researcher)
        return jsonify({"message": "Researcher registered successfully."}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/patient/<patient_name>/matches", methods=["GET"])
def get_matches(patient_name):
    patient = manager.get_patient(patient_name)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    matches = manager.filter_matching_trials_by_age_sex_bmi(patient)
    return jsonify(matches), 200


@app.route("/patient/<patient_name>/condition_filter", methods=["POST"])
def filter_condition(patient_name):
    data = request.json
    patient = manager.get_patient(patient_name)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    patient_condition = data.get("condition", "")
    if not patient_condition:
        return jsonify({"error": "Condition is required"}), 400

    filtered = manager.filter_trials_by_condition(patient_condition)
    return jsonify(filtered), 200


@app.route("/express_interest", methods=["POST"])
def express_interest():
    data = request.json
    patient_id = data.get("patient_id")
    researcher_id = data.get("researcher_id")
    if not patient_id or not researcher_id:
        return jsonify({"error": "Missing patient_id or researcher_id"}), 400

    success = manager.express_interest(patient_id, researcher_id)
    if success:
        return jsonify({"message": f"Patient {patient_id} expressed interest in trial {researcher_id}"}), 200
    else:
        return jsonify({"error": "Failed to express interest or trial not found"}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
