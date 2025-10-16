from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
from models.units_model import House
import os
from routes.auth_route import auth_bp
from routes.application_route import application_bp

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ✅ Proper CORS setup — allow your frontend origin
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Config
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Base folder for all uploads
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# You can optionally pre-create subfolders
for sub in ["valid_ids", "brgy_clearances", "proof_of_income"]:
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], sub), exist_ok=True)

# Initialize extensions
db.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(application_bp, url_prefix="/api")




# Example routes
@app.route("/api/houses", methods=["GET"])
def get_houses():
    houses = House.query.limit(5).all()
    return jsonify([h.to_dict() for h in houses])

@app.route("/api/ping")
def ping():
    return jsonify({"message": "pong"})

@app.route("/")
def home():
    return jsonify({"message": "Flask backend is running!"})


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
