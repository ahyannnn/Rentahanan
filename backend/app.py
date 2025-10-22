from flask import Flask, jsonify, send_from_directory, current_app
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
from models.units_model import House
import os
from routes.auth_route import auth_bp
from routes.application_route import application_bp
from routes.tenant_route import tenant_bp
from routes.bill_route import bill_bp
from routes.contract_route import contract_bp
from routes.forgot_route import forgot_bp
from routes.units_route import houses_bp

load_dotenv()

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# ✅ Config
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["BREVO_API_KEY"] = os.getenv("BREVO_API_KEY")
app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads")

# ✅ Ensure upload folders exist
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
for sub in ["valid_ids", "brgy_clearances", "proof_of_income", "contracts", "houseimages", "signed_contracts"]:
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], sub), exist_ok=True)

# ✅ Initialize and register
db.init_app(app)
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(application_bp, url_prefix="/api")
app.register_blueprint(tenant_bp, url_prefix="/api")
app.register_blueprint(bill_bp, url_prefix="/api")
app.register_blueprint(contract_bp, url_prefix="/api")
app.register_blueprint(forgot_bp, url_prefix="/api")
app.register_blueprint(houses_bp, url_prefix="/api")

# Example routes
@app.route("/api/houses", methods=["GET"])
def get_houses():
    houses = House.query.all()
    return jsonify([h.to_dict() for h in houses])

@app.route("/api/ping")
def ping():
    return jsonify({"message": "pong"})

@app.route("/")
def home():
    return jsonify({"message": "Flask backend is running!"})

# ✅ Serve uploaded files (e.g. PDFs)
@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
